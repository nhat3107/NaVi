import { useParticipant } from "@videosdk.live/react-sdk";
import { useEffect, useRef, useState } from "react";
import { useMeetingAppContext } from "../../contexts/MeetingAppContext";

export const ParticipantView = ({ participantId, isPresenting = false }) => {
  const { displayName, webcamStream, micStream, webcamOn, micOn, isLocal } =
    useParticipant(participantId);

  const { selectedSpeaker } = useMeetingAppContext();
  const micRef = useRef(null);
  const videoRef = useRef(null);
  const [mouseOver, setMouseOver] = useState(false);

  useEffect(() => {
    if (micRef.current) {
      if (micOn && micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);
        micRef.current.srcObject = mediaStream;
        micRef.current
          .play()
          .catch((error) => {});
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);

  useEffect(() => {
    if (videoRef.current && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      videoRef.current.srcObject = mediaStream;
      
      videoRef.current.setAttribute("playsinline", "true");
      videoRef.current.setAttribute("webkit-playsinline", "true");
      
      videoRef.current
        .play()
        .catch((error) => {});
    }
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [webcamStream]);

  return (
    <div
      onMouseEnter={() => setMouseOver(true)}
      onMouseLeave={() => setMouseOver(false)}
      className={`relative bg-gray-800 rounded-lg overflow-hidden transition-all duration-200 ${
        isPresenting 
          ? "h-40 min-h-[160px] hover:bg-gray-750" 
          : "h-full w-full"
      }`}
    >
      <audio ref={micRef} autoPlay muted={isLocal} />

      {webcamOn && webcamStream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          webkit-playsinline="true"
          muted
          preload="auto"
          className="h-full w-full object-cover"
          style={{ 
            transform: "scaleX(-1)",
            willChange: "transform",
            imageRendering: "crisp-edges",
          }}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-gray-900">
          <div className="flex flex-col items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
              {displayName?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <p className="mt-4 text-white text-lg">{displayName || "Unknown"}</p>
          </div>
        </div>
      )}

      <div
        className={`absolute bottom-0 left-0 right-0 px-3 py-2 rounded-b-lg bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-200 ${
          isPresenting 
            ? "opacity-100"
            : mouseOver 
              ? "opacity-100" 
              : "opacity-0"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!micOn && (
              <svg
                className="w-4 h-4 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span className="text-white text-sm font-medium truncate">
              {isLocal ? "You" : displayName || "Participant"}
            </span>
          </div>
          {!webcamOn && (
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantView;

