import { useParticipant } from "@videosdk.live/react-sdk";
import { useEffect, useRef, useState } from "react";

export const PresenterView = ({ presenterId }) => {
  const { displayName, screenShareStream, screenShareOn } =
    useParticipant(presenterId);

  const screenShareRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (screenShareRef.current && screenShareStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(screenShareStream.track);
      screenShareRef.current.srcObject = mediaStream;
      
      screenShareRef.current.setAttribute("playsinline", "true");
      screenShareRef.current.setAttribute("webkit-playsinline", "true");
      
      screenShareRef.current
        .play()
        .catch((error) => {});
    }
    
    return () => {
      if (screenShareRef.current && screenShareRef.current.srcObject) {
        screenShareRef.current.srcObject.getTracks().forEach(track => track.stop());
        screenShareRef.current.srcObject = null;
      }
    };
  }, [screenShareStream]);

  const toggleFullscreen = () => {
    if (!screenShareRef.current) return;

    if (!document.fullscreenElement) {
      screenShareRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <div className="relative h-full w-full bg-gray-950 flex items-center justify-center overflow-hidden">
      {screenShareOn && screenShareStream ? (
        <>
          <video
            ref={screenShareRef}
            autoPlay
            playsInline
            webkit-playsinline="true"
            preload="auto"
            className="h-full w-full object-contain"
            style={{
              willChange: "transform",
              imageRendering: "crisp-edges",
            }}
          />
          
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 via-black/60 to-transparent px-6 py-3 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">
                    {displayName} is sharing screen
                  </p>
                  <p className="text-gray-300 text-xs">Screen sharing active</p>
                </div>
              </div>
              
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center animate-pulse">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-gray-300 font-medium">Loading screen share...</p>
            <p className="text-gray-500 text-sm mt-1">Please wait a moment</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresenterView;

