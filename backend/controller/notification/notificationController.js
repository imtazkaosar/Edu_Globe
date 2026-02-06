const Notification = require("../../models/notificationModel");
const Course = require("../../models/courseModel");

/* =========================
   Get notifications by student
   ========================= */
exports.getNotificationsByStudent = async (req, res) => {
  const { studentId } = req.query;

  if (!studentId) {
    return res.status(400).json({ message: "studentId is required" });
  }

  try {
    const notifications = await Notification.find({ studentId })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 notifications

    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Server error while fetching notifications" });
  }
};

/* =========================
   Get unread notification count
   ========================= */
exports.getUnreadNotificationCount = async (req, res) => {
  const { studentId } = req.query;

  if (!studentId) {
    return res.status(400).json({ message: "studentId is required" });
  }

  try {
    const count = await Notification.countDocuments({
      studentId,
      isRead: false,
    });

    res.json({ count });
  } catch (err) {
    console.error("Error fetching unread count:", err);
    res.status(500).json({ message: "Server error while fetching unread count" });
  }
};

/* =========================
   Mark notification as read
   ========================= */
exports.markNotificationAsRead = async (req, res) => {
  const { notificationId } = req.body;

  if (!notificationId) {
    return res.status(400).json({ message: "notificationId is required" });
  }

  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      {
        isRead: true,
        readAt: new Date(),
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ success: true, notification });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ message: "Server error while updating notification" });
  }
};

/* =========================
   Mark all notifications as read
   ========================= */
exports.markAllNotificationsAsRead = async (req, res) => {
  const { studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({ message: "studentId is required" });
  }

  try {
    await Notification.updateMany(
      { studentId, isRead: false },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    console.error("Error marking all notifications as read:", err);
    res.status(500).json({ message: "Server error while updating notifications" });
  }
};

/* =========================
   Create notification (helper function)
   ========================= */
exports.createNotification = async (studentId, type, title, message, courseId, courseName, relatedId) => {
  try {
    const notification = new Notification({
      studentId,
      type,
      title,
      message,
      courseId,
      courseName,
      relatedId,
    });

    await notification.save();
    return notification;
  } catch (err) {
    console.error("Error creating notification:", err);
    throw err;
  }
};

/* =========================
   Create notifications for all students in a course
   ========================= */
exports.createNotificationsForCourse = async (courseId, type, title, message, relatedId) => {
  try {
    const course = await Course.findById(courseId);
    if (!course) {
      console.error("Course not found:", courseId);
      return;
    }

    const studentsEnrolledIds = course.studentsEnrolledIds || [];
    
    if (studentsEnrolledIds.length === 0) {
      return; // No students enrolled
    }

    const notifications = studentsEnrolledIds.map((studentId) => ({
      studentId,
      type,
      title,
      message,
      courseId,
      courseName: course.Course_Name || course.Course_Initial || "Course",
      relatedId,
      isRead: false,
    }));

    await Notification.insertMany(notifications);
    console.log(`Created ${notifications.length} notifications for course ${courseId}`);
  } catch (err) {
    console.error("Error creating notifications for course:", err);
    throw err;
  }
};

/* =========================
   Create notification for a specific student
   ========================= */
exports.createNotificationForStudent = async (studentId, type, title, message, courseId, courseName, relatedId) => {
  try {
    const notification = new Notification({
      studentId,
      type,
      title,
      message,
      courseId,
      courseName,
      relatedId,
    });

    await notification.save();
    return notification;
  } catch (err) {
    console.error("Error creating notification for student:", err);
    throw err;
  }
};
