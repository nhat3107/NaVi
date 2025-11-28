import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import useAuthUser from "../hooks/useAuthUser";
import useUserProfile from "../hooks/useUserProfile";
import useFollowUser from "../hooks/useFollowUser";
import { useFollowers, useFollowing } from "../hooks/useFollowers";
import usePosts from "../hooks/usePosts";
import FollowersModal from "../components/profile-comp/FollowersModal";
import FollowingModal from "../components/profile-comp/FollowingModal";
import ProfileHeader from "../components/profile-comp/ProfileHeader";
import PrivateProfileMessage from "../components/profile-comp/PrivateProfileMessage";
import ProfilePosts from "../components/profile-comp/ProfilePosts";

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthUser();
  const { user: profileUser, isPrivate, isLoading } = useUserProfile(userId);
  const { followUser, unfollowUser, isFollowing, isUnfollowing } = useFollowUser();
  const { followers } = useFollowers(userId);
  const { following } = useFollowing(userId);
  const { 
    posts, 
    isLoading: postsLoading, 
    hasMore, 
    loadMore, 
    isFetchingNextPage,
    updatePost,
    removePost 
  } = usePosts("user", userId);
  
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  const isOwnProfile = authUser?._id === userId;
  const isFollowingUser = authUser?.following?.includes(userId);

  const handleFollowToggle = () => {
    if (isFollowingUser) {
      unfollowUser(userId);
    } else {
      followUser(userId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex-1 md:ml-20 pb-16 md:pb-0 flex items-center justify-center">
          <div className="text-base sm:text-lg text-gray-600 dark:text-gray-400">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex-1 md:ml-20 pb-16 md:pb-0 flex items-center justify-center">
          <div className="text-center px-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">User not found</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">This user doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 text-sm sm:text-base bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="flex-1 md:ml-20 overflow-y-auto pb-16 md:pb-0">
        <div className="max-w-3xl mx-auto p-3 sm:p-4 md:p-6">
          {/* Header */}
          <ProfileHeader
            profileUser={profileUser}
            isOwnProfile={isOwnProfile}
            isPrivate={isPrivate}
            isFollowingUser={isFollowingUser}
            handleFollowToggle={handleFollowToggle}
            isFollowing={isFollowing}
            isUnfollowing={isUnfollowing}
            onShowFollowersModal={() => setShowFollowersModal(true)}
            onShowFollowingModal={() => setShowFollowingModal(true)}
            followersCount={followers.length}
            followingCount={following.length}
          />

          {/* Private Profile Message */}
          {isPrivate && !isOwnProfile && <PrivateProfileMessage />}

          {/* Posts Section - Only show if not private or is own profile */}
          {(!isPrivate || isOwnProfile) && (
            <ProfilePosts
              posts={posts}
              isLoading={postsLoading}
              hasMore={hasMore}
              loadMore={loadMore}
              isFetchingNextPage={isFetchingNextPage}
              authUser={authUser}
              isOwnProfile={isOwnProfile}
              onPostDeleted={removePost}
              onPostUpdated={updatePost}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {showFollowersModal && (
        <FollowersModal
          userId={userId}
          onClose={() => setShowFollowersModal(false)}
        />
      )}
      
      {showFollowingModal && (
        <FollowingModal
          userId={userId}
          onClose={() => setShowFollowingModal(false)}
        />
      )}
    </div>
  );
};

export default ProfilePage;

