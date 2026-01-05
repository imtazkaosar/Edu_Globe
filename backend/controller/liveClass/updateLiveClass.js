const liveClassModel = require("../../models/liveClassModel");

async function updateLiveClass(req, res) {
  try {
    const teacherId = req.userId;
    const { liveClassId } = req.params;
    const { startTime, durationMinutes, title, description } = req.body;

    const liveClass = await liveClassModel.findById(liveClassId);

    if (!liveClass) {
      return res.status(404).json({
        message: "Live class not found",
        success: false,
        error: true,
      });
    }

    if (liveClass.teacherId !== teacherId.toString()) {
      return res.status(403).json({
        message: "You cannot edit this live class",
        success: false,
        error: true,
      });
    }

    if (startTime) liveClass.startTime = startTime;
    if (durationMinutes) liveClass.durationMinutes = durationMinutes;
    if (title) liveClass.title = title;
    if (description) liveClass.description = description;

    await liveClass.save();

    res.json({
      message: "Live class updated successfully",
      data: liveClass,
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

module.exports = updateLiveClass;
