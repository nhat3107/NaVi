import React, { useState, useEffect } from "react";
import { Send, Trash2, Loader2 } from "lucide-react";
import { getComments, addComment, deleteComment } from "../../lib/api";
import toast from "react-hot-toast";

const CommentSection = ({ postId, currentUserId, currentUser, onCommentCountChange }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const fetchComments = async (pageNum = 1) => {
    try {
      setIsLoading(true);
      const response = await getComments(postId, pageNum, 20);
      
      if (pageNum === 1) {
        setComments(response.comments);
      } else {
        setComments((prev) => [...prev, ...response.comments]);
      }
      
      setHasMore(response.hasMore);
      setPage(pageNum);
      
      if (onCommentCountChange) {
        onCommentCountChange(response.total);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(1);
  }, [postId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await addComment(postId, newComment.trim());
      
      setComments((prev) => [response.comment, ...prev]);
      setNewComment("");
      toast.success("Comment added");
      
      if (onCommentCountChange) {
        onCommentCountChange((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error(error.response?.data?.message || "Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((comment) => comment._id !== commentId));
      toast.success("Comment deleted");
      
      if (onCommentCountChange) {
        onCommentCountChange((prev) => prev - 1);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error(error.response?.data?.message || "Failed to delete comment");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
      {/* Add Comment Form */}
      <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmitComment} className="flex items-center space-x-2">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 flex items-center justify-center text-white text-sm font-semibold">
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm">{currentUser?.username?.[0]?.toUpperCase() || "U"}</span>
              )}
            </div>
          </div>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
              disabled={isSubmitting}
            />
            
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full transition-all ${
                newComment.trim() && !isSubmitting
                  ? "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                  : "text-gray-400 dark:text-gray-500 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {isLoading && comments.length === 0 ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 dark:text-gray-500" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment._id} className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 flex items-center justify-center text-white text-sm font-semibold">
                    {comment.authorId?.avatarUrl ? (
                      <img
                        src={comment.authorId.avatarUrl}
                        alt={comment.authorId.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      comment.authorId?.username?.[0]?.toUpperCase() || "U"
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        {comment.authorId?.fullName || comment.authorId?.username || "Unknown User"}
                      </h4>
                      
                      {comment.authorId?._id === currentUserId && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Delete comment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <p className="text-gray-800 dark:text-gray-200 text-sm">{comment.content}</p>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-4">
                    {formatDate(comment.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <button
            onClick={() => fetchComments(page + 1)}
            className="w-full mt-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load more comments"}
          </button>
        )}
      </div>
    </div>
  );
};

export default CommentSection;

