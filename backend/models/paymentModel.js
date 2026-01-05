const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  studentId: String,
  courseId: String,
  method: String,  // bkash / nagad
  amount: Number,
  status: { type: String, default: "success" },
  createdAt: { type: Date, default: Date.now },
});


const paymentModel = mongoose.model("Payment", paymentSchema);

module.exports = paymentModel;

