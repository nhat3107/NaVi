import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OTPInput from '../components/signin-signup-comp/OTPInput';
import Button from '../components/signin-signup-comp/Button';
import useVerifyOTP from '../hooks/useVerifyOTP';
import useResendOTP from '../hooks/useResendOTP';

const OTPVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  
  const [otp, setOtp] = useState('');
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [otpKey, setOtpKey] = useState(0); // Key to force OTP input re-render

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const { verifyOTPMutation, isPending: isVerifying } = useVerifyOTP(
    // onSuccess
    () => {
      setSuccessMessage('Email verified successfully! Redirecting...');
      setServerError('');
    },
    // onError
    (error) => {
      const errorMessage = error.response?.data?.message || 'Invalid OTP. Please try again.';
      const attemptsLeft = error.response?.data?.attemptsLeft;
      
      setServerError(
        attemptsLeft !== undefined 
          ? `${errorMessage} (${attemptsLeft} attempts left)`
          : errorMessage
      );
      setSuccessMessage('');
      setOtp(''); // Clear OTP input
      setOtpKey(prev => prev + 1); // Force re-render OTP component
    }
  );

  const { resendOTPMutation, isPending: isResending } = useResendOTP(
    // onSuccess
    () => {
      setSuccessMessage('New OTP sent to your email!');
      setServerError('');
      setCountdown(60); // 1 minute countdown
      setOtp(''); // Clear current OTP
      setOtpKey(prev => prev + 1); // Force re-render OTP component
    },
    // onError
    (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to resend OTP. Please try again.';
      const waitTime = error.response?.data?.waitTime;
      
      if (waitTime) {
        setCountdown(waitTime);
      }
      
      setServerError(errorMessage);
      setSuccessMessage('');
    }
  );

  const handleOTPComplete = (otpValue) => {
    setOtp(otpValue);
    setServerError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setServerError('Please enter the complete 6-digit OTP');
      return;
    }

    verifyOTPMutation({ email, otp });
  };

  const handleResendOTP = () => {
    if (countdown > 0) return; // Prevent resend during countdown
    resendOTPMutation(email);
  };

  const maskEmail = (email) => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    const maskedUsername = username.substring(0, 2) + '*'.repeat(username.length - 2);
    return `${maskedUsername}@${domain}`;
  };

  if (!email) {
    return <div>Loading...</div>;
  }

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
            {/* Email icon */}
            <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Verify Your Email
            </h1>
            <p className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              We've sent a 6-digit verification code to
            </p>
            <p className="text-gray-900 dark:text-gray-100 font-semibold text-sm mb-6">
              {maskEmail(email)}
            </p>
            <div className="border-t border-gray-300 dark:border-gray-600"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success message */}
            {successMessage && (
              <div className="bg-green-50 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-600 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg text-sm text-center font-medium">
                {successMessage}
              </div>
            )}

            {/* Error message */}
            {serverError && (
              <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-600 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm text-center font-medium">
                {serverError}
              </div>
            )}

            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
                Enter verification code
              </label>
              <OTPInput 
                key={otpKey} // Force re-render when key changes
                length={6} 
                onComplete={handleOTPComplete}
                disabled={isVerifying}
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={!otp || otp.length !== 6 || isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'Verify Email'}
            </Button>

            {/* Resend OTP */}
            <div className="text-center">
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                Didn't receive the code?
              </p>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={countdown > 0 || isResending}
                className={`
                  text-sm font-medium transition-colors
                  ${countdown > 0 || isResending
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer'
                  }
                `}
              >
                {isResending ? 'Sending...' : 
                 countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
              </button>
            </div>

            {/* Help text */}
            <div className="text-center text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>Check your spam folder if you don't see the email</p>
              <p>The code expires in 10 minutes</p>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <button 
              type="button" 
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              onClick={() => navigate('/signup')}
            >
              ← Back to Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage;
