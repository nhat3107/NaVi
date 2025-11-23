import React from "react";
import { useNavigate } from "react-router-dom";

const ProfileHeader = ({
  profileUser,
  isOwnProfile,
  isPrivate,
  isFollowingUser,
  handleFollowToggle,
  isFollowing,
  isUnfollowing,
  onShowFollowersModal,
  onShowFollowingModal,
  followersCount,
  followingCount,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div className="relative">
            {profileUser.avatarUrl ? (
              <img
                src={profileUser.avatarUrl}
                alt={profileUser.username}
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-100">
                {profileUser.username?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            
            {/* Privacy badge */}
            {profileUser.settings?.privacy === "private" && (
              <div className="absolute bottom-0 right-0 bg-gray-900 text-white px-2 py-1 rounded-full text-xs">
                <svg className="w-3 h-3 inline" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{profileUser.username}</h1>
            
            {!isPrivate && profileUser.bio && (
              <p className="text-gray-600 mt-2 max-w-xl">{profileUser.bio}</p>
            )}

            {/* Stats */}
            <div className="flex items-center space-x-6 mt-4">
              <button
                onClick={onShowFollowersModal}
                className="text-center hover:text-blue-600 transition-colors"
              >
                <div className="font-bold text-gray-900">{followersCount}</div>
                <div className="text-sm text-gray-500">Followers</div>
              </button>
              
              <button
                onClick={onShowFollowingModal}
                className="text-center hover:text-blue-600 transition-colors"
              >
                <div className="font-bold text-gray-900">{followingCount}</div>
                <div className="text-sm text-gray-500">Following</div>
              </button>
            </div>

            {/* Joined Date */}
            {profileUser.createdAt && (
              <p className="text-sm text-gray-500 mt-3">
                Joined {new Date(profileUser.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric"
                })}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div>
          {isOwnProfile ? (
            <button
              onClick={() => navigate("/profile/edit")}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </button>
          ) : (
            <button
              onClick={handleFollowToggle}
              disabled={isFollowing || isUnfollowing}
              className={`px-6 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed ${
                isFollowingUser
                  ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isFollowing || isUnfollowing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isFollowing ? "Following..." : "Unfollowing..."}
                </>
              ) : (
                <>
                  {isFollowingUser ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Following
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Follow
                    </>
                  )}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;

