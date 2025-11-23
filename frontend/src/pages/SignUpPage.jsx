import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/signin-signup-comp/Button'
import InputField from '../components/signin-signup-comp/InputField'
import useSignUp from '../hooks/useSignUp'
import { getGoogleAuthUrl } from '../lib/api'

const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear server error when user starts typing
    if (serverError) {
      setServerError('');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Chỉ validate password và lưu lỗi
    if (name === 'password') {
      if (value.length > 0) {
        const validation = validatePasswordDetails(value);
        if (!validation.isValid) {
          setPasswordError(validation.error);
        } else {
          setPasswordError('');
        }
      } else {
        setPasswordError('');
      }
    }

    // Reset error khi người dùng nhập confirm password
    if (name === 'confirmPassword') {
      setConfirmPasswordError('');
    }
  };

  // Hàm toggle hiển thị password
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Hàm toggle hiển thị confirm password
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Hàm xử lý khi focus vào input
  const handleFocus = (e) => {
    const { name } = e.target;
    
    // Khi focus vào confirm password, hiển thị lỗi password nếu có
    if (name === 'confirmPassword') {
      setShowPasswordError(true);
    }
    
    // Khi focus lại vào password, ẩn lỗi để user có cơ hội sửa
    if (name === 'password') {
      setShowPasswordError(false);
    }
  };

  // Hàm kiểm tra chi tiết password và trả về thông tin lỗi
  const validatePasswordDetails = (password) => {
    // Bước 1: Kiểm tra độ dài
    if (password.length < 6) {
      return {
        isValid: false,
        error: 'Password must be at least 6 characters long'
      };
    }
    
    // Bước 2: Kiểm tra chữ hoa, chữ thường và số
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    if (!hasUppercase || !hasLowercase || !hasNumber) {
      return {
        isValid: false,
        error: 'Password must contain uppercase, lowercase and number'
      };
    }
    
    // Bước 3: Kiểm tra ký tự đặc biệt
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
    
    if (!hasSpecialChar) {
      return {
        isValid: false,
        error: 'Password must contain special character'
      };
    }
    
    // Tất cả điều kiện đều đạt
    return {
      isValid: true,
      error: ''
    };
  };

  const {signupMutation, isPending, error } = useSignUp(
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
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      alert('Please fill in all fields!');
      return;
    }
    
    // Validate password khi submit
    const passwordValidation = validatePasswordDetails(formData.password);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error);
      setShowPasswordError(true);
      return;
    }
    
    // Validate confirm password khi submit
    if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError('Password confirmation does not match!');
      return;
    }

    // Call signup mutation - navigation will be handled in the hook on success
    console.log('Signing up user:', formData);
    signupMutation(formData);
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
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create a new account
            </h1>
            <p className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-6">
              It's quick and easy
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
            
            <InputField 
              type="email" 
              placeholder="m@example.com" 
              value={formData.email}
              onChange={handleInputChange}
              name="email" 
              required
            />
            
            <div>
              <div className="relative">
                <InputField 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  name="password" 
                  className="pr-12"
                  required
                />
                
                {/* Icon toggle password */}
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none transition-colors duration-200"
                >
                  {showPassword ? (
                    // Icon mắt mở (password đang hiển thị)
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    // Icon mắt đóng (password đang ẩn)
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  )}
                </button>
              </div>
              {passwordError && showPasswordError && (
                <p className="text-sm text-red-600 dark:text-red-400 font-medium mt-1">
                  {passwordError}
                </p>
              )}
            </div>

            <div>
              <div className="relative">
                <InputField 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="Confirm password" 
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  name="confirmPassword" 
                  className="pr-12"
                  required
                />
                
                {/* Icon toggle confirm password */}
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none transition-colors duration-200"
                >
                  {showConfirmPassword ? (
                    // Icon mắt mở (password đang hiển thị)
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    // Icon mắt đóng (password đang ẩn)
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  )}
                </button>
              </div>
              {confirmPasswordError && (
                <p className="text-sm text-red-600 dark:text-red-400 font-medium mt-1">
                  {confirmPasswordError}
                </p>
              )}
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating Account...' : 'Sign Up now!'}
              </Button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              Already have an account?{' '}
              <button 
                type="button" 
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                onClick={() => navigate('/signin')}
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage;