import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFollowers } from "../../hooks/useFollowers";
import useFollowUser from "../../hooks/useFollowUser";
import useAuthUser from "../../hooks/useAuthUser";
import { createPersonalChat } from "../../lib/api";
import { useChatStore } from "../../stores/useChatStore";
import toast from "react-hot-toast";

const FollowersModal = ({ userId, onClose }) => {
  const navigate = useNavigate();
  const { authUser } = useAuthUser();
  const { followers, isLoading } = useFollowers(userId);
  const { followUser, unfollowUser, isFollowing, isUnfollowing } = useFollowUser();
  const { setCurrentChat } = useChatStore();
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const handleUserClick = (followerId) => {
    onClose();
    navigate(`/profile/${followerId}`);
  };

  const handleFollowToggle = (followerId, e) => {
    e.stopPropagation();
    const isFollowingUser = authUser?.following?.includes(followerId);
    
    if (isFollowingUser) {
      unfollowUser(followerId);
    } else {
      followUser(followerId);
    }
  };

  const handleMessage = async (followerId, e) => {
    e.stopPropagation();
    setIsCreatingChat(true);
    try {
      // Create or get existing chat with this user
      const response = await createPersonalChat([followerId]);
      if (response.chat) {
        // Set the current chat in the store
        setCurrentChat(response.chat._id);
        onClose();
        navigate(`/chat`);
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Failed to open chat. Please try again.");
    } finally {
      setIsCreatingChat(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[600px] flex flex-col border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Followers</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
          ) : followers.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No followers yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {followers.map((follower) => {
                const isOwnProfile = authUser?._id === follower._id;
                const isFollowingThisUser = authUser?.following?.includes(follower._id);

                return (
                  <div
                    key={follower._id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                    onClick={() => handleUserClick(follower._id)}
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {follower.avatarUrl ? (
                        <img
                          src={follower.avatarUrl}
                          alt={follower.username}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {follower.username?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {follower.username}
                        </p>
                        {follower.bio && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {follower.bio}
                          </p>
                        )}
                      </div>
                    </div>

                    {!isOwnProfile && (
                      <>
                        {isFollowingThisUser ? (
                          // Show Message button when both follow each other
                          <button
                            onClick={(e) => handleMessage(follower._id, e)}
                            disabled={isCreatingChat}
                            className="ml-3 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isCreatingChat ? "Opening..." : "Message"}
                          </button>
                        ) : (
                          // Show Follow button when not following
                          <button
                            onClick={(e) => handleFollowToggle(follower._id, e)}
                            disabled={isFollowing || isUnfollowing}
                            className="ml-3 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0 disabled:opacity-50 bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600"
                          >
                            Follow
                          </button>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowersModal;

