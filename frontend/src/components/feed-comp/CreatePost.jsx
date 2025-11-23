import React, { useState, useRef } from "react";
import useCreatePost from "../../hooks/useCreatePost";
import { X, Image, Smile } from "lucide-react";

const CreatePost = ({ onPostCreated, userAvatar, userName }) => {
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const { handleCreatePost, isCreating, isUploading } = useCreatePost();

  const handleMediaSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + mediaFiles.length > 4) {
      alert("You can only upload up to 4 media files");
      return;
    }

    const newMediaFiles = [...mediaFiles, ...files];
    setMediaFiles(newMediaFiles);

    // Generate previews with type info
    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image'
    }));
    setMediaPreviews([...mediaPreviews, ...newPreviews]);
  };

  const removeMedia = (index) => {
    const newMediaFiles = mediaFiles.filter((_, i) => i !== index);
    const newPreviews = mediaPreviews.filter((_, i) => i !== index);
    
    // Revoke URL to prevent memory leak
    URL.revokeObjectURL(mediaPreviews[index].url);
    
    setMediaFiles(newMediaFiles);
    setMediaPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newPost = await handleCreatePost(content.trim(), mediaFiles);
    
    if (newPost) {
      // Clear form
      setContent("");
      setMediaFiles([]);
      mediaPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
      setMediaPreviews([]);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      // Notify parent
      if (onPostCreated) {
        onPostCreated(newPost);
      }
    }
  };

  const isDisabled = (!content.trim() && mediaFiles.length === 0) || isCreating;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-4 mb-4 border border-gray-200 dark:border-gray-700">
      <form onSubmit={handleSubmit}>
        {/* Header - Single Line */}
        <div className="flex items-center space-x-3 mb-3">
          <div className="flex-shrink-0">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 flex items-center justify-center text-white font-semibold">
                {userName?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full px-4 py-2.5 border-none rounded-2xl bg-gray-100 dark:bg-gray-700 focus:outline-none focus:bg-gray-200 dark:focus:bg-gray-600 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors resize-none min-h-[42px] max-h-[200px] overflow-y-auto"
              disabled={isCreating}
              rows={1}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
            />
          </div>
        </div>

        {/* Media Previews */}
        {mediaPreviews.length > 0 && (
          <div className="mb-4 grid grid-cols-2 gap-2">
            {mediaPreviews.map((preview, index) => (
              <div key={index} className="relative group">
                {preview.type === 'video' ? (
                  <video
                    src={preview.url}
                    className="w-full h-40 object-cover rounded-lg"
                    controls
                  />
                ) : (
                  <img
                    src={preview.url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white p-1 rounded-full hover:bg-opacity-90 transition-all"
                  disabled={isCreating}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="mb-4 text-sm text-indigo-600 dark:text-indigo-400 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 dark:border-indigo-400 mr-2"></div>
            Uploading media...
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              disabled={isCreating || mediaFiles.length >= 4}
              title={mediaFiles.length >= 4 ? "Maximum 4 media files" : "Add media"}
            >
              <Image className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium">Media</span>
            </button>
            
            <button
              type="button"
              className="flex items-center space-x-1 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              disabled={isCreating}
            >
              <Smile className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium">Emoji</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={isDisabled}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              isDisabled
                ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                : "bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-md hover:shadow-lg"
            }`}
          >
            {isCreating ? "Posting..." : "Post"}
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleMediaSelect}
          className="hidden"
        />
      </form>
    </div>
  );
};

export default CreatePost;

