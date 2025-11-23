import * as videoCallService from "../services/videoCall.service.js";

// Get VideoSDK token to initialize call
export const getVideoSDKToken = async (req, res) => {
  try {
    const token = await videoCallService.generateVideoSDKToken();
    res.json({ token });
  } catch (error) {
    console.error("Error in getVideoSDKToken:", error);
    res.status(500).json({ message: error.message });
  }
};

// Create new VideoSDK room
export const createRoom = async (req, res) => {
  try {
    const { participantIds } = req.body;
    const initiatorId = req.user._id;

    const token = await videoCallService.generateVideoSDKToken();
    const roomData = await videoCallService.createVideoSDKRoom(token);

    if (roomData.err) {
      return res.status(400).json({ message: roomData.err });
    }

    // Save to database
    const call = await videoCallService.createCall(
      initiatorId,
      participantIds,
      roomData.roomId
    );

    res.json({
      success: true,
      roomId: roomData.roomId,
      token,
      call,
    });
  } catch (error) {
    console.error("Error in createRoom:", error);
    res.status(500).json({ message: error.message });
  }
};

// Validate and join room
export const validateAndJoinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    const token = await videoCallService.generateVideoSDKToken();
    const validation = await videoCallService.validateVideoSDKRoom(
      roomId,
      token
    );

    if (validation.err) {
      return res.status(400).json({ message: validation.err });
    }

    // Update database
    const call = await videoCallService.joinCall(roomId, userId);

    res.json({
      success: true,
      roomId: validation.roomId,
      token,
      call,
    });
  } catch (error) {
    console.error("Error in validateAndJoinRoom:", error);
    res.status(500).json({ message: error.message });
  }
};

// Leave call
export const leaveCall = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    const call = await videoCallService.leaveCall(roomId, userId);

    res.json({
      success: true,
      call,
    });
  } catch (error) {
    console.error("Error in leaveCall:", error);
    res.status(500).json({ message: error.message });
  }
};

// End call (only initiator is allowed)
export const endCall = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    // Check if user is the initiator
    const call = await videoCallService.getCallByRoomId(roomId);
    if (!call) {
      return res.status(404).json({ message: "Call not found" });
    }

    if (call.participants[0].toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Only the initiator can end the call" });
    }

    const updatedCall = await videoCallService.endCall(roomId);

    res.json({
      success: true,
      call: updatedCall,
    });
  } catch (error) {
    console.error("Error in endCall:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get call history
export const getCallHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const calls = await videoCallService.getUserCallHistory(userId);

    res.json({
      success: true,
      calls,
    });
  } catch (error) {
    console.error("Error in getCallHistory:", error);
    res.status(500).json({ message: error.message });
  }
};
