"use client";

import { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearLoginError, loginUser } from "@/store/slices/authSlice";

const ImageCarousel = dynamic(
  () => import("../signup/components/ImageCarousel"),
  {
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    ),
    ssr: false,
  }
);

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const { loginStatus, loginError } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const router = useRouter();

  const isFormValid =
    email.trim() !== "" &&
    password.trim() !== "" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isLoading = loginStatus === "loading";
  const error = localError || loginError;

  const handleLogin = async () => {
    if (!isFormValid || isLoading) return;

    setLocalError("");
    if (loginError) {
      dispatch(clearLoginError());
    }

    try {
      const result = await dispatch(
        loginUser({
          email: email.trim(),
          password: password.trim(),
        })
      ).unwrap();

      if (result.tokens?.accessToken) {
        localStorage.setItem(
          "accessToken",
          String(result.tokens.accessToken ?? "")
        );
      }

      setIsSuccess(true);
      setSuccessMessage("Login successful!");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        if (result.redirectUrl) {
          router.push(result.redirectUrl);
          return;
        }

        const userRole =
          (result.user as { role?: string } | undefined)?.role || "";
        switch (userRole) {
          case "speaker":
            router.push("/speakerUser");
            break;
          case "organizer":
            router.push("/newuser");
            break;
          case "participant":
            router.push("/participant");
            break;
          default:
            router.push("/dashboard");
        }
      }, 1500);
    } catch (err) {
      const fallback =
        typeof err === "string"
          ? err
          : "Something went wrong. Please try again.";
      setLocalError(fallback);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isFormValid && !isLoading) {
      handleLogin();
    }
  };

  if (isSuccess) {
    return (
      <div className="h-screen flex overflow-hidden">
        <div className="hidden lg:flex lg:w-1/2 relative">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            }
          >
            <ImageCarousel />
          </Suspense>
        </div>

        <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center items-center px-12">
          <div className="w-full max-w-lg text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            </motion.div>
            <h1 className="text-3xl font-bold text-blue-900 mb-2">
              Welcome Back!
            </h1>
            <p className="text-gray-500 text-sm mb-6">{successMessage}</p>
            <p className="text-gray-400 text-xs">
              Redirecting to your dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full bg-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          }
        >
          <ImageCarousel />
        </Suspense>
      </div>

      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center items-center px-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">
              Welcome Back!
            </h1>
            <p className="text-gray-500 text-sm">Login to your account</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </motion.div>
          )}

          <div className="space-y-4" onKeyPress={handleKeyPress}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) {
                    setLocalError("");
                    if (loginError) {
                      dispatch(clearLoginError());
                    }
                  }
                }}
                placeholder="Enter Email"
                className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400 text-sm ${
                  email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
                required
              />
              {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                <p className="text-xs text-red-600 mt-1">
                  Please enter a valid email address
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) {
                      setLocalError("");
                      if (loginError) {
                        dispatch(clearLoginError());
                      }
                    }
                  }}
                  placeholder="Enter Password"
                  className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-left">
              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="text-xs text-gray-600 hover:text-gray-800 underline transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <button
              onClick={handleLogin}
              disabled={!isFormValid || isLoading}
              className={`w-full py-3 px-4 rounded-md font-medium text-white transition-all duration-200 text-sm ${
                isFormValid && !isLoading
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </div>
              ) : (
                "Log in"
              )}
            </button>

            <div className="text-center mt-6">
              <p className="text-xs text-gray-600">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/signup")}
                  className="text-blue-600 hover:text-blue-800 font-medium underline transition-colors"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
