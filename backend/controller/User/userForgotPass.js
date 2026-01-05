// controllers/user/userForgotPass.js
const userModel = require("../../models/userModel");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// configure nodemailer transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // sender email
    pass: process.env.EMAIL_PASS, // app password
  },
});

async function userForgotPass(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      throw new Error("Please provide email");
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    // Generate reset token (valid 15 min)

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.TOKEN_SECRET_KEY,
      { expiresIn: "15m" }
    );

    // Save token and expiry in DB
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Reset link (goes to frontend)
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    // Email
    const mailOptions = {
      from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello ${user.name || "User"},</p>
        <p>You requested to reset your password. Click below:</p>
        <a href="${resetLink}" style="color:#fff; background:#f59e0b; padding:10px 20px; border-radius:5px; text-decoration:none;">
          Reset Password
        </a>
        <p>This link will expire in 15 minutes.</p>
        <br/>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      message: "Password reset link sent to your email",
      success: true,
      error: false,
    });
  } catch (err) {
    res.json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
}

module.exports = userForgotPass;
