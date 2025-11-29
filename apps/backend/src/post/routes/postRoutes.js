import { Router } from "express";
import { authenticateJWT } from "../../middleware/jwtAuth.js";
import { v2 as cloudinary } from 'cloudinary';
import multer from "multer";
import EnhancedPost from "../models/enhancedPost.js";
import EnhancedUser from "../../auth/models/enhancedUser.js";
import { Readable } from 'stream';

const router = Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and documents
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Supported types: JPEG, PNG, GIF, WebP, PDF, DOC, DOCX, TXT'), false);
    }
  }
});

/**
 * Create a new post with text only
 * @route POST /api/post/create
 */
router.post("/create", authenticateJWT, async (req, res) => {
  try {
    const { content, visibility = 'public', category = 'general' } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Post content is required'
      });
    }
    
    // Get user information
    const user = await EnhancedUser.findById(req.user._id)
      .select('firstName lastName professionalTitle profileImage profileImageUrl');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Create new post
    const post = new EnhancedPost({
      user: req.user._id,
      userName: `${user.firstName} ${user.lastName}`,
      userProfileImage: user.profileImage,
      userProfileImageUrl: user.profileImageUrl,
      userProfessionalTitle: user.professionalTitle || '',
      caption: content, // Map content to caption as required by the model
      visibility,
      category
    });
    
    await post.save();
    
    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create post'
    });
  }
});

/**
 * Create a new post with media files (Cloudinary integration)
 * @route POST /api/post/create-with-media
 */
router.post("/create-with-media", authenticateJWT, upload.array('media', 5), async (req, res) => {
  try {
    console.log('📥 Received post creation request:', {
      body: req.body,
      filesCount: req.files ? req.files.length : 0,
      files: req.files ? req.files.map(f => ({ name: f.originalname, size: f.size, mimetype: f.mimetype })) : []
    });
    
    // Multer parses form fields into req.body
    const caption = req.body.caption || '';
    const content = req.body.content || '';
    const visibility = req.body.visibility || 'public';
    const category = req.body.category || 'general';
    
    // Use caption if provided, otherwise fall back to content
    const postContent = (caption || content || '').trim();
    
    // Validate: must have either text content OR files
    if (!postContent && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Post must contain either text content or media files'
      });
    }
    
    // Get user information
    const user = await EnhancedUser.findById(req.user._id)
      .select('firstName lastName professionalTitle profileImage profileImageUrl');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Process media files with Cloudinary
    const mediaItems = [];
    
    if (req.files && req.files.length > 0) {
      // Check if Cloudinary is configured
      const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                      process.env.CLOUDINARY_API_KEY && 
                                      process.env.CLOUDINARY_API_SECRET;
      
      if (!isCloudinaryConfigured) {
        console.warn('⚠️ Cloudinary not configured. Files will be stored as base64.');
      }
      
      // Upload each file to Cloudinary (or store as base64 if not configured)
      for (const file of req.files) {
        try {
          let mediaUrl = '';
          let cloudinaryId = '';
          
          // Determine media type
          const isImage = file.mimetype.startsWith('image');
          const mediaType = isImage ? 'image' : 'document';
          
          if (isCloudinaryConfigured) {
            // Upload to Cloudinary
            const stream = Readable.from(file.buffer);
            
            const uploadResult = await new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                {
                  folder: 'posts',
                  resource_type: mediaType === 'image' ? 'image' : 'auto',
                  public_id: `post_${Date.now()}_${mediaItems.length}`,
                  transformation: mediaType === 'image' ? [
                    { quality: 'auto' },
                    { fetch_format: 'auto' }
                  ] : []
                },
                (error, result) => {
                  if (error) {
                    console.error('Cloudinary upload error:', error);
                    reject(error);
                  } else {
                    resolve(result);
                  }
                }
              );
              
              stream.pipe(uploadStream);
            });
            
            mediaUrl = uploadResult.secure_url;
            cloudinaryId = uploadResult.public_id;
            
            console.log(`✅ File uploaded to Cloudinary: ${file.originalname}`, {
              url: mediaUrl,
              public_id: cloudinaryId,
              type: mediaType
            });
          } else {
            // Fallback: Store as base64 data URL
            const base64Data = file.buffer.toString('base64');
            mediaUrl = `data:${file.mimetype};base64,${base64Data}`;
            console.log(`⚠️ Cloudinary not configured. Storing file as base64: ${file.originalname}`);
          }
          
          // Add to media items
          mediaItems.push({
            type: mediaType,
            url: mediaUrl,
            filename: file.originalname,
            size: file.size,
            cloudinaryId: cloudinaryId || undefined
          });
        } catch (uploadError) {
          console.error('Error uploading file:', uploadError);
          // Continue with other files if one fails
        }
      }
    }
    
    // Create new post
    const post = new EnhancedPost({
      user: req.user._id,
      userName: `${user.firstName} ${user.lastName}`,
      userProfileImage: user.profileImage,
      userProfileImageUrl: user.profileImageUrl,
      userProfessionalTitle: user.professionalTitle || '',
      caption: postContent || '',
      visibility,
      category,
      media: mediaItems
    });
    
    await post.save();
    
    console.log('✅ Post created successfully:', {
      postId: post._id,
      hasContent: !!postContent.trim(),
      mediaCount: mediaItems.length
    });
    
    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('❌ Error creating post with media:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create post',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * Get all posts by current user (must come before /:postId to avoid route conflicts)
 * @route GET /api/post/my-posts
 */
router.get("/my-posts", authenticateJWT, async (req, res) => {
  try {
    const posts = await EnhancedPost.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    return res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch posts'
    });
  }
});

/**
 * Get post by ID (must come after specific routes like /my-posts)
 * @route GET /api/post/:postId
 */
router.get("/:postId", authenticateJWT, async (req, res) => {
  try {
    const post = await EnhancedPost.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch post'
    });
  }
});

/**
 * Update post by ID
 * @route PUT /api/post/:postId
 */
router.put("/:postId", authenticateJWT, async (req, res) => {
  try {
    const { postId } = req.params;
    const { caption, content } = req.body;
    
    // Find the post
    const post = await EnhancedPost.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check if the user owns the post
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this post'
      });
    }
    
    // Update the post caption
    const updatedCaption = caption || content || post.caption;
    
    if (!updatedCaption || updatedCaption.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Post content cannot be empty'
      });
    }
    
    post.caption = updatedCaption.trim();
    post.isEdited = true;
    post.editedAt = new Date();
    
    await post.save();
    
    return res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update post'
    });
  }
});

/**
 * Delete post by ID
 * @route DELETE /api/post/:postId
 */
router.delete("/:postId", authenticateJWT, async (req, res) => {
  try {
    const { postId } = req.params;
    
    // Find the post
    const post = await EnhancedPost.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check if the user owns the post
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this post'
      });
    }
    
    // Delete the post
    await EnhancedPost.findByIdAndDelete(postId);
    
    return res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete post'
    });
  }
});

export default router;

