import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  login,
  register,
  sendOtp,
  verifyOtp,
  resendOtp,
  ApiMessageResponse,
} from "@/services/authService";

interface AuthResponse {
  success: boolean;
  user?: Record<string, unknown>;
  redirectUrl?: string;
  message?: string;
  tokens?: {
    accessToken?: string;
    refreshToken?: string;
    [key: string]: unknown;
  };
}

export const loginUser = createAsyncThunk<
  AuthResponse,
  { email: string; password: string },
  { rejectValue: string }
>("auth/loginUser", async (credentials, { rejectWithValue }) => {
  try {
    const response = await login(credentials);
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to login. Please try again.";
    return rejectWithValue(message);
  }
});

export const registerUser = createAsyncThunk<
  AuthResponse,
  {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
    industry?: string;
    activities?: string[];
  },
  { rejectValue: string }
>("auth/registerUser", async (payload, { rejectWithValue }) => {
  try {
    const response = await register(payload);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to register. Please try again.";
    return rejectWithValue(message);
  }
});

export const sendOtpRequest = createAsyncThunk<
  ApiMessageResponse,
  string,
  { rejectValue: string }
>("auth/sendOtpRequest", async (email, { rejectWithValue }) => {
  try {
    return await sendOtp(email);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to send verification code.";
    return rejectWithValue(message);
  }
});

export const verifyOtpCode = createAsyncThunk<
  ApiMessageResponse,
  { email: string; otp: string },
  { rejectValue: string }
>("auth/verifyOtpCode", async (payload, { rejectWithValue }) => {
  try {
    return await verifyOtp(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to verify OTP.";
    return rejectWithValue(message);
  }
});

export const resendOtpRequest = createAsyncThunk<
  ApiMessageResponse,
  string,
  { rejectValue: string }
>("auth/resendOtpRequest", async (email, { rejectWithValue }) => {
  try {
    return await resendOtp(email);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to resend verification code.";
    return rejectWithValue(message);
  }
});

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed";

interface AuthState {
  user: Record<string, unknown> | null;
  isAuthenticated: boolean;
  redirectUrl: string | null;
  loginStatus: AsyncStatus;
  signupStatus: AsyncStatus;
  loginError: string | null;
  signupError: string | null;
  otpSendStatus: AsyncStatus;
  otpVerifyStatus: AsyncStatus;
  otpResendStatus: AsyncStatus;
  otpError: string | null;
  otpSuccessMessage: string | null;
  isOtpVerified: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  redirectUrl: null,
  loginStatus: "idle",
  signupStatus: "idle",
  loginError: null,
  signupError: null,
  otpSendStatus: "idle",
  otpVerifyStatus: "idle",
  otpResendStatus: "idle",
  otpError: null,
  otpSuccessMessage: null,
  isOtpVerified: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearLoginError(state) {
      state.loginError = null;
    },
    clearSignupError(state) {
      state.signupError = null;
    },
    resetSignupStatus(state) {
      state.signupStatus = "idle";
      state.signupError = null;
    },
    clearOtpError(state) {
      state.otpError = null;
    },
    resetOtpState(state) {
      state.otpSendStatus = "idle";
      state.otpVerifyStatus = "idle";
      state.otpResendStatus = "idle";
      state.otpError = null;
      state.otpSuccessMessage = null;
      state.isOtpVerified = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loginStatus = "loading";
        state.loginError = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.loginStatus = "succeeded";
          state.isAuthenticated = action.payload.success;
          state.user = action.payload.user ?? null;
          state.redirectUrl = action.payload.redirectUrl ?? null;
          state.loginError = null;
        }
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.loginStatus = "failed";
        state.isAuthenticated = false;
        state.loginError =
          action.payload || action.error.message || "Login failed";
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.signupStatus = "loading";
        state.signupError = null;
      })
      .addCase(
        registerUser.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.signupStatus = "succeeded";
          state.signupError = null;
          state.redirectUrl = action.payload.redirectUrl ?? null;
          // Some APIs return user on signup, set if available
          if (action.payload.user) {
            state.user = action.payload.user;
          }
        }
      )
      .addCase(registerUser.rejected, (state, action) => {
        state.signupStatus = "failed";
        state.signupError =
          action.payload || action.error.message || "Registration failed";
      })
      // OTP send
      .addCase(sendOtpRequest.pending, (state) => {
        state.otpSendStatus = "loading";
        state.otpError = null;
        state.otpSuccessMessage = null;
        state.isOtpVerified = false;
      })
      .addCase(
        sendOtpRequest.fulfilled,
        (state, action: PayloadAction<ApiMessageResponse>) => {
          state.otpSendStatus = "succeeded";
          state.otpSuccessMessage = action.payload.message;
        }
      )
      .addCase(sendOtpRequest.rejected, (state, action) => {
        state.otpSendStatus = "failed";
        state.otpError =
          action.payload ||
          action.error.message ||
          "Failed to send verification code.";
      })
      // OTP verify
      .addCase(verifyOtpCode.pending, (state) => {
        state.otpVerifyStatus = "loading";
        state.otpError = null;
      })
      .addCase(
        verifyOtpCode.fulfilled,
        (state, action: PayloadAction<ApiMessageResponse>) => {
          state.otpVerifyStatus = "succeeded";
          state.isOtpVerified = true;
          state.otpSuccessMessage = action.payload.message;
        }
      )
      .addCase(verifyOtpCode.rejected, (state, action) => {
        state.otpVerifyStatus = "failed";
        state.isOtpVerified = false;
        state.otpError =
          action.payload ||
          action.error.message ||
          "Verification failed. Please try again.";
      })
      // OTP resend
      .addCase(resendOtpRequest.pending, (state) => {
        state.otpResendStatus = "loading";
        state.otpError = null;
      })
      .addCase(
        resendOtpRequest.fulfilled,
        (state, action: PayloadAction<ApiMessageResponse>) => {
          state.otpResendStatus = "succeeded";
          state.otpSuccessMessage = action.payload.message;
        }
      )
      .addCase(resendOtpRequest.rejected, (state, action) => {
        state.otpResendStatus = "failed";
        state.otpError =
          action.payload ||
          action.error.message ||
          "Failed to resend verification code.";
      });
  },
});

export const {
  clearLoginError,
  clearSignupError,
  resetSignupStatus,
  clearOtpError,
  resetOtpState,
} = authSlice.actions;

export default authSlice.reducer;

