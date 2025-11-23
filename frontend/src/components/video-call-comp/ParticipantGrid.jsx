import { useMeeting } from "@videosdk.live/react-sdk";
import { useMemo } from "react";
import ParticipantView from "./ParticipantView";

export const ParticipantGrid = ({ isPresenting = false }) => {
  const { participants } = useMeeting();

  const participantIds = useMemo(
    () => [...participants.keys()],
    [participants]
  );

  const gridClass = useMemo(() => {
    if (isPresenting) {
      // Khi có screen share: vertical list
      return "grid-cols-1";
    }

    // Layout bình thường
    const count = participantIds.length;
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count <= 4) return "grid-cols-2 grid-rows-2";
    if (count <= 6) return "grid-cols-3 grid-rows-2";
    return "grid-cols-3 grid-rows-3";
  }, [participantIds.length, isPresenting]);

  return (
    <div
      className={`grid ${gridClass} ${
        isPresenting 
          ? "gap-3 auto-rows-fr" 
          : "gap-2 h-full w-full p-4"
      }`}
    >
      {participantIds.map((participantId) => (
        <ParticipantView
          key={participantId}
          participantId={participantId}
          isPresenting={isPresenting}
        />
      ))}
    </div>
  );
};

export default ParticipantGrid;

