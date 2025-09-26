import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import OnBoardingPage from './pages/OnBoardingPage';
import useAuthUser from "./hooks/useAuthUser.js";

function App() {
  const { isLoading, authUser } = useAuthUser();
  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  console.log('App Debug:', { isLoading, authUser, isAuthenticated, isOnboarded });

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/onboarding" element={<OnBoardingPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
