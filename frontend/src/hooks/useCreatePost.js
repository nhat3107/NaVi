import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost, uploadMedia } from "../lib/api";
import toast from "react-hot-toast";

const useCreatePost = () => {
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: async ({ content, mediaFiles }) => {
      if (!content && mediaFiles.length === 0) {
        throw new Error("Post must contain either text or media");
      }

      let media = [];

      // Upload media files if any
      if (mediaFiles.length > 0) {
        setIsUploading(true);
        const uploadPromises = mediaFiles.map((file) =>
          uploadMedia({ file })
        );
        const uploadResults = await Promise.all(uploadPromises);

        // Check if all uploads were successful
        const failedUploads = uploadResults.filter((result) => !result.success);
        if (failedUploads.length > 0) {
          throw new Error("Some media files failed to upload");
        }

        media = uploadResults.map((result) => ({
          url: result.url,
          type: result.resource_type === "video" ? "video" : "image",
        }));
        setIsUploading(false);
      }

      // Create post
      const response = await createPost({
        content: content || "",
        media,
      });

      return response.post;
    },
    onSuccess: (newPost) => {
      toast.success("Post created successfully!");
      
      // Invalidate and refetch posts queries to include the new post
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      console.error("Error creating post:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to create post");
      setIsUploading(false);
    },
  });

  const handleCreatePost = async (content, mediaFiles = []) => {
    try {
      const post = await createPostMutation.mutateAsync({ content, mediaFiles });
      return post;
    } catch (error) {
      return null;
    }
  };

  return {
    handleCreatePost,
    isCreating: createPostMutation.isPending,
    isUploading,
  };
};

export default useCreatePost;

