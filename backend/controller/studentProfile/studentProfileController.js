const StudentProfile = require("../../models/studentProfileModel");

/* =========================
   Create or Update Student Profile
   ========================= */
exports.createOrUpdateProfile = async (req, res) => {
  const { studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({ message: "studentId is required" });
  }

  try {
    const profileData = { ...req.body };
    delete profileData.studentId; // Remove studentId from update data

    const profile = await StudentProfile.findOneAndUpdate(
      { studentId },
      { studentId, ...profileData },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Profile saved successfully",
      profile,
    });
  } catch (err) {
    console.error("Error saving profile:", err);
    res.status(500).json({
      message: "Server error while saving profile",
      error: err.message,
    });
  }
};

/* =========================
   Get Student Profile
   ========================= */
exports.getStudentProfile = async (req, res) => {
  const { studentId } = req.query;

  if (!studentId) {
    return res.status(400).json({ message: "studentId is required" });
  }

  try {
    const profile = await StudentProfile.findOne({ studentId });

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
        profile: null,
      });
    }

    res.json(profile);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({
      message: "Server error while fetching profile",
    });
  }
};
