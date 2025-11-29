"use client";

import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { AppDispatch, RootState } from "./index";
import { logout as logoutAction, fetchCurrentUser } from "./slices/authSlice";
import { logout as logoutService } from "@/services/authService";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Auth hook - Provides authentication state and logout functionality
 * Improved with better error handling and TypeScript
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const auth = useAppSelector((state) => state.auth);

  const logout = useCallback(async () => {
    try {
      // Call logout service to clear server-side cookies
      await logoutService();
      
      // Clear Redux state
      dispatch(logoutAction());
      
      // Redirect to home
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, clear local state and redirect
      dispatch(logoutAction());
      router.push("/");
    }
  }, [dispatch, router]);

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    loginStatus: auth.loginStatus,
    signupStatus: auth.signupStatus,
    loginError: auth.loginError,
    signupError: auth.signupError,
    logout,
  };
};

/**
 * Get current user query hook - Fetches user from API if not in state
 */
export const useGetCurrentUserQuery = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const fetchUserStatus = useAppSelector((state) => state.auth.fetchUserStatus);
  const fetchUserError = useAppSelector((state) => state.auth.fetchUserError);
  const isLoading = fetchUserStatus === "loading";

  // Fetch user on mount if not in state (may be authenticated via cookies)
  useEffect(() => {
    // Only fetch if user is not in state and we haven't tried fetching yet
    if (!user && fetchUserStatus === "idle") {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user, fetchUserStatus]);

  return {
    data: user ? { user } : null,
    isLoading,
    isError: fetchUserStatus === "failed",
    error: fetchUserError,
    refetch: () => {
      dispatch(fetchCurrentUser());
    },
  };
};

