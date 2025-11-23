import { useMeeting } from "@videosdk.live/react-sdk";
import { useEffect } from "react";
import ParticipantGrid from "./ParticipantGrid";
import Controls from "./Controls";
import PresenterView from "./PresenterView";
import toast from "react-hot-toast";
import { useVideoCallStore } from "../../stores/useVideoCallStore";

export const MeetingView = ({ onMeetingLeave, onMeetingJoined }) => {
  const { meetingId, participants, presenterId } = useMeeting({
    onMeetingJoined: () => {
      if (onMeetingJoined) {
        onMeetingJoined();
      }
    },
    onMeetingLeft: () => {
      if (onMeetingLeave) onMeetingLeave();
    },
    onParticipantJoined: (participant) => {},
    onParticipantLeft: (participant) => {},
    onPresenterChanged: (presenterId) => {},
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const { setParticipants } = useVideoCallStore();
  const isPresenting = presenterId !== null;

  useEffect(() => {
    if (participants) {
      setParticipants([...participants.values()]);
    }
  }, [participants, setParticipants]);

  return (
    <div className="relative h-screen w-screen bg-gray-900">
      <div className="absolute top-4 left-4 z-20 bg-black bg-opacity-60 px-4 py-2 rounded-lg">
        <p className="text-white text-sm">
          Meeting ID: <span className="font-mono font-bold">{meetingId}</span>
        </p>
      </div>

      <div className="absolute top-4 right-4 z-20 bg-black bg-opacity-60 px-4 py-2 rounded-lg">
        <p className="text-white text-sm flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          {participants ? participants.size : 0}
        </p>
      </div>

      {isPresenting ? (
        <div className="h-full flex transition-all duration-300">
          <div className="flex-1 h-full bg-gray-950">
            <PresenterView presenterId={presenterId} />
          </div>

          <div className="w-80 h-full bg-gray-900 border-l border-gray-800 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
            <div className="p-4 sticky top-0 bg-gray-900 border-b border-gray-800 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-white text-sm font-semibold">
                    Participants ({participants ? participants.size : 0})
                  </p>
                </div>
              </div>
            </div>
            <div className="p-3">
              <ParticipantGrid isPresenting={true} />
            </div>
          </div>
        </div>
      ) : (
        <ParticipantGrid isPresenting={false} />
      )}

      <Controls onLeave={onMeetingLeave} presenterId={presenterId} />
    </div>
  );
};

export default MeetingView;

