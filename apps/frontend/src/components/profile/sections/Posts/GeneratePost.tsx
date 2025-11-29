"use client";
import { useState, useRef } from "react";
import { FiImage, FiFileText, FiX } from "react-icons/fi";
import { LiaTelegramPlane } from "react-icons/lia";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useAuth } from "@/store/hooks";
import {
  useCreatePostMutation,
  useCreatePostWithMediaMutation,
} from "@/store/slices/postsSlice";

interface GeneratePostProps {
  onPost: (newPost: any) => void;
}

// Simplified ActionButton component
const ActionButton = ({
  icon: Icon,
  label,
  onClick,
}: {
  icon: any;
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center space-x-2 bg-white border border-gray-300 rounded-2xl px-7 py-2 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
  >
    <Icon className="h-5 w-5" />
    <span>{label}</span>
  </button>
);

// Simplified PrimaryButton component
const PrimaryButton = ({
  label,
  disabled,
}: {
  label: string;
  disabled: boolean;
}) => (
  <motion.button
    type="submit"
    disabled={disabled}
    whileHover={
      !disabled
        ? { scale: 1.05, boxShadow: "0px 4px 10px rgba(0,0,0,0.15)" }
        : {}
    }
    whileTap={!disabled ? { scale: 0.95 } : {}}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className={`flex items-center justify-between gap-2 bg-gradient-to-r from-[#FF6B35]/90 to-[#FF6B35] 
      border border-[#FF6B35] text-white px-6 py-2 rounded-2xl font-semibold text-sm shadow-sm
      ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    <LiaTelegramPlane className="text-xl stroke-[1]" />
    {label}
  </motion.button>
);

const GeneratePost = ({ onPost }: GeneratePostProps) => {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<(string | null)[]>([]);
  const [createPost, { isLoading: isCreatingPost }] = useCreatePostMutation();
  const [createPostWithMedia, { isLoading: isUploadingMedia }] =
    useCreatePostWithMediaMutation();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const auth = useAuth();

  const isUploading = isCreatingPost || isUploadingMedia;

  // Handle file selection
  const handleFileSelect = (
    files: FileList | null,
    type: "image" | "document"
  ) => {
    if (!files || files.length === 0) return;

    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const allowedDocTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    const newFiles: File[] = [];
    const currentFilesCount = selectedFiles.length;

    Array.from(files).forEach((file) => {
      // Validate file type
      const isValidImage =
        type === "image" && allowedImageTypes.includes(file.type);
      const isValidDoc =
        type === "document" && allowedDocTypes.includes(file.type);

      if (!isValidImage && !isValidDoc) {
        toast.error(
          `Invalid file type: ${file.name}. Please select a valid ${
            type === "image" ? "image" : "document"
          } file.`
        );
        return;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File too large: ${file.name}. Maximum size is 5MB.`);
        return;
      }

      // Check total files limit (5 files max)
      if (selectedFiles.length + newFiles.length >= 5) {
        toast.error("Maximum 5 files allowed per post.");
        return;
      }

      newFiles.push(file);
    });

    // Add new files and initialize preview slots
    setSelectedFiles((prev) => {
      const updated = [...prev, ...newFiles];

      // Initialize preview slots for all new files (null for non-images)
      const newPreviews: (string | null)[] = newFiles.map((file) =>
        allowedImageTypes.includes(file.type) ? null : null
      );
      setFilePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);

      // Generate previews for images asynchronously
      newFiles.forEach((file, relativeIndex) => {
        const isValidImage = allowedImageTypes.includes(file.type);
        if (isValidImage) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const previewUrl = e.target?.result as string;
            const absoluteIndex = currentFilesCount + relativeIndex;
            setFilePreviews((prevPreviews) => {
              const updatedPreviews = [...prevPreviews];
              updatedPreviews[absoluteIndex] = previewUrl;
              return updatedPreviews;
            });
          };
          reader.readAsDataURL(file);
        }
      });

      return updated;
    });

    // Clear file inputs after selection
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Remove selected file
  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle image button click
  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  // Handle file button click
  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: Must have either text or files
    if (!content.trim() && selectedFiles.length === 0) {
      setError("Post cannot be empty. Add some text or attach a file.");
      return;
    }
    setError("");

    try {
      let finalContent = content.trim();
      if (finalContent.length > 2000) {
        finalContent = finalContent.substring(0, 2000).trim();
      }

      // If files are selected, use createPostWithMedia
      if (selectedFiles.length > 0) {
        const formData = new FormData();

        // Add text content if provided
        if (finalContent) {
          formData.append("content", finalContent);
          formData.append("caption", finalContent);
        } else {
          // Even if no text, send empty strings to satisfy backend validation
          formData.append("content", "");
          formData.append("caption", "");
        }

        formData.append("visibility", "public");
        formData.append("category", "general");

        // Append all files with the same field name 'media'
        selectedFiles.forEach((file) => {
          formData.append("media", file);
        });

        console.log("📤 Uploading post with media:", {
          hasContent: !!finalContent,
          filesCount: selectedFiles.length,
          fileNames: selectedFiles.map((f) => f.name),
        });

        const result = await createPostWithMedia(formData).unwrap();

        if (result.success && result.data) {
          const formattedPost = {
            ...result.data,
            date: new Date(
              result.data.createdAt || Date.now()
            ).toLocaleString(),
            likes: result.data.likesCount || 0,
            comments: result.data.commentsCount || 0,
            content: result.data.caption,
            caption: result.data.caption,
            _id: result.data._id,
          };

          onPost(formattedPost);
          setContent("");
          setSelectedFiles([]);
          setFilePreviews([]);
          toast.success("Post created successfully!");
        } else {
          throw new Error("Failed to create post");
        }
      } else {
        // No files, use regular createPost (text-only)
        console.log("📤 Creating text-only post:", { content: finalContent });

        const result = await createPost({
          content: finalContent,
          visibility: "public",
          category: "general",
        }).unwrap();

        if (result.success && result.data) {
          const formattedPost = {
            ...result.data,
            date: new Date(
              result.data.createdAt || Date.now()
            ).toLocaleString(),
            likes: result.data.likesCount || 0,
            comments: result.data.commentsCount || 0,
            content: result.data.caption,
            caption: result.data.caption,
            _id: result.data._id,
          };

          onPost(formattedPost);
          setContent("");
          toast.success("Post created successfully!");
        } else {
          throw new Error("Failed to create post");
        }
      }
    } catch (err: any) {
      console.error("❌ Error creating post:", err);
      const errorMessage =
        err?.data?.message || err?.message || "Something went wrong";
      setError(errorMessage);
      toast.error(`Failed to create post: ${errorMessage}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 border-b border-gray-200 space-y-4"
    >
      {/* Input Area */}
      <div className="bg-[rgba(255,107,53,0.05)] border border-[#FF6B35] rounded-2xl p-5">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind? Share insights, achievements, or professional updates..."
          className="w-full bg-transparent outline-none resize-none text-[#FF6B35] placeholder-[#FF6B35]/70 text-base h-[120px] break-words overflow-wrap-anywhere"
          disabled={isUploading}
          maxLength={2000}
        />

        {/* Character counter */}
        <div className="flex justify-end mt-2">
          <span
            className={`text-xs font-medium ${
              content.length > 2000
                ? "text-red-500"
                : content.length > 1800
                ? "text-orange-500"
                : "text-gray-400"
            }`}
          >
            {content.length}/2000
          </span>
        </div>
      </div>

      {/* File Previews */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedFiles.map((file, index) => {
            const isImage = file.type.startsWith("image/");
            const preview = filePreviews[index] || null;

            if (isImage && preview) {
              return (
                <div
                  key={index}
                  className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-300"
                >
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              );
            } else {
              return (
                <div
                  key={index}
                  className="relative flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg border border-gray-300"
                >
                  <FiFileText className="w-5 h-5 text-gray-600" />
                  <span className="text-xs text-gray-700 truncate max-w-[100px]">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-600 transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              );
            }
          })}
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={imageInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple
        onChange={(e) => handleFileSelect(e.target.files, "image")}
      />
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        multiple
        onChange={(e) => handleFileSelect(e.target.files, "document")}
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Action Row */}
      <div className="flex justify-between items-center mt-5">
        <div className="flex gap-3">
          <ActionButton
            icon={FiImage}
            label="Photo"
            onClick={handleImageClick}
          />
          <ActionButton
            icon={FiFileText}
            label="File"
            onClick={handleFileClick}
          />
          {selectedFiles.length > 0 && (
            <span className="text-xs text-gray-500 self-center">
              {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""}{" "}
              selected
            </span>
          )}
        </div>

        <PrimaryButton
          label={isUploading ? "Uploading..." : "Post"}
          disabled={
            isUploading || (!content.trim() && selectedFiles.length === 0)
          }
        />
      </div>
    </form>
  );
};

export default GeneratePost;
