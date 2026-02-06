const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
    },
    courseId: {
      type: String,
      required: true,
    },
    courseName: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    paymentMethod: {
      type: String,
      enum: ["stripe", "paypal", "bkash", "nagad"],
      default: "stripe",
    },
    stripePaymentIntentId: {
      type: String,
    },
    stripeClientSecret: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "succeeded", "failed", "canceled", "refunded"],
      default: "pending",
    },
    transactionId: {
      type: String,
    },
    receiptUrl: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
