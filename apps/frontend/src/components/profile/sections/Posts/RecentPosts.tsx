"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  FiFileText,
  FiDownload,
  FiMoreVertical,
  FiTrash2,
  FiEdit,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useDeletePostMutation } from "@/store/slices/postsSlice";

// Post content component with read more functionality
const PostContent = ({
  content,
  maxLength = 500,
}: {
  content: string;
  maxLength?: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!content) return null;

  const shouldTruncate = content.length > maxLength;
  const displayContent =
    shouldTruncate && !isExpanded
      ? content.substring(0, maxLength) + "..."
      : content;

  return (
    <div className="text-[rgba(0,0,0,0.6)] text-sm leading-relaxed break-words overflow-wrap-anywhere whitespace-pre-wrap max-w-full">
      <p>{displayContent}</p>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[#FF6B35] hover:text-orange-600 font-medium text-sm mt-2 transition-colors"
        >
          {isExpanded ? "Read Less" : "Read More"}
        </button>
      )}
    </div>
  );
};

const MediaGallery = ({ media }: { media: any[] }) => {
  if (!media || media.length === 0) return null;

  return (
    <div className="mt-3 mb-4">
      <div className="flex flex-wrap gap-2">
        {media.map((item, idx) => {
          let mediaUrl = null;
          let mediaType = null;
          let mediaFilename = null;

          if (item.cloudinaryUrl) {
            mediaUrl = item.cloudinaryUrl;
            mediaType = item.type;
            mediaFilename = item.filename;
          } else if (item.url) {
            mediaUrl = item.url;
            mediaType = item.type;
            mediaFilename = item.filename;
          } else if (typeof item === "string") {
            mediaUrl = item;
            if (
              item.includes("image") ||
              /\.(jpg|jpeg|png|gif|webp)$/i.test(item)
            ) {
              mediaType = "image";
            } else {
              mediaType = "document";
            }
            mediaFilename = "File";
          }

          if (mediaType === "image") {
            return (
              <div
                key={idx}
                onClick={() => window.open(mediaUrl, "_blank")}
                style={{ cursor: "pointer", display: "inline-block" }}
              >
                <img
                  src={mediaUrl}
                  alt={mediaFilename || "Post image"}
                  width="96"
                  height="96"
                  style={{
                    objectFit: "cover",
                    borderRadius: "8px",
                    display: "block",
                  }}
                  onError={() => {
                    console.error("❌ Image failed to load:", mediaUrl);
                  }}
                />
              </div>
            );
          } else {
            return (
              <a
                key={idx}
                href={mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-24 h-24 bg-gray-100 flex flex-col items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-200 transition-colors"
              >
                <FiFileText className="text-gray-500 text-xl mb-1" />
                <p className="text-xs text-gray-500 truncate px-2 w-full text-center">
                  {mediaFilename || "Document"}
                </p>
                <FiDownload className="text-gray-400 text-xs mt-1" />
              </a>
            );
          }
        })}
      </div>
    </div>
  );
};

// Post menu component - Fixed to prevent blinking
const PostMenu = ({
  postId,
  post,
  onDelete,
  onEdit,
}: {
  postId: string;
  post: any;
  onDelete: (id: string) => void;
  onEdit: (id: string, updated: any) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editContent, setEditContent] = useState(
    post?.caption || post?.content || ""
  );
  const menuRef = useRef<HTMLDivElement>(null);

  // Use Redux mutation for delete
  const [deletePost] = useDeletePostMutation();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // Use setTimeout to avoid immediate closure
      setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
      }, 0);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isEditing) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isEditing]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    // Use setTimeout to ensure menu closes before modal opens
    setTimeout(() => {
      setIsEditing(true);
    }, 100);
  };

  const handleEdit = async () => {
    if (isUpdating || !editContent.trim()) return;

    try {
      setIsUpdating(true);

      let finalContent = editContent.trim();
      const wasTruncated = editContent.length > 2000;
      if (editContent.length > 2000) {
        finalContent = editContent.substring(0, 2000).trim();
      }

      // Use the correct backend endpoint for updating posts
      const apiUrl = `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
      }/post/${postId}`;
      const response = await fetch(apiUrl, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caption: finalContent,
          content: finalContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update post");
      }

      const result = await response.json();

      setIsEditing(false);
      setIsUpdating(false);

      // Call onEdit callback with updated post
      if (result.success && result.post) {
        onEdit(postId, result.post);
        if (wasTruncated) {
          toast.success(
            "Post updated successfully! (Content was shortened to fit the limit)",
            { duration: 4000 }
          );
        } else {
          toast.success("Post updated successfully");
        }
      } else {
        throw new Error("Failed to update post");
      }
    } catch (error: any) {
      console.error("Error updating post:", error);
      toast.error(error.message || "Failed to update post");
      setIsUpdating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDeleting || !postId) return;

    try {
      setIsDeleting(true);
      setIsOpen(false);

      const result = await deletePost(postId).unwrap();

      if (result.success) {
        onDelete(postId);
        toast.success("Post deleted successfully");
      } else {
        throw new Error("Failed to delete post");
      }
    } catch (error: any) {
      console.error("Error deleting post:", error);
      const errorMessage =
        error?.data?.message || error?.message || "Failed to delete post";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsUpdating(false);
    setEditContent(post?.caption || post?.content || "");
  };

  return (
    <>
      <div className="relative z-20" ref={menuRef}>
        <motion.button
          onClick={toggleMenu}
          whileHover={{ scale: 1.2, rotate: 10, color: "#FF6B35" }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className="text-[rgba(107,114,128,0.65)] p-1 rounded-full hover:bg-gray-100"
          type="button"
        >
          <FiMoreVertical size={18} />
        </motion.button>

        {isOpen && (
          <div
            className="absolute right-0 mt-1 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1" role="menu" aria-orientation="vertical">
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-orange-600 hover:bg-orange-50"
                role="menuitem"
                onClick={handleEditClick}
                type="button"
              >
                <FiEdit className="mr-2" /> Edit
              </button>
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 disabled:opacity-50"
                role="menuitem"
                onClick={handleDelete}
                disabled={isDeleting}
                type="button"
              >
                <FiTrash2 className="mr-2" />
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Edit Post
            </h3>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 break-words overflow-wrap-anywhere"
              placeholder="What's on your mind?"
              maxLength={2000}
            />

            {/* Character counter for edit modal */}
            <div className="flex justify-end mt-2">
              <span
                className={`text-xs font-medium ${
                  editContent.length > 2000
                    ? "text-red-500"
                    : editContent.length > 1800
                    ? "text-orange-500"
                    : "text-gray-400"
                }`}
              >
                {editContent.length}/2000
              </span>
            </div>

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={isUpdating || !editContent.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                type="button"
              >
                {isUpdating ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

interface RecentPostsProps {
  recentPosts: any[];
  onPostDelete: (postId: string) => void;
  onPostEdit: (postId: string, updatedPost: any) => void;
}

const RecentPosts = ({
  recentPosts,
  onPostDelete,
  onPostEdit,
}: RecentPostsProps) => {
  // Limit to showing only the 3 most recent posts
  const displayPosts = recentPosts.slice(0, 3);

  const handlePostDelete = (postId: string) => {
    if (onPostDelete) {
      onPostDelete(postId);
    }
  };

  const handlePostEdit = (postId: string, updatedPost: any) => {
    if (onPostEdit) {
      onPostEdit(postId, updatedPost);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-black font-medium text-lg">Recent Posts</h3>

        <motion.button
          whileHover={{ scale: 1.05, color: "#FF6B35" }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-[#FF6B35] text-sm font-medium flex items-center cursor-pointer"
        >
          View All ({recentPosts.length})
        </motion.button>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {displayPosts.length > 0 ? (
          displayPosts.map((post, index) => (
            <div
              key={post._id || index}
              className="bg-[rgba(255,107,53,0.1)] border border-[rgba(255,107,53,0.24)] rounded-2xl p-5 transition-all w-full max-w-full relative"
            >
              {/* Post content with text overflow protection */}
              <div className="overflow-hidden">
                <PostContent content={post.caption || post.content || ""} />
              </div>

              {/* Media gallery */}
              <MediaGallery media={post.media || []} />

              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-[rgba(107,114,128,0.65)] font-medium">
                    {post.date}
                  </span>
                  <span className="text-xs text-[rgba(107,114,128,0.65)] font-medium">
                    {post.likes} likes
                  </span>
                  <span className="text-xs text-[rgba(107,114,128,0.65)] font-medium">
                    {post.comments} comments
                  </span>
                </div>

                <PostMenu
                  postId={post._id || ""}
                  post={post}
                  onDelete={handlePostDelete}
                  onEdit={handlePostEdit}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No posts yet. Be the first to share something!
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentPosts;
