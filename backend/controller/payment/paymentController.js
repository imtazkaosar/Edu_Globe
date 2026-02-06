const Payment = require("../../models/paymentModel");
const Course = require("../../models/courseModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/* =========================
   Create Payment Intent
   ========================= */
exports.createPaymentIntent = async (req, res) => {
  const { studentId, courseId, amount, currency = "usd" } = req.body;

  if (!studentId || !courseId || !amount) {
    return res.status(400).json({
      message: "studentId, courseId, and amount are required",
    });
  }

  try {
    // Get course details
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Create payment record
    const payment = new Payment({
      studentId,
      courseId,
      courseName: course.Course_Name || course.Course_Initial,
      amount: amount * 100, // Convert to cents
      currency: currency.toLowerCase(),
      status: "pending",
    });

    await payment.save();

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Amount in cents
      currency: currency.toLowerCase(),
      metadata: {
        studentId,
        courseId,
        paymentId: payment._id.toString(),
      },
      description: `Payment for course: ${course.Course_Name}`,
    });

    // Update payment with Stripe details
    payment.stripePaymentIntentId = paymentIntent.id;
    payment.stripeClientSecret = paymentIntent.client_secret;
    await payment.save();

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
    });
  } catch (err) {
    console.error("Error creating payment intent:", err);
    res.status(500).json({
      message: "Server error while creating payment intent",
      error: err.message,
    });
  }
};

/* =========================
   Confirm Payment
   ========================= */
exports.confirmPayment = async (req, res) => {
  const { paymentId, paymentIntentId } = req.body;

  if (!paymentId || !paymentIntentId) {
    return res.status(400).json({
      message: "paymentId and paymentIntentId are required",
    });
  }

  try {
    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Update payment record
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (paymentIntent.status === "succeeded") {
      payment.status = "succeeded";
      payment.transactionId = paymentIntent.id;
      payment.receiptUrl = paymentIntent.charges.data[0]?.receipt_url || null;

      // Enroll student in course
      const course = await Course.findById(payment.courseId);
      if (course) {
        if (!course.studentsEnrolledIds.includes(payment.studentId)) {
          course.studentsEnrolledIds.push(payment.studentId);
          await course.save();
        }
      }

      await payment.save();

      res.json({
        success: true,
        message: "Payment confirmed successfully",
        payment,
      });
    } else {
      payment.status = paymentIntent.status;
      await payment.save();

      res.status(400).json({
        success: false,
        message: `Payment ${paymentIntent.status}`,
        payment,
      });
    }
  } catch (err) {
    console.error("Error confirming payment:", err);
    res.status(500).json({
      message: "Server error while confirming payment",
      error: err.message,
    });
  }
};

/* =========================
   Get Payment History
   ========================= */
exports.getPaymentHistory = async (req, res) => {
  const { studentId } = req.query;

  if (!studentId) {
    return res.status(400).json({ message: "studentId is required" });
  }

  try {
    const payments = await Payment.find({ studentId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(payments);
  } catch (err) {
    console.error("Error fetching payment history:", err);
    res.status(500).json({
      message: "Server error while fetching payment history",
    });
  }
};

/* =========================
   Webhook Handler (for Stripe webhooks)
   ========================= */
exports.handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      // Update payment status
      await Payment.updateOne(
        { stripePaymentIntentId: paymentIntent.id },
        {
          status: "succeeded",
          transactionId: paymentIntent.id,
        }
      );
      break;
    case "payment_intent.payment_failed":
      const failedPayment = event.data.object;
      await Payment.updateOne(
        { stripePaymentIntentId: failedPayment.id },
        { status: "failed" }
      );
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};
