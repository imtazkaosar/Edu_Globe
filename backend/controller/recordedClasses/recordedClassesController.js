const RecordedClass = require("../../models/recordedClassModel");

/**
 * CREATE a recorded class
 */
exports.createRecordedClass = async (req, res) => {
  try {
     const teacherId = req.userId;
    const {
      courseId,
      title,
      description,
      videoUrl,
      duration,
      isPublished,
    } = req.body;

    if (!courseId || !teacherId || !title || !videoUrl || !duration) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const recordedClass = await RecordedClass.create({
      courseId,
      teacherId,
      title,
      description,
      videoUrl,
      duration,
      isPublished,
    });

    res.status(201).json({
      success: true,
      data: recordedClass,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * READ all recorded classes (optionally by courseId)
 */
exports.getRecordedClasses = async (req, res) => {
  try {
    const { courseId } = req.query;

    const filter = courseId ? { courseId } : {};

    const classes = await RecordedClass.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * READ single recorded class by ID
 */
exports.getRecordedClassById = async (req, res) => {
  try {
    const recordedClass = await RecordedClass.findById(req.params.id);

    if (!recordedClass) {
      return res.status(404).json({
        success: false,
        message: "Recorded class not found",
      });
    }

    res.status(200).json({
      success: true,
      data: recordedClass,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * UPDATE recorded class
 */
exports.updateRecordedClass = async (req, res) => {
  try {
    const updatedClass = await RecordedClass.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedClass) {
      return res.status(404).json({
        success: false,
        message: "Recorded class not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedClass,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * DELETE recorded class
 */
exports.deleteRecordedClass = async (req, res) => {
  try {
    const deletedClass = await RecordedClass.findByIdAndDelete(req.params.id);

    if (!deletedClass) {
      return res.status(404).json({
        success: false,
        message: "Recorded class not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Recorded class deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
