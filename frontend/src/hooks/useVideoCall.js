import { useEffect } from "react";
import { useVideoCallStore } from "../stores/useVideoCallStore";
import { useAuthStore } from "../stores/useAuthStore";
import { getSocket } from "../lib/socket.client";
import toast from "react-hot-toast";
import { createVideoRoom } from "../lib/videosdkApi";

export const useVideoCall = () => {
  const { user: authUser } = useAuthStore(); // Fix: use 'user' from store, rename to authUser
  const { setIncomingCall, clearIncomingCall, isInCall } = useVideoCallStore();

  useEffect(() => {
    const socket = getSocket();

    if (!socket || !authUser) return;

    // Listen for incoming calls
    socket.on("call:incoming", (data) => {
      // Check if user is already in another call
      const currentState = useVideoCallStore.getState();
      if (currentState.isInCall) {
        // Send busy signal to caller
        socket.emit("call:busy", {
          roomId: data.roomId,
          callerId: data.callerId,
          busyUserId: authUser._id,
          busyUserName: authUser.username,
        });
        
        // Don't show incoming call overlay
        return;
      }

      setIncomingCall({
        roomId: data.roomId,
        callerId: data.callerId,
        callerName: data.callerName,
        timestamp: data.timestamp,
      });
    });

    // Listen for call ended
    socket.on("call:ended", (data) => {
      clearIncomingCall();
    });

    // Listen for user busy response
    socket.on("call:user-busy", (data) => {
      toast.error(`${data.busyUserName} is in another call`);
    });

    // Listen for call timeout (no one answered)
    socket.on("call:timeout", (data) => {
      clearIncomingCall();
      // End call state
      const { endCall } = useVideoCallStore.getState();
      endCall();
    });

    return () => {
      socket.off("call:incoming");
      socket.off("call:ended");
      socket.off("call:user-busy");
      socket.off("call:timeout");
    };
  }, [authUser, setIncomingCall, clearIncomingCall, isInCall]);

  const initiateCall = async (participantIds = [], chatId = null) => {
    try {
      const socket = getSocket();
      
      if (!socket) {
        throw new Error("Socket connection not initialized. Please refresh the page.");
      }

      if (!socket.connected) {
        throw new Error("Not connected to server. Please check your connection.");
      }

      if (!authUser) {
        throw new Error("You must be logged in to start a call");
      }

      if (!chatId) {
        throw new Error("Chat ID is required to start a call");
      }

      // Create a new video room
      const response = await createVideoRoom(participantIds);

      if (!response.success) {
        throw new Error(response.message || "Failed to create video room");
      }

      const { roomId, token } = response;

      // Update store TRƯỚC để đánh dấu đang trong call
      const { startCall } = useVideoCallStore.getState();
      startCall({
        roomId,
        token,
        initiator: authUser._id,
      });

      // Lưu thông tin vào localStorage với thời gian expire (30 giây)
      const callData = {
        roomId,
        token,
        initiator: authUser._id,
        timestamp: Date.now(),
        expiresAt: Date.now() + 30000, // 30 seconds
      };
      localStorage.setItem(`videocall_${roomId}`, JSON.stringify(callData));

      // Mở cửa sổ mới cho video call
      const width = 1280;
      const height = 720;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      
      const callWindow = window.open(
        `/video-call/${roomId}`,
        `videocall_${roomId}`,
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );

      // Check if popup is blocked
      if (!callWindow || callWindow.closed || typeof callWindow.closed === 'undefined') {
        toast.error("Popup blocked. Please allow popups for this site.");
        // Rollback store state
        useVideoCallStore.getState().endCall();
        localStorage.removeItem(`videocall_${roomId}`);
        return { success: false, error: "Popup blocked" };
      }

      // Wait a bit for window to load, then notify participants
      setTimeout(() => {
        socket.emit("call:initiate", {
          roomId,
          callerId: authUser._id,
          callerName: authUser.username,
          participants: participantIds,
          chatId, // Add chatId for backend timeout tracking
        });
      }, 500); // Delay 500ms for window to load

      return { success: true, roomId };
    } catch (error) {
      toast.error(error.message || "Failed to start call");
      return { success: false, error: error.message };
    }
  };

  return {
    initiateCall,
  };
};

export default useVideoCall;
