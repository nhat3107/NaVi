import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { getFeedPosts, getAllPosts, getUserPosts } from "../lib/api";
import toast from "react-hot-toast";

const usePosts = (type = "feed", userId = null) => {
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["posts", type, userId],
    enabled: type !== "user" || !!userId,
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      let response;

      if (type === "feed") {
        response = await getFeedPosts(pageParam, 10);
      } else if (type === "all") {
        response = await getAllPosts(pageParam, 10);
      } else if (type === "user" && userId) {
        response = await getUserPosts(userId, pageParam, 10);
      }

      return response;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage?.hasMore) return undefined;
      return allPages.length + 1;
    },
    onError: (error) => {
      console.error("Error fetching posts:", error);
      toast.error(error.response?.data?.message || "Failed to fetch posts");
    },
  });

  // Flatten the pages into a single posts array
  const posts = data?.pages?.flatMap((page) => page?.posts || []) || [];
  const total = data?.pages?.[0]?.total || 0;

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const refreshPosts = () => {
    refetch();
  };

  const updatePost = (postId, updatedData) => {
    queryClient.setQueryData(["posts", type, userId], (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          posts: page.posts.map((post) =>
            post._id === postId ? { ...post, ...updatedData } : post
          ),
        })),
      };
    });
  };

  const removePost = (postId) => {
    queryClient.setQueryData(["posts", type, userId], (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          posts: page.posts.filter((post) => post._id !== postId),
        })),
      };
    });
  };

  const addNewPost = (newPost) => {
    queryClient.setQueryData(["posts", type, userId], (old) => {
      if (!old) {
        return {
          pages: [{ posts: [newPost], hasMore: false, total: 1 }],
          pageParams: [1],
        };
      }
      const newPages = [...old.pages];
      newPages[0] = {
        ...newPages[0],
        posts: [newPost, ...newPages[0].posts],
      };
      return { ...old, pages: newPages };
    });
  };

  return {
    posts,
    isLoading,
    hasMore: hasNextPage,
    total,
    page: data?.pages?.length || 1,
    loadMore,
    refreshPosts,
    updatePost,
    removePost,
    addNewPost,
    isFetchingNextPage,
  };
};

export default usePosts;

