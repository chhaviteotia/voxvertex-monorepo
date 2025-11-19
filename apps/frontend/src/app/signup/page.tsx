"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { SignupProvider } from "./context/SignupContext";

// Dynamic imports with loading states
const ImageCarousel = dynamic(() => import("./components/ImageCarousel"), {
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>
  ),
  ssr: false,
});

const SignupForm = dynamic(() => import("./components/SignupForm"), {
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>
  ),
  ssr: false,
});

export default function SignupPage() {
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

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 bg-white">
        <div className="w-full max-w-md">
          <SignupProvider>
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-96">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              }
            >
              <SignupForm />
            </Suspense>
          </SignupProvider>

          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              Already have an account?{" "}
              <button
                onClick={() => {
                  window.location.href = "/login";
                }}
                className="text-orange-500 hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
