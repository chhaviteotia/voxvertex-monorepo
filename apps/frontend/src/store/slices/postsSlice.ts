// ============================================================================
// POSTS SLICE - Posts Management
// ============================================================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi';
import type { 
  PostsState, 
  Post, 
  CreatePostRequest,
  ApiResponse 
} from '../types';

// Initial state
const initialState: PostsState = {
  posts: [],
  currentPost: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  error: null,
};

// Posts slice
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      state.isError = false;
      state.error = null;
    },
    
    setPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts = action.payload;
      state.isLoading = false;
      state.isSuccess = true;
    },
    
    addPost: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload);
    },
    
    updatePost: (state, action: PayloadAction<{ id: string; updates: Partial<Post> }>) => {
      const index = state.posts.findIndex(post => post._id === action.payload.id);
      if (index !== -1) {
        state.posts[index] = { ...state.posts[index], ...action.payload.updates };
      }
      if (state.currentPost && state.currentPost._id === action.payload.id) {
        state.currentPost = { ...state.currentPost, ...action.payload.updates };
      }
    },
    
    removePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter(post => post._id !== action.payload);
      if (state.currentPost && state.currentPost._id === action.payload) {
        state.currentPost = null;
      }
    },
    
    setCurrentPost: (state, action: PayloadAction<Post | null>) => {
      state.currentPost = action.payload;
    },
    
    setError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isError = true;
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.isError = false;
      state.error = null;
    },
    
    resetPosts: () => initialState,
  },
});

// Posts API endpoints
export const postsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyPosts: builder.query<Post[], void>({
      query: () => ({
        url: '/post/my-posts',
      }),
      providesTags: ['Post'],
      transformResponse: (response: Post[] | ApiResponse<Post[]>) => {
        // Handle both array response and ApiResponse format
        if (Array.isArray(response)) {
          return response;
        }
        if (response.success && response.data) {
          return response.data;
        }
        return [];
      },
    }),
    
    getPostById: builder.query<ApiResponse<Post>, string>({
      query: (postId) => `/post/${postId}`,
      providesTags: (result, error, id) => [{ type: 'Post', id }],
      transformResponse: (response: any) => {
        if (response.success && response.post) {
          return { success: true, data: response.post };
        }
        return { success: false };
      },
    }),
    
    createPost: builder.mutation<ApiResponse<Post>, { content: string; visibility?: string; category?: string }>({
      query: (postData) => ({
        url: '/post/create',
        method: 'POST',
        body: postData,
      }),
      invalidatesTags: ['Post'],
      transformResponse: (response: any) => {
        if (response.success && response.post) {
          return { success: true, data: response.post };
        }
        return { success: false };
      },
    }),
    
    createPostWithMedia: builder.mutation<ApiResponse<Post>, FormData>({
      query: (formData) => ({
        url: '/post/create-with-media',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Post'],
      transformResponse: (response: any) => {
        if (response.success && response.post) {
          return { success: true, data: response.post };
        }
        return { success: false };
      },
    }),
    
    deletePost: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (postId) => ({
        url: `/post/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Post'],
      transformResponse: (response: any) => {
        if (response.success) {
          return { success: true, data: { message: response.message || 'Post deleted successfully' } };
        }
        return { success: false };
      },
    }),
  }),
});

// Export actions and hooks
export const {
  setLoading,
  setPosts,
  addPost,
  updatePost,
  removePost,
  setCurrentPost,
  setError,
  clearError,
  resetPosts,
} = postsSlice.actions;

export const {
  useGetMyPostsQuery,
  useGetPostByIdQuery,
  useCreatePostMutation,
  useCreatePostWithMediaMutation,
  useDeletePostMutation,
} = postsApi;

// Selectors
export const selectPosts = (state: { posts: PostsState }) => state.posts.posts;
export const selectCurrentPost = (state: { posts: PostsState }) => state.posts.currentPost;
export const selectPostsLoading = (state: { posts: PostsState }) => state.posts.isLoading;
export const selectPostsError = (state: { posts: PostsState }) => state.posts.error;

export default postsSlice.reducer;

