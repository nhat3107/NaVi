// store/useCallStore.js
export const useCallStore = create((set) => ({
  isInCall: false,
  currentRoom: null,
  participants: [],
  startCall: (roomId) => set({ isInCall: true, currentRoom: roomId }),
  endCall: () => set({ isInCall: false, currentRoom: null }),
}));
