import VideoCall from "../models/VideoCall.js";

// Tạo cuộc gọi mới
export const createCall = async (initiatorId, participantIds) => {
  const roomId = `room_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 8)}`;
  const call = new VideoCall({
    roomId,
    participants: [initiatorId, ...participantIds],
    startedAt: new Date(),
    status: "active",
  });
  return await call.save();
};

// Thêm người tham gia
export const joinCall = async (roomId, userId) => {
  const call = await VideoCall.findOneAndUpdate(
    { roomId, status: "active" },
    { $addToSet: { participants: userId } },
    { new: true }
  );
  if (!call) throw new Error("Call not found or already ended");
  return call;
};

// Rời khỏi cuộc gọi
export const leaveCall = async (roomId, userId) => {
  const call = await VideoCall.findOneAndUpdate(
    { roomId },
    { $pull: { participants: userId } },
    { new: true }
  );
  return call;
};

// Kết thúc cuộc gọi
export const endCall = async (roomId) => {
  return await VideoCall.findOneAndUpdate(
    { roomId },
    { status: "ended", endedAt: new Date() },
    { new: true }
  );
};

// Lấy lịch sử cuộc gọi của người dùng
export const getUserCallHistory = async (userId) => {
  return await VideoCall.find({ participants: userId })
    .populate("participants", "username avatarUrl")
    .sort({ createdAt: -1 });
};
