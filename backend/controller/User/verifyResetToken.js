// controllers/user/verifyResetToken.js
const userModel = require("../../models/userModel");
const jwt = require("jsonwebtoken");

async function verifyResetToken(req, res) {
  try {
    const { token } = req.params;

    if (!token) throw new Error("Token is required");

    // Find user with token
    const user = await userModel.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) throw new Error("Invalid or expired token");

    // Optional: verify JWT signature
    jwt.verify(token, process.env.TOKEN_SECRET_KEY);

    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
}

module.exports = verifyResetToken;
