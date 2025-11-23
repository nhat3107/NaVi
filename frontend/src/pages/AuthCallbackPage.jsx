import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { processGoogleCallback, processGithubCallback } from '../lib/api';


const AuthCallbackPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const hasProcessedRef = useRef(false); // Use ref for more reliable tracking
  const processedUrlRef = useRef(''); // Track processed URL to prevent re-processing same callback
  
  // Detect OAuth provider from pathname
  const provider = location.pathname.includes('/github') ? 'github' : 'google';
  
  const { mutate: processCallback } = useMutation({
    mutationFn: ({ code, state, provider }) => {
      if (provider === 'github') {
        return processGithubCallback(code, state);
      }
      return processGoogleCallback(code, state);
    },
    onMutate: () => {
      setIsProcessing(true);
    },
    onSuccess: (data) => {
      const { user, needsOnboarding } = data;
      
      // Update auth user in React Query cache
      queryClient.setQueryData(['authUser'], { user });
      
      // Navigate based on onboarding status
      if (needsOnboarding) {
        navigate('/onboarding', {
          state: {
            email: user.email,
            fromOAuth: true,
            provider: provider
          }
        });
      } else {
        navigate('/'); // HomePage
      }
    },
    onError: (error) => {
      console.error('OAuth callback error:', error);
      let errorMessage = error.response?.data?.message || 'Authentication failed';
      
      // Handle specific OAuth errors with user-friendly messages
      if (errorMessage.includes('expired or already been used')) {
        errorMessage = 'Your login session has expired. Please try signing in again.';
      } else if (errorMessage.includes('bad_verification_code')) {
        errorMessage = 'Login session expired. Please try again.';
      }
      
      setError(errorMessage);
      setIsProcessing(false);
      
      // Redirect to signin after error
      setTimeout(() => {
        navigate('/signin');
      }, 4000);
    }
  });

  useEffect(() => {
    const currentUrl = location.pathname + location.search;
    
    // Prevent duplicate processing
    if (hasProcessedRef.current || processedUrlRef.current === currentUrl) {
      return;
    }

    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');


    if (error) {
      // User cancelled or error occurred
      setError(`Authentication failed: ${error}`);
      hasProcessedRef.current = true;
      processedUrlRef.current = currentUrl;
      setTimeout(() => {
        navigate('/signin');
      }, 3000);
      return;
    }

    if (code) {
      hasProcessedRef.current = true;
      processedUrlRef.current = currentUrl;
      processCallback({ code, state, provider });
    } else {
      setError('No authorization code received');
      hasProcessedRef.current = true;
      processedUrlRef.current = currentUrl;
      setTimeout(() => {
        navigate('/signin');
      }, 3000);
    }
  }, [location.search, navigate, provider]); // Removed processCallback and state dependencies

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Error
            </h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/signin')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>
              <p className="text-sm text-gray-500">
                Or wait to be redirected automatically...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <div className="mb-4">
            <div className="mx-auto h-12 w-12 relative">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Completing Authentication
          </h1>
          <p className="text-gray-600">
            Please wait while we sign you in...
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;

