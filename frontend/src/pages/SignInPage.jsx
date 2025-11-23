import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/signin-signup-comp/Button'
import InputField from '../components/signin-signup-comp/InputField'
import { GitHubButton, GoogleButton, FacebookButton } from '../components/signin-signup-comp/OAuthButton'
import useSignIn from '../hooks/useSignIn'
import { getGoogleAuthUrl, getGithubAuthUrl } from '../lib/api'

const SignInPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear server error when user starts typing
    if (serverError) {
      setServerError('');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const { signInMutation, isPending } = useSignIn(
    // onSuccess callback
    null,
    // onError callback
    (error) => {
      const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
      setServerError(errorMessage);
    }
  );
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError(''); // Clear previous server errors
    
    // Validate form
    if (!formData.email || !formData.password) {
      setServerError('Please fill in all fields!');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setServerError('Please enter a valid email address!');
      return;
    }

    // Basic password validation
    if (formData.password.length < 6) {
      setServerError('Password must be at least 6 characters!');
      return;
    }

    signInMutation(formData);
  };

  const handleGoogleLogin = async () => {
    try {
      setServerError(''); // Clear any previous errors
      const response = await getGoogleAuthUrl();
      if (response.success) {
        // Redirect to Google OAuth
        window.location.href = response.authUrl;
      }
    } catch (error) {
      setServerError('Failed to initiate Google login. Please try again.');
    }
  };

  const handleGithubLogin = async () => {
    try {
      setServerError(''); // Clear any previous errors
      const response = await getGithubAuthUrl();
      if (response.success) {
        // Redirect to GitHub OAuth
        window.location.href = response.authUrl;
      }
    } catch (error) {
      setServerError('Failed to initiate GitHub login. Please try again.');
    }
  };

  const handleOAuthLogin = (provider) => {
    if (provider === 'Google') {
      handleGoogleLogin();
    } else if (provider === 'GitHub') {
      handleGithubLogin();
    } else {
      // TODO: Implement other OAuth providers (Facebook, etc.)
      setServerError(`${provider} login will be implemented soon`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 px-4 py-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large gradient orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-400/30 dark:bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/30 dark:bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300/20 dark:bg-indigo-700/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#80808020_1px,transparent_1px),linear-gradient(to_bottom,#80808020_1px,transparent_1px)]"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back
            </h1>
            <p className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-4">
              Login to your account
            </p>
            <div className="border-t border-gray-300 dark:border-gray-600"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Server Error message */}
            {serverError && (
              <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-600 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm font-medium">
                {serverError}
              </div>
            )}
            
            {/* Email field */}
            <InputField 
              type="email" 
              placeholder="m@example.com" 
              value={formData.email}
              onChange={handleInputChange}
              name="email" 
              required
            />
            
            {/* Password field with show/hide */}
            <div className="relative">
              <InputField 
                type={showPassword ? "text" : "password"}
                placeholder="Password" 
                value={formData.password}
                onChange={handleInputChange}
                name="password" 
                required
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  // Icon mắt mở (password đang hiển thị)
                  <svg className="h-5 w-5 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  // Icon mắt đóng (password đang ẩn)
                  <svg className="h-5 w-5 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                )}
              </button>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 border-gray-400 dark:border-gray-500 rounded"
                />
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Remember me</span>
              </label>
              
              <button
                type="button"
                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                onClick={() => {
                  // TODO: Navigate to forgot password page
                  alert('Forgot password page will be implemented');
                }}
              >
                Forgot your password?
              </button>
            </div>

            {/* Login Button */}
            <div className="pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Signing in...' : 'Login'}
              </Button>
            </div>
          </form>

          {/* OAuth Section */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 font-medium">Or continue with</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {/* <FacebookButton onClick={() => handleOAuthLogin('Facebook')} /> */}
              <GitHubButton onClick={() => handleOAuthLogin('GitHub')} /> 
              <GoogleButton onClick={() => handleOAuthLogin('Google')} />

               
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              Don't have an account?{' '}
              <button 
                type="button" 
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                onClick={() => navigate('/signup')}
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignInPage;