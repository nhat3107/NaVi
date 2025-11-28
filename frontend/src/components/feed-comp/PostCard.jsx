import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { toggleLike, deletePost } from "../../lib/api";
import toast from "react-hot-toast";
import CommentSection from "./CommentSection";

const PostCard = ({ post, currentUserId, currentUser, onPostDeleted, onPostUpdated }) => {
  const [isLiked, setIsLiked] = useState(
    post.likes?.includes(currentUserId) || false
  );
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const isOwnPost = post.authorId?._id === currentUserId;

  // Check if content is too long (more than 3 lines or 300 characters)
  const isLongContent = post.content && (
    post.content.length > 300 || 
    post.content.split('\n').length > 3
  );

  // Get truncated content
  const getTruncatedContent = () => {
    if (!post.content) return '';
    const lines = post.content.split('\n');
    if (lines.length > 3) {
      return lines.slice(0, 3).join('\n');
    }
    return post.content.slice(0, 300);
  };

  const handleLike = async () => {
    try {
      const response = await toggleLike(post._id);
      setIsLiked(response.liked);
      setLikesCount(response.likesCount);
      
      // Update parent if needed
      if (onPostUpdated) {
        onPostUpdated(post._id, { likes: response.post.likes });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like");
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
    setShowMenu(false);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deletePost(post._id);
      toast.success("Post deleted successfully");
      
      if (onPostDeleted) {
        onPostDeleted(post._id);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error(error.response?.data?.message || "Failed to delete post");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Post Header */}
      <div className="p-2.5 sm:p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 flex items-center justify-center text-white font-semibold flex-shrink-0">
            {post.authorId?.avatarUrl ? (
              <img
                src={post.authorId.avatarUrl}
                alt={post.authorId.username}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-xs sm:text-sm">{post.authorId?.username?.[0]?.toUpperCase() || "U"}</span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
              {post.authorId?.fullName || post.authorId?.username || "Unknown User"}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{formatDate(post.createdAt)}</p>
          </div>
        </div>

        {/* More Menu */}
        {isOwnPost && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 sm:p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-36 sm:w-44 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <button
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs sm:text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Post</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      {post.content && (
        <div className="px-2.5 sm:px-3 pb-2.5 sm:pb-3">
          <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words leading-relaxed">
            {isLongContent && !isExpanded ? getTruncatedContent() : post.content}
            {isLongContent && !isExpanded && '...'}
          </p>
          {isLongContent && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium text-xs sm:text-sm mt-1.5 sm:mt-2 transition-colors"
            >
              {isExpanded ? 'See less' : 'See more'}
            </button>
          )}
        </div>
      )}

      {/* Post Media */}
      {post.media && post.media.length > 0 && (
        <div
          className={`grid gap-0.5 sm:gap-1 ${
            post.media.length === 1
              ? "grid-cols-1"
              : post.media.length === 2
              ? "grid-cols-2"
              : post.media.length === 3
              ? "grid-cols-2"
              : "grid-cols-2"
          }`}
        >
          {post.media.slice(0, 4).map((media, index) => (
            <div
              key={index}
              className={`relative ${
                post.media.length === 3 && index === 0
                  ? "col-span-2"
                  : ""
              }`}
            >
              {media.type === 'video' ? (
                <video
                  src={media.url}
                  controls
                  className={`w-full ${
                    post.media.length === 1
                      ? "max-h-[500px] sm:max-h-[600px] object-contain bg-gray-50 dark:bg-gray-800"
                      : "h-48 sm:h-64 object-cover"
                  }`}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={media.url}
                  alt={`Post media ${index + 1}`}
                  className={`w-full ${
                    post.media.length === 1
                      ? "max-h-[500px] sm:max-h-[600px] object-contain bg-gray-50 dark:bg-gray-800"
                      : "h-48 sm:h-64 object-cover"
                  }`}
                />
              )}
              {index === 3 && post.media.length > 4 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white text-xl sm:text-2xl font-bold">
                    +{post.media.length - 4}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Post Stats */}
      <div className="px-2.5 sm:px-3 py-2 sm:py-2.5 flex items-center justify-between text-sm sm:text-base text-gray-700 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700">
        <span className="font-semibold">{likesCount} {likesCount === 1 ? "like" : "likes"}</span>
        <span className="font-semibold">{commentsCount} {commentsCount === 1 ? "comment" : "comments"}</span>
      </div>

      {/* Action Buttons */}
      <div className="px-2.5 sm:px-3 py-2 sm:py-2.5 flex items-center justify-around border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={handleLike}
          className="flex items-center space-x-2 sm:space-x-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Heart className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${isLiked ? "fill-red-600 text-red-600 dark:fill-red-500 dark:text-red-500" : ""}`} />
          <span className="text-sm sm:text-base font-semibold">Like</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 sm:space-x-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-sm sm:text-base font-semibold">Comment</span>
        </button>

        <button className="flex items-center space-x-2 sm:space-x-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-sm sm:text-base font-semibold">Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <CommentSection
          postId={post._id}
          currentUserId={currentUserId}
          currentUser={currentUser}
          onCommentCountChange={setCommentsCount}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Delete this post?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                This action can't be undone. Your post will be permanently removed from your profile and the feed.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 dark:bg-red-500 text-white rounded-lg font-medium hover:bg-red-700 dark:hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;

