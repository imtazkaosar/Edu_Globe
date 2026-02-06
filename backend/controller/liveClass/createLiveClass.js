const liveClassModel = require("../../models/liveClassModel");
const courseModel = require("../../models/courseModel");

async function createLiveClass(req, res) {
    console.log(req.body)
  try {
    const teacherId = req.userId;
    
    const { 
      courseId,
      title,
      description,
      startTime,
      durationMinutes,
      platform,
      meetingLink,
      meetingPassword
    } = req.body;


    // Verify course ownership
    const course = await courseModel.findById(courseId);
    console.log(teacherId)
    console.log(course.instructorId)
    if (!course || course.instructorId !== teacherId) {
      return res.status(403).json({
        message: "You are not allowed to add live class to this course",
        success: false,
        error: true,
      });
    }

    const liveClass = await liveClassModel.create({
      courseId,
      teacherId,
      title,
      description,
      startTime,
      durationMinutes,
      platform,
      meetingLink,
      meetingPassword,
    });

    res.json({
      message: "Live class created successfully",
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

module.exports = createLiveClass;
