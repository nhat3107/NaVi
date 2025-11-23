import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";
import OnBoardingPage from "./pages/OnBoardingPage";
import HomePage from "./pages/HomePage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import OTPVerificationPage from "./pages/OTPVerificationPage";
import VideoCallPage from "./pages/VideoCallPage";
import ProfilePage from "./pages/ProfilePage";
import ProfileEditPage from "./pages/ProfileEditPage";
import useAuthUser from "./hooks/useAuthUser.js";
import ChatPage from "./pages/ChatPage.jsx";
import { Toaster } from "react-hot-toast";
import VideoCallOverlay from "./components/video-call-comp/VideoCallOverlay";
import { initSocket, connectUser } from "./lib/socket.client";
import useVideoCall from "./hooks/useVideoCall";
import { useVideoCallStore } from "./stores/useVideoCallStore";

// AppContent component - rendered inside Router context
const AppContent = () => {
  const { isLoading, authUser } = useAuthUser();
  
  // Check if this is a popup window (video call window)
  const isPopupWindow = window.opener && !window.opener.closed;

  // Only initialize video call hooks in main window, not in popup
  if (!isPopupWindow) {
    useVideoCall(); // Initialize video call hooks (now inside Router context)
  }

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnBoarded;

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (isAuthenticated && authUser?._id) {
      // Initialize socket for both main and popup
      const socket = initSocket();
      
      if (isPopupWindow) {
        // Popup window - init socket but DON'T register user
        console.log("🪟 Popup window: Socket initialized (no user registration)");
        console.log("   Socket ID:", socket?.id);
        // Pass skipRegister=true to prevent user-connected emission
        connectUser(authUser._id, true);
      } else {
        // Main window - full socket initialization with user registration
        connectUser(authUser._id, false);
        console.log("✅ Main window: Socket initialized for user:", authUser._id);
        console.log("   Socket connected:", socket?.connected);
      }
    }
  }, [isAuthenticated, authUser, isPopupWindow]);

  // Listen for popup window signals (only in main window)
  useEffect(() => {
    if (isPopupWindow) return; // Only main window should listen

    const handleStorageChange = (e) => {
      // Listen for videocall_ended signal from popup window
      if (e.key === "videocall_ended" && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          console.log("📬 Main window: Received call ended signal from popup", data);
          
          // Clear call state in main window
          const { endCall } = useVideoCallStore.getState();
          endCall();
          
          console.log("✅ Main window: Call state cleared, ready for next call");
          
          // Clean up the signal after processing
          setTimeout(() => {
            localStorage.removeItem("videocall_ended");
          }, 500);
        } catch (err) {
          console.error("Error handling videocall_ended signal:", err);
        }
      }
    };

    // Add storage event listener
    window.addEventListener("storage", handleStorageChange);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [isPopupWindow]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );

  return (
      <div className="h-screen">
        <Toaster />
      {/* Only show VideoCallOverlay in main window, not in popup */}
      {isAuthenticated && !isPopupWindow && <VideoCallOverlay />}
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated && isOnboarded ? (
                // <ChatPage />
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
          <Route
            path="/verify-otp"
            element={
              !isAuthenticated ? (
                <OTPVerificationPage />
              ) : (
                <Navigate to={isOnboarded ? "/" : "/onboarding"} />
              )
            }
          />
          <Route path="/auth/callback/google" element={<AuthCallbackPage />} />
          <Route path="/auth/callback/github" element={<AuthCallbackPage />} />
          <Route
            path="/video-call/:roomId"
            element={
              isAuthenticated ? (
                <VideoCallPage />
              ) : (
                <Navigate to="/signin" />
              )
            }
          />
          <Route
            path="/chat"
            element={
              isAuthenticated && isOnboarded ? (
                <ChatPage />
            path="/profile/:userId"
            element={
              isAuthenticated && isOnboarded ? (
                <ProfilePage />
              ) : (
                <Navigate to={!isAuthenticated ? "/signin" : "/onboarding"} />
              )
            }
          />
          <Route
            path="/profile/edit"
            element={
              isAuthenticated && isOnboarded ? (
                <ProfileEditPage />
              ) : (
                <Navigate to={!isAuthenticated ? "/signin" : "/onboarding"} />
              )
            }
          />
        </Routes>
      </div>
  );
};

// Main App component - wraps everything in Router
const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
