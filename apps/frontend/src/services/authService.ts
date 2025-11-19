/**
 * Authentication Service
 * Handles user authentication API calls
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  role?: "participant" | "speaker" | "organizer";
  industry?: string;
  activities?: string[];
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: any;
  redirectUrl?: string;
  tokens?: {
    accessToken: string;
  };
}

export interface ApiMessageResponse {
  success: boolean;
  message: string;
}

/**
 * Register a new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Registration failed');
    }

    // Store access token in localStorage if provided
    if (result.tokens?.accessToken) {
      localStorage.setItem('accessToken', result.tokens.accessToken);
    }

    return result;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Login user
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Login failed');
    }

    // Store access token in localStorage if provided
    if (result.tokens?.accessToken) {
      localStorage.setItem('accessToken', result.tokens.accessToken);
    }

    return result;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    // Clear localStorage
    localStorage.removeItem('accessToken');
  } catch (error) {
    console.error('Logout error:', error);
    // Clear localStorage even if API call fails
    localStorage.removeItem('accessToken');
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<any> => {
  try {
    const token = localStorage.getItem("accessToken");
    
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to get user');
    }

    return result.user;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("accessToken");
};

/**
 * Send OTP to user's email for verification
 */
export const sendOtp = async (email: string): Promise<ApiMessageResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to send verification code");
    }

    return result;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Network error occurred. Please try again.";
    throw new Error(message);
  }
};

/**
 * Verify OTP sent to user's email
 */
export const verifyOtp = async (payload: {
  email: string;
  otp: string;
}): Promise<ApiMessageResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Invalid verification code");
    }

    return result;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Verification failed";
    throw new Error(message);
  }
};

/**
 * Resend OTP to user's email
 */
export const resendOtp = async (email: string): Promise<ApiMessageResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to resend verification code");
    }

    return result;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Resend failed. Try again.";
    throw new Error(message);
  }
};

