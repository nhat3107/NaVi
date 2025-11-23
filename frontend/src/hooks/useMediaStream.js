import { createCameraVideoTrack, createMicrophoneAudioTrack } from "@videosdk.live/react-sdk";

/**
 * Custom hook to create optimized media tracks with quality settings
 */
const useMediaStream = () => {
  /**
   * Get optimized video track with HD quality
   * @param {Object} options - Track options
   * @param {string} options.webcamId - Webcam device ID
   * @param {string} options.encoderConfig - Video encoder config (default: h720p_w1280p for HD)
   * @returns {Promise<MediaStreamTrack|null>}
   */
  const getVideoTrack = async ({ webcamId, encoderConfig = "h720p_w1280p" }) => {
    try {
      const track = await createCameraVideoTrack({
        cameraId: webcamId,
        encoderConfig: encoderConfig, // HD quality: 720p
        optimizationMode: "motion", // Optimize for motion (better for video calls)
        multiStream: true, // Enable multi-stream for better quality
      });

      return track;
    } catch (error) {
      return null;
    }
  };

  /**
   * Get optimized audio track
   * @param {Object} options - Track options
   * @param {string} options.micId - Microphone device ID
   * @returns {Promise<MediaStreamTrack|null>}
   */
  const getAudioTrack = async ({ micId }) => {
    try {
      const track = await createMicrophoneAudioTrack({
        microphoneId: micId,
        // Audio quality is automatically optimized by VideoSDK
      });

      return track;
    } catch (error) {
      return null;
    }
  };

  return { getVideoTrack, getAudioTrack };
};

export default useMediaStream;

