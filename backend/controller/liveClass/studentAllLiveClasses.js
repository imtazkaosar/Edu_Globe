const liveClassModel = require("../../models/liveClassModel");
const courseModel = require("../../models/courseModel");

async function studentAllLiveClasses(req, res) {
  try {
    const studentId = req.userId;
    console.log(studentId)

    // 1. Find all courses where student is enrolled
    const enrolledCourses = await courseModel.find({
      studentsEnrolledIds: studentId,
    }).select("_id");
     console.log(enrolledCourses)
    

    // 2. Extract course IDs
    const courseIds = enrolledCourses.map(course => course._id.toString());

    // 3. Find all live classes for those courses
    const liveClasses = await liveClassModel.find({
      courseId: { $in: courseIds },
    }).sort({ startTime: 1 });

    res.json({
      message: "All available live classes",
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

module.exports = studentAllLiveClasses;
