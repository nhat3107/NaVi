import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/signin-signup-comp/Button'
import InputField from '../components/signin-signup-comp/InputField'
import DateButton, { dayOptions, monthOptions, yearOptions } from '../components/signin-signup-comp/DateButton'
import GenderRadioButton from '../components/signin-signup-comp/GenderRadioButtob'

const OnBoardingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userData = location.state || {};
  const [profileData, setProfileData] = useState({
    username: '',
    day: '',
    month: '',
    year: '',
    gender: '',
    bio: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!profileData.username) {
      alert('Please fill in your username!');
      return;
    }

    if (!profileData.day || !profileData.month || !profileData.year) {
      alert('Please select your date of birth!');
      return;
    }

    if (!profileData.gender) {
      alert('Please select your gender!');
      return;
    }

    // Complete registration (for now just show success)
    const completeUserData = {
      ...userData,
      ...profileData
    };
    
    console.log('Complete user registration:', completeUserData);
    alert('Registration completed successfully!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          {/* Header */}
          <div className="text-center mb-5">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Let's us know more about you!
            </h1>
            <p className="text-gray-500 text-sm mb-3">
              Just a few more details to get started
            </p>
            <div className="border-t border-gray-200"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username field */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1.5">
                Username{' '}
                <span 
                  className="text-gray-400 ml-1.5 cursor-help inline-flex items-center align-middle" 
                  title="Choose a unique username that will be visible to other users"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </span>
              </label>
              <InputField 
                type="text" 
                placeholder="Enter your username" 
                value={profileData.username}
                onChange={handleInputChange}
                name="username" 
                required
              />
            </div>

            {/* Date of birth label */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1.5">
                Date of birth{' '}
                <span 
                  className="text-gray-400 ml-1.5 cursor-help inline-flex items-center align-middle" 
                  title="We use this to verify your age and provide age-appropriate content"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </span>
              </label>
              
              {/* Date selectors */}
              <div className="grid grid-cols-3 gap-3">
                <DateButton 
                  placeholder="Day" 
                  options={dayOptions}
                  value={profileData.day}
                  onChange={handleInputChange}
                  name="day"
                />
                <DateButton 
                  placeholder="Month" 
                  options={monthOptions}
                  value={profileData.month}
                  onChange={handleInputChange}
                  name="month"
                />
                <DateButton 
                  placeholder="Year" 
                  options={yearOptions}
                  value={profileData.year}
                  onChange={handleInputChange}
                  name="year"
                />
              </div>
            </div>

            {/* Gender selection */}
            <div>
              <GenderRadioButton
                value={profileData.gender}
                onChange={handleInputChange}
                name="gender"
              />
            </div>

            {/* Description field */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1.5">
                About you {'(optional)'}
                <span 
                  className="text-gray-400 ml-1.5 cursor-help inline-flex items-center align-middle" 
                  title="Tell others a bit about yourself (optional)"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </span>
              </label>
              <InputField 
                type="text" 
                placeholder="Tell us about yourself..." 
                value={profileData.bio}
                onChange={handleInputChange}
                name="bio" 
              />
            </div>

            {/* Action buttons */}
            <div className="pt-3 space-y-2.5">
              <Button type="submit" disabled={false}>
                Complete
              </Button>
              
              {/* Back button */}
              <button
                type="button"
                onClick={() => navigate('/signin')}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
              >
                Back to Sign In
              </button>
            </div>
          </form>

          {/* Show email info */}
          {/* {userData?.email && (
            <div className="mt-2.5 p-2.5 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">
                Creating account for: <span className="font-medium">{userData.email}</span>
              </p>
            </div>
          )} */}
        </div>
      </div>
    </div>
  )
}

export default OnBoardingPage;