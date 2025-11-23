import React from "react";
import { useNavigate } from "react-router-dom";
import { useFollowing } from "../../hooks/useFollowers";
import useFollowUser from "../../hooks/useFollowUser";
import useAuthUser from "../../hooks/useAuthUser";

const FollowingModal = ({ userId, onClose }) => {
  const navigate = useNavigate();
  const { authUser } = useAuthUser();
  const { following, isLoading } = useFollowing(userId);
  const { followUser, unfollowUser, isFollowing, isUnfollowing } = useFollowUser();

  const handleUserClick = (followingId) => {
    onClose();
    navigate(`/profile/${followingId}`);
  };

  const handleFollowToggle = (followingId, e) => {
    e.stopPropagation();
    const isFollowingUser = authUser?.following?.includes(followingId);
    
    if (isFollowingUser) {
      unfollowUser(followingId);
    } else {
      followUser(followingId);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-gray-900/20 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl max-w-md w-full max-h-[600px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Following</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : following.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Not following anyone yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {following.map((user) => {
                const isOwnProfile = authUser?._id === user._id;
                const isFollowingThisUser = authUser?.following?.includes(user._id);

                return (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                    onClick={() => handleUserClick(user._id)}
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.username}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {user.username?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {user.username}
                        </p>
                        {user.bio && (
                          <p className="text-sm text-gray-500 truncate">
                            {user.bio}
                          </p>
                        )}
                      </div>
                    </div>

                    {!isOwnProfile && (
                      <button
                        onClick={(e) => handleFollowToggle(user._id, e)}
                        disabled={isFollowing || isUnfollowing}
                        className={`ml-3 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0 disabled:opacity-50 ${
                          isFollowingThisUser
                            ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {isFollowingThisUser ? "Unfollow" : "Follow"}
                      </button>
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

export default FollowingModal;

