import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import OnBoardingPage from './pages/OnBoardingPage';
import HomePage from './pages/HomePage';
import useAuthUser from "./hooks/useAuthUser.js";

const App = () => {
  const { isLoading, authUser } = useAuthUser();

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnBoarded;

  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <BrowserRouter>
      <div className="h-screen">
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated && isOnboarded ? (
                <HomePage />
              ) : (
                <Navigate to={!isAuthenticated ? "/signin" : "/onboarding"} />
              )
            }
          />
          <Route
            path="/signup"
            element={
              !isAuthenticated ? (
                <SignUpPage />
              ) : (
                <Navigate to={isOnboarded ? "/" : "/onboarding"} />
              )
            }
          />
          <Route
            path="/signin"
            element={
              !isAuthenticated ? (
                <SignInPage />
              ) : (
                <Navigate to={isOnboarded ? "/" : "/onboarding"} />
              )
            }
          />
          <Route
            path="/onboarding"
            element={
              isAuthenticated ? (
                !isOnboarded ? (
                  <OnBoardingPage />
                ) : (
                  <Navigate to="/" />
                )
              ) : (
                <Navigate to="/signin" />
              )
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App;
