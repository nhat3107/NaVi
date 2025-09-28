import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/signin-signup-comp/Button'
import InputField from '../components/signin-signup-comp/InputField'
import DateButton, { dayOptions, monthOptions, yearOptions, validateBirthDate } from '../components/signin-signup-comp/DateButton'
import GenderRadioButton from '../components/signin-signup-comp/GenderRadioButtob'
import useAuthUser from '../hooks/useAuthUser'
import { completeOnboarding, logout } from '../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const OnBoardingPage = () => {
  const location = useLocation();
  const userData = location.state || {}; // get user data from signup page
  const navigate = useNavigate();
  const {authUser} = useAuthUser();
  const queryClient = useQueryClient();
  const {mutate: onboardingMutation, isPending} = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"]});
      setServerError(''); // Clear any previous server errors
    },
    onError: (error) => {
      console.log(error);
      // Extract error message from response
      const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
      setServerError(errorMessage);
    }
  });

  const [profileData, setProfileData] = useState({
    username: '',
    day: '',
    month: '',
    year: '',
    gender: '',
    bio: ''
  });

  const [validationError, setValidationError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [serverError, setServerError] = useState('');

  // Username validation functions
  const validateUsername = (username) => {
    if (!username || username.trim() === '') {
      return {
        success: false,
        message: 'Username is required'
      };
    }

    // Check length (minimum 3, maximum 20 characters)
    if (username.length < 3) {
      return {
        success: false,
        message: 'Username must be at least 3 characters long'
      };
    }

    if (username.length > 20) {
      return {
        success: false,
        message: 'Username must not exceed 20 characters'
      };
    }

    // Check for spaces specifically
    if (username.includes(' ')) {
      return {
        success: false,
        message: 'Username cannot contain spaces'
      };
    }

    // Check allowed characters: lowercase letters, numbers, underscore, dot
    const allowedPattern = /^[a-z0-9_.]+$/;
    if (!allowedPattern.test(username)) {
      return {
        success: false,
        message: 'Username can only contain lowercase letters, numbers, underscore (_), and dot (.)'
      };
    }

    return {
      success: true,
      message: 'Valid username'
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear validation errors when user starts typing
    if (validationError) {
      setValidationError('');
    }
    if (name === 'username' && usernameError) {
      setUsernameError('');
    }
    if (serverError) {
      setServerError('');
    }
    
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    // Validate username only on blur
    if (name === 'username') {
      if (value.trim() === '') {
        setUsernameError('');
      } else {
        const validation = validateUsername(value);
        setUsernameError(validation.success ? '' : validation.message);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError(''); // Clear previous errors
    setServerError(''); // Clear previous server errors
    
    // Validate username
    const usernameValidation = validateUsername(profileData.username);
    if (!usernameValidation.success) {
      setValidationError(usernameValidation.message);
      return;
    }

    // Validate birth date
    const birthDateValidation = validateBirthDate(
      parseInt(profileData.day), 
      parseInt(profileData.month), 
      parseInt(profileData.year)
    );
    
    if (!birthDateValidation.success) {
      setValidationError(birthDateValidation.message);
      return;
    }

    if (!profileData.gender) {
      setValidationError('Please select your gender!');
      return;
    }

    // Format date of birth
    const dateToString = `${String(profileData.day).padStart(2, '0')}-${String(profileData.month).padStart(2, '0')}-${profileData.year}`;

    // Complete registration (for now just show success)
    const completeUserData = {
      // ...userData,
      username: profileData.username,
      dateOfBirth: dateToString,
      gender: profileData.gender,
      bio: profileData.bio
    };
    
    console.log('Complete user registration:', completeUserData);
    // alert('Registration completed successfully!');
    onboardingMutation(completeUserData);
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
            {/* Validation Error message */}
            {validationError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {validationError}
              </div>
            )}
            
            {/* Server Error message */}
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {serverError}
              </div>
            )}
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
                onBlur={handleBlur}
                name="username" 
                required
              />
              {usernameError && (
                <p className="mt-2 text-sm text-red-500 flex items-start gap-1">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {usernameError}
                </p>
              )}
              {!profileData.username && (
                <p className="mt-1 text-xs text-gray-500">
                  Username can only contain lowercase letters, numbers, underscore ( _ ), and dot (.)
                </p>
              )}
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
                  selectedMonth={parseInt(profileData.month) || null}
                  selectedYear={parseInt(profileData.year) || null}
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
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Completing...' : 'Complete'}
              </Button>
              
              {/* Back button */}
              <button
                type="button"
                onClick={async () => {
                  try {
                    await logout(); // Call logout API to clear JWT cookie
                    queryClient.setQueryData(['authUser'], null); // Clear client-side auth state
                    navigate('/signin');
                  } catch (error) {
                    console.error('Logout error:', error);
                    // Force navigation even if logout fails
                    queryClient.setQueryData(['authUser'], null);
                    navigate('/signin');
                  }
                }}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
              >
                Back to Sign In
              </button>
            </div>
          </form>

          {/* Show email info */}
          {(userData?.email || authUser?.email) && (
            <div className="mt-2.5 p-2.5 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">
                Creating profile for: <span className="font-medium">{userData?.email || authUser?.email}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OnBoardingPage;