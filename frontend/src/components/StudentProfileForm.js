import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Save, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import SummaryApi from '../common';

const StudentProfileForm = ({ onSave, initialData }) => {
  const user = useSelector((state) => state?.user?.user);
  const studentId = user?._id || user?.id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentEducation: {
      level: '',
      institution: '',
      gpa: '',
      cgpa: '',
      percentage: '',
      graduationYear: '',
    },
    testScores: {
      ielts: {
        overall: '',
        listening: '',
        reading: '',
        writing: '',
        speaking: '',
      },
      toefl: { overall: '' },
      gre: {
        verbal: '',
        quantitative: '',
        analyticalWriting: '',
        total: '',
      },
      gmat: { total: '' },
      sat: { total: '' },
      act: { total: '' },
    },
    financialInfo: {
      maxBudgetPerYear: '',
      currency: 'USD',
      needsScholarship: false,
      scholarshipPercentage: '',
    },
    extracurricularActivities: [],
    preferences: {
      preferredCountries: [],
      preferredFields: [],
      degreeLevel: '',
      programType: '',
    },
    workExperience: [],
    researchExperience: [],
    publications: [],
    awards: [],
    languages: [],
    additionalInfo: '',
  });

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 1) {
      // Merge initial data with default structure to ensure all fields exist
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        currentEducation: {
          ...prev.currentEducation,
          ...(initialData.currentEducation || {}),
        },
        testScores: {
          ...prev.testScores,
          ...(initialData.testScores || {}),
          ielts: {
            ...prev.testScores.ielts,
            ...(initialData.testScores?.ielts || {}),
          },
          toefl: {
            ...prev.testScores.toefl,
            ...(initialData.testScores?.toefl || {}),
          },
          gre: {
            ...prev.testScores.gre,
            ...(initialData.testScores?.gre || {}),
          },
        },
        financialInfo: {
          ...prev.financialInfo,
          ...(initialData.financialInfo || {}),
        },
        preferences: {
          ...prev.preferences,
          ...(initialData.preferences || {}),
        },
        extracurricularActivities: initialData.extracurricularActivities || prev.extracurricularActivities,
        workExperience: initialData.workExperience || prev.workExperience,
        researchExperience: initialData.researchExperience || prev.researchExperience,
        publications: initialData.publications || prev.publications,
        awards: initialData.awards || prev.awards,
        languages: initialData.languages || prev.languages,
      }));
    }
  }, [initialData]);

  const handleChange = (path, value) => {
    const keys = path.split('.');
    setFormData((prev) => {
      const newData = { ...prev };
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleNestedChange = (path, field, value) => {
    const keys = path.split('.');
    setFormData((prev) => {
      const newData = { ...prev };
      let current = newData;
      for (const key of keys) {
        current = current[key];
      }
      current[field] = value;
      return newData;
    });
  };

  const addArrayItem = (path, item = {}) => {
    const keys = path.split('.');
    setFormData((prev) => {
      const newData = { ...prev };
      let current = newData;
      for (const key of keys) {
        current = current[key];
      }
      current.push(item);
      return newData;
    });
  };

  const removeArrayItem = (path, index) => {
    const keys = path.split('.');
    setFormData((prev) => {
      const newData = { ...prev };
      let current = newData;
      for (const key of keys) {
        current = current[key];
      }
      current.splice(index, 1);
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId) {
      toast.error('Student ID not found');
      return;
    }

    setLoading(true);
    try {
      // Clean up empty strings and convert to numbers where needed
      const cleanedData = JSON.parse(JSON.stringify(formData));
      
      // Convert string numbers to actual numbers
      const convertNumbers = (obj) => {
        for (const key in obj) {
          if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            convertNumbers(obj[key]);
          } else if (typeof obj[key] === 'string' && obj[key] !== '' && !isNaN(obj[key]) && !isNaN(parseFloat(obj[key]))) {
            obj[key] = parseFloat(obj[key]);
          } else if (obj[key] === '') {
            delete obj[key];
          }
        }
      };
      convertNumbers(cleanedData);

      const res = await fetch(SummaryApi.createOrUpdateProfile.url, {
        method: SummaryApi.createOrUpdateProfile.method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          studentId,
          ...cleanedData,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Profile saved successfully!');
        if (onSave) onSave(data.profile);
      } else {
        toast.error(data.message || 'Failed to save profile');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const countries = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Singapore', 'Japan', 'China', 'Switzerland'];
  const fields = ['Engineering', 'Business', 'Medicine', 'Law', 'Arts', 'Science', 'Computer Science', 'Education', 'Social Sciences', 'Other'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Academic Information */}
      <div className="glass rounded-xl p-6 border border-gray-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Academic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Education Level</label>
            <select
              value={formData.currentEducation.level}
              onChange={(e) => handleNestedChange('currentEducation', 'level', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              <option value="">Select Level</option>
              <option value="High School">High School</option>
              <option value="Bachelor's">Bachelor's</option>
              <option value="Master's">Master's</option>
              <option value="PhD">PhD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Institution</label>
            <input
              type="text"
              value={formData.currentEducation.institution}
              onChange={(e) => handleNestedChange('currentEducation', 'institution', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              placeholder="Your current institution"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GPA (out of 4.0)</label>
            <input
              type="number"
              step="0.01"
              max="4.0"
              value={formData.currentEducation.gpa}
              onChange={(e) => handleNestedChange('currentEducation', 'gpa', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              placeholder="3.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CGPA (out of 10.0)</label>
            <input
              type="number"
              step="0.01"
              max="10.0"
              value={formData.currentEducation.cgpa}
              onChange={(e) => handleNestedChange('currentEducation', 'cgpa', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              placeholder="8.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Percentage</label>
            <input
              type="number"
              step="0.01"
              max="100"
              value={formData.currentEducation.percentage}
              onChange={(e) => handleNestedChange('currentEducation', 'percentage', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              placeholder="85"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Graduation Year</label>
            <input
              type="number"
              value={formData.currentEducation.graduationYear}
              onChange={(e) => handleNestedChange('currentEducation', 'graduationYear', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              placeholder="2024"
            />
          </div>
        </div>
      </div>

      {/* Test Scores */}
      <div className="glass rounded-xl p-6 border border-gray-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Test Scores</h3>
        
        {/* IELTS */}
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">IELTS</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <input type="number" step="0.5" max="9" placeholder="Overall" value={formData.testScores.ielts.overall} onChange={(e) => handleNestedChange('testScores.ielts', 'overall', e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white" />
            <input type="number" step="0.5" max="9" placeholder="Listening" value={formData.testScores.ielts.listening} onChange={(e) => handleNestedChange('testScores.ielts', 'listening', e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white" />
            <input type="number" step="0.5" max="9" placeholder="Reading" value={formData.testScores.ielts.reading} onChange={(e) => handleNestedChange('testScores.ielts', 'reading', e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white" />
            <input type="number" step="0.5" max="9" placeholder="Writing" value={formData.testScores.ielts.writing} onChange={(e) => handleNestedChange('testScores.ielts', 'writing', e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white" />
            <input type="number" step="0.5" max="9" placeholder="Speaking" value={formData.testScores.ielts.speaking} onChange={(e) => handleNestedChange('testScores.ielts', 'speaking', e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white" />
          </div>
        </div>

        {/* Other Tests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TOEFL</label>
            <input type="number" placeholder="Total Score" value={formData.testScores.toefl.overall} onChange={(e) => handleNestedChange('testScores.toefl', 'overall', e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GRE Total</label>
            <input type="number" placeholder="Total Score" value={formData.testScores.gre.total} onChange={(e) => handleNestedChange('testScores.gre', 'total', e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GMAT</label>
            <input type="number" placeholder="Total Score" value={formData.testScores.gmat.total} onChange={(e) => handleNestedChange('testScores.gmat', 'total', e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SAT</label>
            <input type="number" placeholder="Total Score" value={formData.testScores.sat.total} onChange={(e) => handleNestedChange('testScores.sat', 'total', e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white" />
          </div>
        </div>
      </div>

      {/* Financial Information */}
      <div className="glass rounded-xl p-6 border border-gray-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Financial Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Maximum Budget per Year</label>
            <input
              type="number"
              value={formData.financialInfo.maxBudgetPerYear}
              onChange={(e) => handleNestedChange('financialInfo', 'maxBudgetPerYear', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              placeholder="50000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
            <select
              value={formData.financialInfo.currency}
              onChange={(e) => handleNestedChange('financialInfo', 'currency', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.financialInfo.needsScholarship}
              onChange={(e) => handleNestedChange('financialInfo', 'needsScholarship', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Need Scholarship</label>
          </div>
          {formData.financialInfo.needsScholarship && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scholarship Percentage Needed</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.financialInfo.scholarshipPercentage}
                onChange={(e) => handleNestedChange('financialInfo', 'scholarshipPercentage', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                placeholder="50"
              />
            </div>
          )}
        </div>
      </div>

      {/* Preferences */}
      <div className="glass rounded-xl p-6 border border-gray-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preferred Countries</label>
            <div className="flex flex-wrap gap-2">
              {countries.map((country) => (
                <label key={country} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.preferences.preferredCountries.includes(country)}
                    onChange={(e) => {
                      const newCountries = e.target.checked
                        ? [...formData.preferences.preferredCountries, country]
                        : formData.preferences.preferredCountries.filter((c) => c !== country);
                      handleNestedChange('preferences', 'preferredCountries', newCountries);
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{country}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preferred Fields</label>
            <div className="flex flex-wrap gap-2">
              {fields.map((field) => (
                <label key={field} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.preferences.preferredFields.includes(field)}
                    onChange={(e) => {
                      const newFields = e.target.checked
                        ? [...formData.preferences.preferredFields, field]
                        : formData.preferences.preferredFields.filter((f) => f !== field);
                      handleNestedChange('preferences', 'preferredFields', newFields);
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{field}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Degree Level</label>
            <select
              value={formData.preferences.degreeLevel}
              onChange={(e) => handleNestedChange('preferences', 'degreeLevel', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              <option value="">Select Degree Level</option>
              <option value="Bachelor's">Bachelor's</option>
              <option value="Master's">Master's</option>
              <option value="PhD">PhD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Extracurricular Activities */}
      <div className="glass rounded-xl p-6 border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Extracurricular Activities</h3>
          <button
            type="button"
            onClick={() => addArrayItem('extracurricularActivities', { activity: '', description: '', duration: '' })}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Activity
          </button>
        </div>
        {formData.extracurricularActivities.map((activity, index) => (
          <div key={index} className="mb-4 p-4 border border-gray-200 dark:border-slate-600 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">Activity {index + 1}</span>
              <button
                type="button"
                onClick={() => removeArrayItem('extracurricularActivities', index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Activity Name"
                value={activity.activity}
                onChange={(e) => {
                  const newActivities = [...formData.extracurricularActivities];
                  newActivities[index].activity = e.target.value;
                  handleChange('extracurricularActivities', newActivities);
                }}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Description"
                value={activity.description}
                onChange={(e) => {
                  const newActivities = [...formData.extracurricularActivities];
                  newActivities[index].description = e.target.value;
                  handleChange('extracurricularActivities', newActivities);
                }}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Duration"
                value={activity.duration}
                onChange={(e) => {
                  const newActivities = [...formData.extracurricularActivities];
                  newActivities[index].duration = e.target.value;
                  handleChange('extracurricularActivities', newActivities);
                }}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Profile
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default StudentProfileForm;
