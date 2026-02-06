const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
    },
    // Academic Information
    currentEducation: {
      level: String, // High School, Bachelor's, Master's, etc.
      institution: String,
      gpa: Number,
      cgpa: Number,
      percentage: Number,
      graduationYear: Number,
    },
    // Test Scores
    testScores: {
      ielts: {
        overall: Number,
        listening: Number,
        reading: Number,
        writing: Number,
        speaking: Number,
      },
      toefl: {
        overall: Number,
      },
      gre: {
        verbal: Number,
        quantitative: Number,
        analyticalWriting: Number,
        total: Number,
      },
      gmat: {
        total: Number,
      },
      sat: {
        total: Number,
      },
      act: {
        total: Number,
      },
    },
    // Financial Information
    financialInfo: {
      maxBudgetPerYear: Number,
      currency: {
        type: String,
        default: "USD",
      },
      needsScholarship: {
        type: Boolean,
        default: false,
      },
      scholarshipPercentage: Number, // 0-100
    },
    // Extracurricular Activities
    extracurricularActivities: [
      {
        activity: String,
        description: String,
        duration: String,
        achievements: String,
      },
    ],
    // Preferred Study Details
    preferences: {
      preferredCountries: [String],
      preferredFields: [String], // Engineering, Business, Medicine, etc.
      degreeLevel: String, // Bachelor's, Master's, PhD
      programType: String, // Full-time, Part-time
    },
    // Additional Information
    workExperience: [
      {
        company: String,
        position: String,
        duration: String,
        description: String,
      },
    ],
    researchExperience: [
      {
        title: String,
        description: String,
        duration: String,
      },
    ],
    publications: [
      {
        title: String,
        journal: String,
        year: Number,
      },
    ],
    awards: [String],
    languages: [
      {
        language: String,
        proficiency: String, // Native, Fluent, Intermediate, Basic
      },
    ],
    additionalInfo: String,
  },
  {
    timestamps: true,
  }
);

const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);

module.exports = StudentProfile;
