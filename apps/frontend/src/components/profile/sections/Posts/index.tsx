"use client";
import { useMemo } from "react";
import GeneratePost from "./GeneratePost";
import PostHeader from "./PostHeader";
import RecentPosts from "./RecentPosts";
import {
  useGetMyPostsQuery,
  useDeletePostMutation,
} from "@/store/slices/postsSlice";

interface Post {
  _id?: string;
  caption?: string;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
  likesCount?: number;
  commentsCount?: number;
  media?: any[];
  date?: string;
  likes?: number;
  comments?: number;
}

const Posts = () => {
  // Use RTK Query to fetch posts
  const {
    data: postsData = [],
    isLoading,
    error,
    refetch,
  } = useGetMyPostsQuery();

  const [deletePost] = useDeletePostMutation();

  // Format posts for UI display
  const recentPosts = useMemo(() => {
    if (!Array.isArray(postsData)) return [];

    // Sort posts by creation date (newest first)
    const sortedPosts = [...postsData].sort(
      (a: Post, b: Post) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );

    // Format the posts for UI display
    return sortedPosts.map((post) => {
      // Process media items if they exist
      const processedMedia =
        post.media?.map((item: any) => {
          let processedUrl = item.url;

          // Handle different URL formats
          if (processedUrl) {
            // If it's already a full URL (http/https), use as is
            if (processedUrl.startsWith("http")) {
              processedUrl = processedUrl;
            }
            // If it's a Cloudinary URL, use as is
            else if (processedUrl.includes("cloudinary.com")) {
              processedUrl = processedUrl;
            }
            // If it's a relative path, make it absolute
            else if (processedUrl.startsWith("/")) {
              processedUrl = `${
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
              }${processedUrl}`;
            }
            // If it's a data URL (base64), use as is
            else if (processedUrl.startsWith("data:")) {
              processedUrl = processedUrl;
            }
            // Default case - assume it needs the base URL
            else {
              processedUrl = `${
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
              }/${processedUrl}`;
            }
          }

          return {
            ...item,
            url: processedUrl,
          };
        }) || [];

      return {
        ...post,
        date: new Date(post.createdAt || Date.now()).toLocaleString(),
        likes: post.likesCount || 0,
        comments: post.commentsCount || 0,
        // Use caption as the primary content field (matches backend schema)
        content: post.caption,
        // Replace media with processed media
        media: processedMedia,
      };
    });
  }, [postsData]);

  const handleNewPost = () => {
    // Refetch posts after creating a new one
    refetch();
  };

  const handlePostDelete = async (postId: string) => {
    if (!postId) return;

    try {
      await deletePost(postId).unwrap();
      // RTK Query will automatically refetch due to invalidatesTags
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handlePostEdit = (postId: string, updatedPost: any) => {
    // Refetch posts after editing to get updated data
    refetch();
  };

  return (
    <section className="w-full bg-[#ffffff] pb-4 shadow-md rounded-lg rounded-tl-none rounded-bl-none">
      <PostHeader recentPosts={recentPosts} />
      <GeneratePost onPost={handleNewPost} />
      <RecentPosts
        recentPosts={recentPosts}
        onPostDelete={handlePostDelete}
        onPostEdit={handlePostEdit}
      />
    </section>
  );
};

export default Posts;
