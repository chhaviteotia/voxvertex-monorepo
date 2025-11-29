import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getProfile,
  addExperience,
  updateExperience,
  deleteExperience,
  addEducation,
  updateEducation,
  deleteEducation,
  addAward,
  updateAward,
  deleteAward,
  addVideo,
  updateVideo,
  deleteVideo,
  updateSkills,
  updateBio,
  type ExperienceData,
  type EducationData,
  type AwardData,
  type VideoData,
  type SkillData,
  type ProfileResponse,
} from "@/services/profileService";

/**
 * Profile State Interface
 */
interface ProfileState {
  data: any | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  lastFetched: number | null;
}

const initialState: ProfileState = {
  data: null,
  status: "idle",
  error: null,
  lastFetched: null,
};

/**
 * Async Thunks for Profile Operations
 */

// Fetch profile
export const fetchProfile = createAsyncThunk<
  ProfileResponse,
  void,
  { rejectValue: string }
>("profile/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await getProfile();
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch profile. Please try again.";
    return rejectWithValue(message);
  }
});

// Add work experience
export const addWorkExperience = createAsyncThunk<
  ProfileResponse,
  ExperienceData,
  { rejectValue: string }
>("profile/addWorkExperience", async (data, { rejectWithValue }) => {
  try {
    const response = await addExperience(data);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to add work experience. Please try again.";
    return rejectWithValue(message);
  }
});

// Update work experience
export const updateWorkExperience = createAsyncThunk<
  ProfileResponse,
  { experienceId: string; data: Partial<ExperienceData> },
  { rejectValue: string }
>(
  "profile/updateWorkExperience",
  async ({ experienceId, data }, { rejectWithValue }) => {
    try {
      const response = await updateExperience(experienceId, data);
      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update work experience. Please try again.";
      return rejectWithValue(message);
    }
  }
);

// Delete work experience
export const removeWorkExperience = createAsyncThunk<
  ProfileResponse,
  string,
  { rejectValue: string }
>("profile/removeWorkExperience", async (experienceId, { rejectWithValue }) => {
  try {
    const response = await deleteExperience(experienceId);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete work experience. Please try again.";
    return rejectWithValue(message);
  }
});

// Add education
export const addEducationEntry = createAsyncThunk<
  ProfileResponse,
  EducationData,
  { rejectValue: string }
>("profile/addEducation", async (data, { rejectWithValue }) => {
  try {
    const response = await addEducation(data);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to add education. Please try again.";
    return rejectWithValue(message);
  }
});

// Update education
export const updateEducationEntry = createAsyncThunk<
  ProfileResponse,
  { educationId: string; data: Partial<EducationData> },
  { rejectValue: string }
>(
  "profile/updateEducation",
  async ({ educationId, data }, { rejectWithValue }) => {
    try {
      const response = await updateEducation(educationId, data);
      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update education. Please try again.";
      return rejectWithValue(message);
    }
  }
);

// Delete education
export const removeEducationEntry = createAsyncThunk<
  ProfileResponse,
  string,
  { rejectValue: string }
>("profile/removeEducation", async (educationId, { rejectWithValue }) => {
  try {
    const response = await deleteEducation(educationId);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete education. Please try again.";
    return rejectWithValue(message);
  }
});

// Add award
export const addAwardEntry = createAsyncThunk<
  ProfileResponse,
  AwardData,
  { rejectValue: string }
>("profile/addAward", async (data, { rejectWithValue }) => {
  try {
    const response = await addAward(data);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to add award. Please try again.";
    return rejectWithValue(message);
  }
});

// Update award
export const updateAwardEntry = createAsyncThunk<
  ProfileResponse,
  { awardId: string; data: Partial<AwardData> },
  { rejectValue: string }
>("profile/updateAward", async ({ awardId, data }, { rejectWithValue }) => {
  try {
    const response = await updateAward(awardId, data);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update award. Please try again.";
    return rejectWithValue(message);
  }
});

// Delete award
export const removeAwardEntry = createAsyncThunk<
  ProfileResponse,
  string,
  { rejectValue: string }
>("profile/removeAward", async (awardId, { rejectWithValue }) => {
  try {
    const response = await deleteAward(awardId);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete award. Please try again.";
    return rejectWithValue(message);
  }
});

// Add video
export const addVideoEntry = createAsyncThunk<
  ProfileResponse,
  VideoData,
  { rejectValue: string }
>("profile/addVideo", async (data, { rejectWithValue }) => {
  try {
    const response = await addVideo(data);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to add video. Please try again.";
    return rejectWithValue(message);
  }
});

// Update video
export const updateVideoEntry = createAsyncThunk<
  ProfileResponse,
  { videoId: string; data: Partial<VideoData> },
  { rejectValue: string }
>("profile/updateVideo", async ({ videoId, data }, { rejectWithValue }) => {
  try {
    const response = await updateVideo(videoId, data);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update video. Please try again.";
    return rejectWithValue(message);
  }
});

// Delete video
export const removeVideoEntry = createAsyncThunk<
  ProfileResponse,
  string,
  { rejectValue: string }
>("profile/removeVideo", async (videoId, { rejectWithValue }) => {
  try {
    const response = await deleteVideo(videoId);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete video. Please try again.";
    return rejectWithValue(message);
  }
});

// Update skills
export const updateProfileSkills = createAsyncThunk<
  ProfileResponse,
  SkillData[],
  { rejectValue: string }
>("profile/updateSkills", async (skills, { rejectWithValue }) => {
  try {
    const response = await updateSkills(skills);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update skills. Please try again.";
    return rejectWithValue(message);
  }
});

// Update bio
export const updateProfileBio = createAsyncThunk<
  ProfileResponse,
  string,
  { rejectValue: string }
>("profile/updateBio", async (bio, { rejectWithValue }) => {
  try {
    const response = await updateBio(bio);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update bio. Please try again.";
    return rejectWithValue(message);
  }
});

/**
 * Profile Slice
 */
const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileError(state) {
      state.error = null;
    },
    resetProfile(state) {
      state.data = null;
      state.status = "idle";
      state.error = null;
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch profile";
      })
      // Add work experience
      .addCase(addWorkExperience.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addWorkExperience.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(addWorkExperience.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to add work experience";
      })
      // Update work experience
      .addCase(updateWorkExperience.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateWorkExperience.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(updateWorkExperience.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to update work experience";
      })
      // Remove work experience
      .addCase(removeWorkExperience.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(removeWorkExperience.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(removeWorkExperience.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to remove work experience";
      })
      // Add education
      .addCase(addEducationEntry.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addEducationEntry.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(addEducationEntry.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to add education";
      })
      // Update education
      .addCase(updateEducationEntry.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateEducationEntry.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(updateEducationEntry.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to update education";
      })
      // Remove education
      .addCase(removeEducationEntry.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(removeEducationEntry.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(removeEducationEntry.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to remove education";
      })
      // Add award
      .addCase(addAwardEntry.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addAwardEntry.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(addAwardEntry.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to add award";
      })
      // Update award
      .addCase(updateAwardEntry.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateAwardEntry.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(updateAwardEntry.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to update award";
      })
      // Remove award
      .addCase(removeAwardEntry.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(removeAwardEntry.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(removeAwardEntry.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to remove award";
      })
      // Add video
      .addCase(addVideoEntry.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addVideoEntry.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(addVideoEntry.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to add video";
      })
      // Update video
      .addCase(updateVideoEntry.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateVideoEntry.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(updateVideoEntry.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to update video";
      })
      // Remove video
      .addCase(removeVideoEntry.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(removeVideoEntry.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(removeVideoEntry.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to remove video";
      })
      // Update skills
      .addCase(updateProfileSkills.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateProfileSkills.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(updateProfileSkills.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to update skills";
      })
      // Update bio
      .addCase(updateProfileBio.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateProfileBio.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(updateProfileBio.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to update bio";
      });
  },
});

export const { clearProfileError, resetProfile } = profileSlice.actions;

// Selectors
export const selectProfile = (state: { profile: ProfileState }) => state.profile;
export const selectProfileData = (state: { profile: ProfileState }) =>
  state.profile.data;
export const selectProfileStatus = (state: { profile: ProfileState }) =>
  state.profile.status;
export const selectProfileError = (state: { profile: ProfileState }) =>
  state.profile.error;

export default profileSlice.reducer;

