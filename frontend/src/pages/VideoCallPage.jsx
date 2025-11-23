import { MeetingProvider } from "@videosdk.live/react-sdk";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MeetingAppProvider } from "../contexts/MeetingAppContext";
import MeetingView from "../components/video-call-comp/MeetingView";
import CallEndedView from "../components/video-call-comp/CallEndedView";
import { useVideoCallStore } from "../stores/useVideoCallStore";
import { getVideoSDKToken, leaveVideoRoom } from "../lib/videosdkApi";
import toast from "react-hot-toast";
import { useAuthStore } from "../stores/useAuthStore";
import { getSocket, disconnectSocket } from "../lib/socket.client";

const VideoCallPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuthStore();
  const {
    callToken,
    currentRoomId,
    micOn,
    webcamOn,
    endCall,
    setMeetingLeft,
    startCall,
  } = useVideoCallStore();

  const [token, setToken] = useState(callToken || null);
  const [meetingId, setMeetingId] = useState(currentRoomId || roomId);
  const [participantName, setParticipantName] = useState(
    authUser?.username || "Guest"
  );
  const [isReady, setIsReady] = useState(false);
  const [callEndReason, setCallEndReason] = useState(null); // Track why call ended

  // Track initialization để tránh gọi nhiều lần (quan trọng cho React StrictMode)
  const hasInitialized = useRef(false);
  const isMounted = useRef(true);

  // Update participantName when authUser changes
  useEffect(() => {
    if (authUser?.username) {
      setParticipantName(authUser.username);
    } else {
      // Try to get from store if not available yet
      const storeUser = useAuthStore.getState().user;
      if (storeUser?.username) {
        setParticipantName(storeUser.username);
      }
    }
  }, [authUser]);

  useEffect(() => {
    isMounted.current = true;

    // Chỉ chạy 1 lần khi mount
    if (hasInitialized.current) {
      return;
    }

    const initializeCall = async () => {
      try {
        hasInitialized.current = true;

        // Đọc thông tin từ localStorage với retry mechanism
        const storageKey = `videocall_${roomId}`;
        let currentToken = callToken || token;
        let finalMeetingId = currentRoomId || roomId;
        let callDataFound = false;

        // Thử đọc localStorage với retry (tối đa 3 lần, mỗi lần cách 100ms)
        for (let attempt = 0; attempt < 3; attempt++) {
          const storedData = localStorage.getItem(storageKey);

          if (storedData) {
            try {
              const callData = JSON.parse(storedData);

              // Kiểm tra xem data có expired chưa
              if (callData.expiresAt && callData.expiresAt < Date.now()) {
                localStorage.removeItem(storageKey);
                break;
              }

              currentToken = callData.token;
              finalMeetingId = callData.roomId;

              // Update store để đánh dấu là đang trong call
              startCall({
                roomId: callData.roomId,
                token: callData.token,
                initiator: callData.initiator,
              });

              callDataFound = true;

              // Xóa khỏi localStorage sau khi đã đọc
              localStorage.removeItem(storageKey);
              break;
            } catch (e) {
              localStorage.removeItem(storageKey);
            }
          }

          // Nếu chưa tìm thấy data và chưa phải lần cuối, đợi 100ms rồi thử lại
          if (!callDataFound && attempt < 2) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }

        // Nếu không tìm thấy data trong localStorage, kiểm tra store
        if (!currentToken && isMounted.current) {
          const storeState = useVideoCallStore.getState();
          if (storeState.callToken) {
            currentToken = storeState.callToken;
          }
        }

        // Nếu vẫn chưa có token, lấy token mới
        if (!currentToken && isMounted.current) {
          currentToken = await getVideoSDKToken();
        }

        if (!currentToken) {
          throw new Error("Could not get video call token");
        }

        if (!finalMeetingId) {
          throw new Error("Could not get meeting ID");
        }

        if (isMounted.current) {
          setToken(currentToken);
          setMeetingId(finalMeetingId);

          // Update participantName - ensure it's set before ready
          const username = authUser?.username;
          if (username) {
            setParticipantName(username);
          } else {
            // If authUser not ready, wait a bit and try again
            setTimeout(() => {
              const updatedAuthUser = useAuthStore.getState().user;
              if (updatedAuthUser?.username && isMounted.current) {
                setParticipantName(updatedAuthUser.username);
              }
            }, 100);
          }

          // Clear any call end reason when successfully joining
          setCallEndReason(null);
          setIsReady(true);

          // Emit socket event để notify rằng user đã join call
          const socket = getSocket();
          if (socket && authUser) {
            socket.emit("call:joined", {
              roomId: finalMeetingId,
              userId: authUser._id,
            });
          }
        }
      } catch (error) {
        if (isMounted.current) {
          toast.error("Failed to initialize call: " + error.message);
          // Đóng cửa sổ nếu là popup, nếu không thì navigate
          setTimeout(() => {
            if (window.opener && !window.opener.closed) {
              window.close();
            } else {
              navigate("/chat");
            }
          }, 2000);
        }
      }
    };

    initializeCall();

    // Handle socket reconnection - re-sync state
    const socket = getSocket();
    if (socket && authUser) {
      const handleSocketReconnect = () => {
        const currentState = useVideoCallStore.getState();
        if (currentState.isInCall && currentState.currentRoomId) {
          socket.emit("call:joined", {
            roomId: currentState.currentRoomId,
            userId: authUser._id,
          });
        }
      };

      // Listen for call timeout (no one answered)
      const handleCallTimeout = (data) => {
        if (isMounted.current && isReady) {
          // Only set timeout if we haven't successfully joined yet
          // If already joined, ignore timeout (someone already joined)
          return;
        }
        if (isMounted.current) {
          setCallEndReason("timeout");
          setIsReady(false);
        }
      };

      // Listen for call declined
      const handleCallDeclined = (data) => {
        if (isMounted.current && isReady) {
          // If already joined, ignore declined (too late)
          return;
        }
        if (isMounted.current) {
          setCallEndReason("declined");
          setIsReady(false);
        }
      };

      // Listen for all users busy
      const handleAllBusy = (data) => {
        if (isMounted.current && isReady) {
          // If already joined, ignore busy (too late)
          return;
        }
        if (isMounted.current) {
          setCallEndReason("busy");
          setIsReady(false);
        }
      };

      socket.on("connect", handleSocketReconnect);
      socket.on("call:timeout", handleCallTimeout);
      socket.on("call:declined", handleCallDeclined);
      socket.on("call:all-busy", handleAllBusy);

      // Cleanup listener on unmount
      const cleanupReconnect = () => {
        socket.off("connect", handleSocketReconnect);
        socket.off("call:timeout", handleCallTimeout);
        socket.off("call:declined", handleCallDeclined);
        socket.off("call:all-busy", handleAllBusy);
      };

      // Store cleanup function
      window.addEventListener("beforeunload", cleanupReconnect);
    }

    // Handle window close/refresh
    const handleBeforeUnload = (e) => {
      // Get current room ID from state or URL
      const currentRoomId =
        useVideoCallStore.getState().currentRoomId || roomId;

      // Emit socket event để notify rằng user đã left call
      const socket = getSocket();
      if (socket && authUser && currentRoomId) {
        socket.emit("call:left", {
          roomId: currentRoomId,
          userId: authUser._id,
        });
      }

      // Clear call state when window closes
      useVideoCallStore.getState().endCall();

      // Signal to main window that call ended (if this is popup)
      if (window.opener && !window.opener.closed) {
        localStorage.setItem(
          "videocall_ended",
          JSON.stringify({
            timestamp: Date.now(),
            roomId: currentRoomId,
          })
        );
      }

      // If this is a popup window, disconnect socket
      if (window.opener && !window.opener.closed) {
        disconnectSocket();
      }

      // Clean up localStorage
      if (currentRoomId) {
        localStorage.removeItem(`videocall_${currentRoomId}`);

        // Leave room via API (best effort)
        leaveVideoRoom(currentRoomId).catch((err) => {});
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function
    return () => {
      isMounted.current = false;

      // Remove event listeners
      window.removeEventListener("beforeunload", handleBeforeUnload);

      // Cleanup socket listeners
      const socket = getSocket();
      if (socket) {
        socket.off("connect");
      }

      // Get current state
      const currentState = useVideoCallStore.getState();
      const currentRoomId = currentState.currentRoomId || roomId;

      // If this is a popup window, signal main window and cleanup
      if (window.opener && !window.opener.closed) {
        // Signal to main window
        localStorage.setItem(
          "videocall_ended",
          JSON.stringify({
            timestamp: Date.now(),
            roomId: currentRoomId,
          })
        );

        // Disconnect popup socket
        disconnectSocket();
      }

      // Xóa localStorage khi component unmount (phòng trường hợp chưa xóa)
      if (currentRoomId) {
        localStorage.removeItem(`videocall_${currentRoomId}`);
      }

      // Clear call state on unmount
      endCall();
    };
  }, []); // Empty dependencies - chỉ chạy 1 lần

  const handleMeetingLeave = async () => {
    try {
      // Emit socket event để notify rằng user đã left call
      const socket = getSocket();
      if (socket && authUser && meetingId) {
        socket.emit("call:left", {
          roomId: meetingId,
          userId: authUser._id,
        });
      }

      if (meetingId) {
        await leaveVideoRoom(meetingId);
      }

      // Clear call state (set isInCall = false)
      endCall();
      setMeetingLeft(true);

      // Signal to main window that call ended (if this is popup)
      if (window.opener && !window.opener.closed) {
        localStorage.setItem(
          "videocall_ended",
          JSON.stringify({
            timestamp: Date.now(),
            roomId: meetingId,
          })
        );
        // Remove it immediately to trigger storage event
        setTimeout(() => {
          localStorage.removeItem("videocall_ended");
        }, 100);
      }

      // Clean up localStorage
      if (roomId) {
        localStorage.removeItem(`videocall_${roomId}`);
      }

      // Đóng cửa sổ nếu đây là popup window, nếu không thì navigate về chat
      if (window.opener && !window.opener.closed) {
        window.close();
      } else {
        navigate("/chat");
      }
    } catch (error) {
      // Clear call state even on error
      endCall();

      // Signal to main window even on error
      if (window.opener && !window.opener.closed) {
        localStorage.setItem(
          "videocall_ended",
          JSON.stringify({
            timestamp: Date.now(),
            roomId: meetingId,
            error: true,
          })
        );
        setTimeout(() => {
          localStorage.removeItem("videocall_ended");
        }, 100);
      }

      // Clean up localStorage
      if (roomId) {
        localStorage.removeItem(`videocall_${roomId}`);
      }

      // Đóng cửa sổ nếu đây là popup window, nếu không thì navigate về chat
      if (window.opener && !window.opener.closed) {
        window.close();
      } else {
        navigate("/chat");
      }
    }
  };

  // Handle close from CallEndedView
  const handleCloseEndedView = async () => {
    // Cleanup
    const socket = getSocket();
    if (socket && authUser && meetingId) {
      socket.emit("call:left", {
        roomId: meetingId,
        userId: authUser._id,
      });
    }

    if (meetingId) {
      await leaveVideoRoom(meetingId).catch((err) => {});
    }

    endCall();

    // Signal to main window
    if (window.opener && !window.opener.closed) {
      localStorage.setItem(
        "videocall_ended",
        JSON.stringify({
          timestamp: Date.now(),
          roomId: meetingId,
        })
      );
      setTimeout(() => {
        localStorage.removeItem("videocall_ended");
      }, 100);
    }

    // Close window
    if (window.opener && !window.opener.closed) {
      window.close();
    } else {
      navigate("/chat");
    }
  };

  // Show call ended view if call was terminated
  if (callEndReason) {
    return (
      <CallEndedView reason={callEndReason} onClose={handleCloseEndedView} />
    );
  }

  // Show loading - wait for username if still "Guest"
  if (!isReady || !token || !meetingId) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="text-white text-lg">Connecting...</p>
        </div>
      </div>
    );
  }

  // Ensure we have username before rendering MeetingProvider
  if (!participantName || participantName === "Guest") {
    // Try to get username from authUser or store
    const username =
      authUser?.username || useAuthStore.getState().user?.username;
    if (username) {
      setParticipantName(username);
      // Return loading while updating
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="text-white text-lg">Loading...</p>
          </div>
        </div>
      );
    }
  }

  // Show meeting view
  // Use key to force re-render when participantName changes
  return (
    <MeetingAppProvider>
      <MeetingProvider
        key={participantName} // Force re-render when name changes
        config={{
          meetingId: meetingId,
          micEnabled: micOn,
          webcamEnabled: webcamOn,
          name: participantName,
          multiStream: true, // Enable multi-stream for better quality
        }}
        token={token}
        joinWithoutUserInteraction={true}
      >
        <MeetingView
          onMeetingLeave={handleMeetingLeave}
          onMeetingJoined={() => {
            // Clear call end reason when meeting successfully joins
            if (callEndReason) {
              setCallEndReason(null);
            }
          }}
        />
      </MeetingProvider>
    </MeetingAppProvider>
  );
};

export default VideoCallPage;
