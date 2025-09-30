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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          {/* Header */}
          <div className="text-center mb-8">
            {/* Email icon */}
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Verify Your Email
            </h1>
            <p className="text-gray-500 text-sm mb-2">
              We've sent a 6-digit verification code to
            </p>
            <p className="text-gray-900 font-medium text-sm mb-6">
              {maskEmail(email)}
            </p>
            <div className="border-t border-gray-200"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm text-center">
                {successMessage}
              </div>
            )}

            {/* Error message */}
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
                {serverError}
              </div>
            )}

            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
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
              <p className="text-gray-500 text-sm mb-2">
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
                    : 'text-blue-600 hover:text-blue-700 cursor-pointer'
                  }
                `}
              >
                {isResending ? 'Sending...' : 
                 countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
              </button>
            </div>

            {/* Help text */}
            <div className="text-center text-xs text-gray-400 space-y-1">
              <p>Check your spam folder if you don't see the email</p>
              <p>The code expires in 10 minutes</p>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <button 
              type="button" 
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
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
