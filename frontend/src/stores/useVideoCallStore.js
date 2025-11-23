import { create } from "zustand";

export const useVideoCallStore = create((set, get) => ({
  // Video call state
  isInCall: false,
  currentRoomId: null,
  callToken: null,
  participants: [],
  micOn: false,
  webcamOn: false,
  isMeetingStarted: false,
  isMeetingLeft: false,
  callInitiator: null,
  incomingCall: null,

  // Actions
  setIncomingCall: (callData) => set({ incomingCall: callData }),

  clearIncomingCall: () => set({ incomingCall: null }),

  startCall: ({ roomId, token, initiator }) =>
    set({
      isInCall: true,
      currentRoomId: roomId,
      callToken: token,
      callInitiator: initiator,
      isMeetingStarted: true,
      isMeetingLeft: false,
    }),

  endCall: () =>
    set({
      isInCall: false,
      currentRoomId: null,
      callToken: null,
      participants: [],
      isMeetingStarted: false,
      callInitiator: null,
      incomingCall: null,
    }),

  setMeetingLeft: (left) => set({ isMeetingLeft: left }),

  setMicOn: (on) => set({ micOn: on }),

  setWebcamOn: (on) => set({ webcamOn: on }),

  setParticipants: (participants) => set({ participants }),

  addParticipant: (participant) =>
    set((state) => ({
      participants: [...state.participants, participant],
    })),

  removeParticipant: (participantId) =>
    set((state) => ({
      participants: state.participants.filter((p) => p.id !== participantId),
    })),

  reset: () =>
    set({
      isInCall: false,
      currentRoomId: null,
      callToken: null,
      participants: [],
      micOn: false,
      webcamOn: false,
      isMeetingStarted: false,
      isMeetingLeft: false,
      callInitiator: null,
      incomingCall: null,
    }),
}));

