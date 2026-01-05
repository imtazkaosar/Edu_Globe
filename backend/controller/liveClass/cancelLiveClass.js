const liveClassModel = require("../../models/liveClassModel");

async function cancelLiveClass(req, res) {
  try {
    const teacherId = req.userId;
    const { liveClassId } = req.params;

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
        message: "You cannot cancel this class",
        success: false,
        error: true,
      });
    }

    liveClass.status = "cancelled";
    await liveClass.save();

    res.json({
      message: "Live class cancelled",
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

module.exports = cancelLiveClass;
