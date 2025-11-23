import { useEffect, useState } from "react";
import { useVideoCallStore } from "../../stores/useVideoCallStore";
import { joinVideoRoom } from "../../lib/videosdkApi";
import toast from "react-hot-toast";
import { getSocket } from "../../lib/socket.client";

export const VideoCallOverlay = () => {
  const { incomingCall, clearIncomingCall } = useVideoCallStore();
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (incomingCall) {
      setIsVisible(true);
      setTimeLeft(30);
    } else {
      setIsVisible(false);
    }
  }, [incomingCall]);

  useEffect(() => {
    if (!incomingCall) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearIncomingCall();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [incomingCall, clearIncomingCall]);

  const handleAccept = async () => {
    try {
      if (!incomingCall?.roomId) {
        toast.error("Invalid call data");
        return;
      }

      const response = await joinVideoRoom(incomingCall.roomId);

      const { startCall } = useVideoCallStore.getState();
      startCall({
        roomId: response.roomId,
        token: response.token,
        initiator: incomingCall.callerId,
      });

      const callData = {
        roomId: response.roomId,
        token: response.token,
        initiator: incomingCall.callerId,
        timestamp: Date.now(),
        expiresAt: Date.now() + 30000,
      };
      localStorage.setItem(`videocall_${incomingCall.roomId}`, JSON.stringify(callData));

      clearIncomingCall();

      const width = 1280;
      const height = 720;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      
      const callWindow = window.open(
        `/video-call/${incomingCall.roomId}`,
        `videocall_${incomingCall.roomId}`,
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );

      if (!callWindow || callWindow.closed || typeof callWindow.closed === 'undefined') {
        toast.error("Popup blocked. Please allow popups for this site.");
        useVideoCallStore.getState().endCall();
        localStorage.removeItem(`videocall_${incomingCall.roomId}`);
        return;
      }

    } catch (error) {
      toast.error("Failed to join call");
      clearIncomingCall();
      useVideoCallStore.getState().endCall();
    }
  };

  const handleDecline = () => {
    const socket = getSocket();
    if (socket && incomingCall) {
      socket.emit("call:declined", {
        roomId: incomingCall.roomId,
        callerId: incomingCall.callerId,
      });
    }
    clearIncomingCall();
  };


  if (!isVisible || !incomingCall) return null;

  return (
    <div 
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 max-w-[calc(100vw-2rem)]"
      style={{
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <div className="relative">
        <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
        
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 md:p-6 w-full md:w-96 border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-ping opacity-75"></div>
                <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {incomingCall.callerName?.charAt(0)?.toUpperCase() || "U"}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white truncate">
                  {incomingCall.callerName || "Unknown"}
                </h3>
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></span>
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></span>
                  </div>
                  <span className="truncate">Incoming video call...</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-indigo-600 dark:text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                Click Accept to join
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs font-mono text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{timeLeft}s</span>
            </div>
          </div>

          <div className="flex gap-2 md:gap-3">
            <button
              onClick={handleDecline}
              className="flex items-center justify-center gap-1 md:gap-2 px-4 md:px-5 py-2.5 md:py-3 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-red-500/50"
              title="Decline"
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span className="text-sm md:text-base">Decline</span>
            </button>

            <button
              onClick={handleAccept}
              className="flex-1 flex items-center justify-center gap-1 md:gap-2 px-4 md:px-5 py-2.5 md:py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 active:from-green-700 active:to-emerald-800 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-green-500/50"
              title="Accept"
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span className="text-sm md:text-base">Accept</span>
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}} />
    </div>
  );
};

export default VideoCallOverlay;

