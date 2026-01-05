// controllers/user/userResetPass.js
const bcrypt = require("bcryptjs");
const userModel = require("../../models/userModel");
const jwt = require("jsonwebtoken");

async function userResetPass(req, res) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      throw new Error("Token and password are required");
    }

    // Find user with this reset token
    const user = await userModel.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() } // token not expired
    });

    if (!user) {
      throw new Error("Invalid or expired token");
    }

    // Verify token
    jwt.verify(token, process.env.TOKEN_SECRET_KEY);

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    user.password = hashedPass;

    // Remove token so it can't be used again
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json({
      message: "Password has been reset successfully",
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


module.exports = userResetPass;
