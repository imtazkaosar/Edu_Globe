const StudentProfile = require("../../models/studentProfileModel");
const axios = require("axios");

/* =========================
   Get University Suggestions using AI
   ========================= */
exports.getUniversitySuggestions = async (req, res) => {
  const { studentId, message } = req.body;

  if (!studentId) {
    return res.status(400).json({ message: "studentId is required" });
  }

  try {
    // Get student profile
    const profile = await StudentProfile.findOne({ studentId });

    if (!profile) {
      return res.status(404).json({
        message: "Student profile not found. Please complete your profile first.",
      });
    }

    // Build context from profile
    const context = buildProfileContext(profile);

    // Prepare prompt for AI
    const prompt = buildAIPrompt(context, message);

    // Call OpenAI API (or fallback to a simpler approach)
    let suggestions;
    if (process.env.OPENAI_API_KEY) {
      suggestions = await getOpenAISuggestions(prompt);
    } else {
      // Fallback: Use rule-based suggestions
      suggestions = getRuleBasedSuggestions(profile);
    }

    res.json({
      success: true,
      suggestions,
      profile: {
        gpa: profile.currentEducation?.gpa || profile.currentEducation?.cgpa,
        ielts: profile.testScores?.ielts?.overall,
        budget: profile.financialInfo?.maxBudgetPerYear,
        preferredCountries: profile.preferences?.preferredCountries,
      },
    });
  } catch (err) {
    console.error("Error getting university suggestions:", err);
    res.status(500).json({
      message: "Server error while getting suggestions",
      error: err.message,
    });
  }
};

/* =========================
   Build Profile Context
   ========================= */
function buildProfileContext(profile) {
  let context = "Student Profile:\n";

  // Academic Information
  if (profile.currentEducation) {
    context += `- Education Level: ${profile.currentEducation.level || "Not specified"}\n`;
    context += `- Current Institution: ${profile.currentEducation.institution || "Not specified"}\n`;
    if (profile.currentEducation.gpa) {
      context += `- GPA: ${profile.currentEducation.gpa}/4.0\n`;
    } else if (profile.currentEducation.cgpa) {
      context += `- CGPA: ${profile.currentEducation.cgpa}/10.0\n`;
    } else if (profile.currentEducation.percentage) {
      context += `- Percentage: ${profile.currentEducation.percentage}%\n`;
    }
    context += `- Graduation Year: ${profile.currentEducation.graduationYear || "Not specified"}\n`;
  }

  // Test Scores
  if (profile.testScores) {
    context += "\nTest Scores:\n";
    if (profile.testScores.ielts?.overall) {
      context += `- IELTS: ${profile.testScores.ielts.overall} (L:${profile.testScores.ielts.listening} R:${profile.testScores.ielts.reading} W:${profile.testScores.ielts.writing} S:${profile.testScores.ielts.speaking})\n`;
    }
    if (profile.testScores.toefl?.overall) {
      context += `- TOEFL: ${profile.testScores.toefl.overall}\n`;
    }
    if (profile.testScores.gre?.total) {
      context += `- GRE: ${profile.testScores.gre.total} (V:${profile.testScores.gre.verbal} Q:${profile.testScores.gre.quantitative} AW:${profile.testScores.gre.analyticalWriting})\n`;
    }
    if (profile.testScores.gmat?.total) {
      context += `- GMAT: ${profile.testScores.gmat.total}\n`;
    }
  }

  // Financial Information
  if (profile.financialInfo) {
    context += `\nFinancial Information:\n`;
    context += `- Maximum Budget per Year: ${profile.financialInfo.maxBudgetPerYear || "Not specified"} ${profile.financialInfo.currency || "USD"}\n`;
    context += `- Needs Scholarship: ${profile.financialInfo.needsScholarship ? "Yes" : "No"}\n`;
    if (profile.financialInfo.scholarshipPercentage) {
      context += `- Scholarship Requirement: ${profile.financialInfo.scholarshipPercentage}%\n`;
    }
  }

  // Preferences
  if (profile.preferences) {
    context += `\nPreferences:\n`;
    if (profile.preferences.preferredCountries?.length > 0) {
      context += `- Preferred Countries: ${profile.preferences.preferredCountries.join(", ")}\n`;
    }
    if (profile.preferences.preferredFields?.length > 0) {
      context += `- Preferred Fields: ${profile.preferences.preferredFields.join(", ")}\n`;
    }
    context += `- Degree Level: ${profile.preferences.degreeLevel || "Not specified"}\n`;
  }

  // Extracurricular Activities
  if (profile.extracurricularActivities?.length > 0) {
    context += `\nExtracurricular Activities:\n`;
    profile.extracurricularActivities.forEach((activity, idx) => {
      context += `${idx + 1}. ${activity.activity} - ${activity.description || ""}\n`;
    });
  }

  // Work Experience
  if (profile.workExperience?.length > 0) {
    context += `\nWork Experience:\n`;
    profile.workExperience.forEach((exp, idx) => {
      context += `${idx + 1}. ${exp.position} at ${exp.company} (${exp.duration})\n`;
    });
  }

  return context;
}

/* =========================
   Build AI Prompt
   ========================= */
function buildAIPrompt(context, userMessage) {
  return `You are an expert university admission counselor. Based on the following student profile, suggest 5-8 universities that would be a good fit. Consider:

1. Academic qualifications match
2. Test scores meet requirements
3. Budget constraints
4. Preferred countries and fields
5. Scholarship opportunities if needed
6. Overall fit and competitiveness

${context}

${userMessage ? `Student's additional question/requirement: ${userMessage}` : ""}

Provide suggestions in JSON format with the following structure:
{
  "universities": [
    {
      "name": "University Name",
      "country": "Country",
      "rank": "World Ranking",
      "matchScore": "Percentage match (0-100)",
      "tuitionFee": "Annual tuition fee",
      "scholarshipAvailable": true/false,
      "requirements": ["requirement1", "requirement2"],
      "whyMatch": "Brief explanation why this university matches",
      "applicationDeadline": "Deadline date",
      "website": "University website URL"
    }
  ],
  "summary": "Brief summary of recommendations"
}

Be realistic and consider the student's profile. If the profile is incomplete, mention what information is needed.`;
}

/* =========================
   Get OpenAI Suggestions
   ========================= */
async function getOpenAISuggestions(prompt) {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert university admission counselor. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data.choices[0].message.content;
    // Try to parse JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(content);
  } catch (err) {
    console.error("OpenAI API Error:", err);
    throw err;
  }
}

/* =========================
   Rule-Based Suggestions (Fallback)
   ========================= */
function getRuleBasedSuggestions(profile) {
  const suggestions = {
    universities: [],
    summary: "Based on your profile, here are some university suggestions:",
  };

  // This is a simplified rule-based approach
  // In production, you'd want a more sophisticated matching algorithm
  const gpa = profile.currentEducation?.gpa || profile.currentEducation?.cgpa || 0;
  const ielts = profile.testScores?.ielts?.overall || 0;
  const budget = profile.financialInfo?.maxBudgetPerYear || 50000;
  const preferredCountries = profile.preferences?.preferredCountries || [];

  // Sample universities based on profile
  const allUniversities = [
    {
      name: "Massachusetts Institute of Technology (MIT)",
      country: "United States",
      rank: "1",
      matchScore: gpa >= 3.8 && ielts >= 7 ? "85" : "60",
      tuitionFee: "$53,450",
      scholarshipAvailable: true,
      requirements: ["High GPA (3.8+)", "IELTS 7.0+", "Strong extracurriculars"],
      whyMatch: "Top-ranked university if you have excellent academic credentials",
    },
    {
      name: "Harvard University",
      country: "United States",
      rank: "3",
      matchScore: gpa >= 3.7 ? "80" : "55",
      tuitionFee: "$54,269",
      scholarshipAvailable: true,
      requirements: ["High GPA", "IELTS 7.0+", "Outstanding profile"],
      whyMatch: "Prestigious institution with generous financial aid",
    },
    {
      name: "University of Oxford",
      country: "United Kingdom",
      rank: "4",
      matchScore: ielts >= 7.5 ? "75" : "50",
      tuitionFee: "£26,770 - £37,510",
      scholarshipAvailable: true,
      requirements: ["IELTS 7.5+", "Strong academic record"],
      whyMatch: "World-class education in the UK",
    },
    {
      name: "University of Toronto",
      country: "Canada",
      rank: "21",
      matchScore: ielts >= 6.5 ? "70" : "45",
      tuitionFee: "CAD $45,000 - $60,000",
      scholarshipAvailable: true,
      requirements: ["IELTS 6.5+", "Good academic record"],
      whyMatch: "Excellent value and quality education",
    },
    {
      name: "University of Melbourne",
      country: "Australia",
      rank: "33",
      matchScore: ielts >= 6.5 ? "65" : "40",
      tuitionFee: "AUD $30,000 - $45,000",
      scholarshipAvailable: true,
      requirements: ["IELTS 6.5+", "Good academic record"],
      whyMatch: "Great option for international students",
    },
  ];

  // Filter and sort by match score
  suggestions.universities = allUniversities
    .filter((uni) => {
      if (preferredCountries.length > 0) {
        return preferredCountries.some((country) =>
          uni.country.toLowerCase().includes(country.toLowerCase())
        );
      }
      return true;
    })
    .sort((a, b) => parseInt(b.matchScore) - parseInt(a.matchScore))
    .slice(0, 6);

  return suggestions;
}
