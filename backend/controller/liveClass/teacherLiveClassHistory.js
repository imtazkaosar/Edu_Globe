const liveClassModel = require("../../models/liveClassModel");

async function teacherLiveClassHistory(req, res) {
  try {
    const teacherId = req.userId;

    const liveClasses = await liveClassModel
      .find({ teacherId })
      .sort({ createdAt: -1 });

    res.json({
      message: "Teacher live class history",
      data: liveClasses,
      success: true,
      error: false,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message || err,
      success: false,
      error: true,
    });
  }
}

module.exports = teacherLiveClassHistory;
