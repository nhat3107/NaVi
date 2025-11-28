import React, { useEffect, useRef, useCallback } from "react";
import CreatePost from "./CreatePost";
import PostCard from "./PostCard";
import usePosts from "../../hooks/usePosts";
import { Loader2 } from "lucide-react";

const FeedContainer = ({ currentUser, feedType = "feed", userId = null }) => {
  const {
    posts,
    isLoading,
    hasMore,
    loadMore,
    isFetchingNextPage,
    addNewPost,
    removePost,
    updatePost,
  } = usePosts(feedType, userId);

  const observerRef = useRef();
  const lastPostRef = useRef();

  // Infinite scroll observer
  const handleObserver = useCallback(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isFetchingNextPage) {
        loadMore();
      }
    },
    [hasMore, isFetchingNextPage, loadMore]
  );

  useEffect(() => {
    const element = lastPostRef.current;
    const option = {
      root: null,
      rootMargin: "20px",
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver(handleObserver, option);

    if (element) {
      observerRef.current.observe(element);
    }

    return () => {
      if (element && observerRef.current) {
        observerRef.current.unobserve(element);
      }
    };
  }, [handleObserver]);

  const handlePostCreated = (newPost) => {
    addNewPost(newPost);
  };

  const handlePostDeleted = (postId) => {
    removePost(postId);
  };

  const handlePostUpdated = (postId, updatedData) => {
    updatePost(postId, updatedData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-2.5 sm:px-3 md:px-4 py-2.5 sm:py-3 md:py-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Create Post Section - Only show for feed type */}
      {feedType === "feed" && currentUser && (
        <div className="mb-2 sm:mb-3">
          <CreatePost
            onPostCreated={handlePostCreated}
            userAvatar={currentUser.avatarUrl}
            userName={currentUser.fullName || currentUser.username}
          />
        </div>
      )}

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg
              className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No posts yet
          </h3>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            {feedType === "feed"
              ? "Be the first to share something!"
              : "No posts to display."}
          </p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {posts.map((post, index) => (
            <div
              key={post._id}
              ref={index === posts.length - 1 ? lastPostRef : null}
            >
              <PostCard
                post={post}
                currentUserId={currentUser?._id}
                currentUser={currentUser}
                onPostDeleted={handlePostDeleted}
                onPostUpdated={handlePostUpdated}
              />
            </div>
          ))}
        </div>
      )}

      {/* Loading More Indicator */}
      {isFetchingNextPage && (
        <div className="flex justify-center items-center py-4 sm:py-6">
          <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
        </div>
      )}

      {/* End of Feed Message */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-4 sm:py-6 text-sm sm:text-base text-gray-500 dark:text-gray-400">
          <p>You've reached the end of the feed</p>
        </div>
      )}
    </div>
  );
};

export default FeedContainer;

