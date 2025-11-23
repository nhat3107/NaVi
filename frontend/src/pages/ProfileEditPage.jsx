import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import useAuthUser from "../hooks/useAuthUser";
import useUpdateProfile from "../hooks/useUpdateProfile";
import { uploadMedia } from "../lib/api";
import toast from "react-hot-toast";
import DateButton, { dayOptions, monthOptions, yearOptions, validateBirthDate } from "../components/signin-signup-comp/DateButton";
import AvatarUpload from "../components/profile-comp/AvatarUpload";
import GenderSelector from "../components/profile-comp/GenderSelector";

const ProfileEditPage = () => {
  const navigate = useNavigate();
  const { authUser, isLoading: authLoading } = useAuthUser();
  const { updateProfile, isUpdating } = useUpdateProfile();
  
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    gender: "",
    avatarUrl: "",
  });
  
  const [dateFields, setDateFields] = useState({
    day: "",
    month: "",
    year: ""
  });
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Initialize form with current user data
  useEffect(() => {
    if (authUser) {
      setFormData({
        username: authUser.username || "",
        bio: authUser.bio || "",
        gender: authUser.gender || "",
        avatarUrl: authUser.avatarUrl || "",
      });
      
      // Parse dateOfBirth - handle both YYYY-MM-DD and DD-MM-YYYY formats
      if (authUser.dateOfBirth) {
        const parts = authUser.dateOfBirth.split('-');
        if (parts.length === 3) {
          // Detect format: if first part is 4 digits, it's YYYY-MM-DD, otherwise DD-MM-YYYY
          const isYearFirst = parts[0].length === 4;
          
          if (isYearFirst) {
            // YYYY-MM-DD format
            setDateFields({
              year: parseInt(parts[0], 10),  // YYYY
              month: parseInt(parts[1], 10), // MM
              day: parseInt(parts[2], 10)    // DD
            });
          } else {
            // DD-MM-YYYY format
            setDateFields({
              day: parseInt(parts[0], 10),   // DD
              month: parseInt(parts[1], 10), // MM
              year: parseInt(parts[2], 10)   // YYYY
            });
          }
        } else {
          // Reset if date format is invalid
          setDateFields({ day: "", month: "", year: "" });
        }
      } else {
        // Reset if no dateOfBirth exists
        setDateFields({ day: "", month: "", year: "" });
      }
      
      setAvatarPreview(authUser.avatarUrl || "");
    }
  }, [authUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateFields(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");
    
    // Validate birth date if any date field is provided
    if (dateFields.day || dateFields.month || dateFields.year) {
      const validation = validateBirthDate(
        parseInt(dateFields.day),
        parseInt(dateFields.month),
        parseInt(dateFields.year)
      );
      
      if (!validation.success) {
        setValidationError(validation.message);
        toast.error(validation.message);
        return;
      }
    }

    try {
      let avatarUrl = formData.avatarUrl;
      
      // Upload new avatar if selected
      if (avatarFile) {
        setIsUploadingAvatar(true);
        const uploadResult = await uploadMedia({ file: avatarFile });
        setIsUploadingAvatar(false);
        
        if (uploadResult.success) {
          avatarUrl = uploadResult.url;
        } else {
          toast.error("Failed to upload avatar");
          return;
        }
      }
      
      // Format date of birth if provided (DD-MM-YYYY format)
      let dateOfBirth = null;
      if (dateFields.day && dateFields.month && dateFields.year) {
        dateOfBirth = `${String(dateFields.day).padStart(2, '0')}-${String(dateFields.month).padStart(2, '0')}-${dateFields.year}`;
      }
      
      // Update profile
      const profileData = {
        ...formData,
        avatarUrl,
        ...(dateOfBirth && { dateOfBirth })
      };
      
      updateProfile(profileData);
    } catch (error) {
      console.error("Error updating profile:", error);
      setIsUploadingAvatar(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="flex-1 ml-20 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Edit Profile</h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 p-6">
            {/* Validation Error */}
            {validationError && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {validationError}
              </div>
            )}
            {/* Avatar Section */}
            <AvatarUpload
              avatarPreview={avatarPreview}
              username={formData.username}
              onAvatarChange={handleAvatarChange}
            />

            {/* Username */}
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                placeholder="Enter username"
              />
            </div>

            {/* Bio */}
            <div className="mb-4">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                maxLength={500}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent resize-none"
                placeholder="Tell us about yourself..."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                {formData.bio.length}/500 characters
              </p>
            </div>

            {/* Date of Birth */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date of Birth
              </label>
              <div className="grid grid-cols-3 gap-3">
                <DateButton 
                  placeholder="Month" 
                  options={monthOptions}
                  value={dateFields.month}
                  onChange={handleDateChange}
                  name="month"
                />
                <DateButton 
                  placeholder="Day" 
                  options={dayOptions}
                  value={dateFields.day}
                  onChange={handleDateChange}
                  name="day"
                  selectedMonth={dateFields.month || null}
                  selectedYear={dateFields.year || null}
                />
                <DateButton 
                  placeholder="Year" 
                  options={yearOptions}
                  value={dateFields.year}
                  onChange={handleDateChange}
                  name="year"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">This won't be part of your public profile.</p>
            </div>

            {/* Gender */}
            <GenderSelector
              value={formData.gender}
              onChange={handleInputChange}
            />

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating || isUploadingAvatar}
                className="px-6 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center"
              >
                {isUpdating || isUploadingAvatar ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isUploadingAvatar ? "Uploading..." : "Saving..."}
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditPage;

