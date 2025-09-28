import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/signin-signup-comp/Button'
import InputField from '../components/signin-signup-comp/InputField'
import { GitHubButton, GoogleButton, FacebookButton } from '../components/signin-signup-comp/OAuthButton'
import useSignIn from '../hooks/useSignIn'

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

    console.log('Login attempt:', formData);
    signInMutation(formData);
  };

  const handleOAuthLogin = (provider) => {
    // TODO: Implement OAuth login
    console.log(`${provider} login`);
    alert(`${provider} login will be implemented`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Welcome back
            </h1>
            <p className="text-gray-500 text-sm mb-4">
              Login to your account
            </p>
            <div className="border-t border-gray-200"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Server Error message */}
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
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
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  // Icon mắt đóng (password đang ẩn)
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              
              <button
                type="button"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
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
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <GitHubButton onClick={() => handleOAuthLogin('GitHub')} />
              <GoogleButton onClick={() => handleOAuthLogin('Google')} />
              <FacebookButton onClick={() => handleOAuthLogin('Facebook')} />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <button 
                type="button" 
                className="font-medium text-gray-900 hover:text-gray-700 transition-colors"
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