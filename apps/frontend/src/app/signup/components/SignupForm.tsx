"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import ProgressIndicator from "./ProgressIndicator";
import StepOne from "./steps/StepOne";
import StepOtp from "./steps/StepOtp";
import StepTwo from "./steps/StepTwo";
import StepThree from "./steps/StepThree";
import SuccessStep from "./steps/SuccessStep";
import { useSignup } from "../context/SignupContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  registerUser,
  resetOtpState,
  sendOtpRequest,
} from "@/store/slices/authSlice";

export default function SignupForm() {
  const dispatch = useAppDispatch();
  const { signupStatus, signupError } = useAppSelector((state) => state.auth);
  const {
    currentStep,
    setCurrentStep,
    formData,
    updateFormData,
    isLoading,
    setIsLoading,
    error,
    setError,
  } = useSignup();
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const isRegistering = signupStatus === "loading";

  useEffect(() => {
    if (signupError) {
      setError(signupError);
    }
  }, [signupError, setError]);

  const totalSteps = 4; // Including OTP verification step

  const handleNext = async () => {
    if (currentStep === 1) {
      // When moving from step 1 to OTP verification, send OTP
      setIsLoading(true);
      setError(null);

      try {
        dispatch(resetOtpState());
        await dispatch(sendOtpRequest(formData.email)).unwrap();
        setCurrentStep(currentStep + 1);
      } catch (err) {
        const message =
          typeof err === "string"
            ? err
            : "Failed to send verification code. Please try again.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    } else if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      if (currentStep === 2) {
        dispatch(resetOtpState());
      }
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await dispatch(
        registerUser({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: undefined, // No phone number required
          role: formData.whoAreYou,
          industry: formData.companyTitle,
          activities: formData.activity,
        })
      ).unwrap();

      if (response.success) {
        setIsSuccess(true);

        // Redirect to role-based dashboard after successful signup
        setTimeout(() => {
          router.push(response.redirectUrl ?? "/dashboard");
        }, 2000);
      }
    } catch (error) {
      console.error("Registration error:", error);
      const message =
        typeof error === "string" ? error : "Failed to create account";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.lastName && formData.email;
      case 2:
        return formData.isEmailVerified;
      case 3:
        return (
          formData.password &&
          formData.confirmPassword &&
          formData.password === formData.confirmPassword
        );
      case 4:
        return (
          formData.whoAreYou &&
          formData.companyTitle &&
          formData.activity.length > 0
        );
      default:
        return false;
    }
  };

  const handleVerifySuccess = () => {
    updateFormData({ isEmailVerified: true });
    // Automatically move to the next step after verification
    setCurrentStep(currentStep + 1);
  };

  if (isSuccess) {
    return <SuccessStep />;
  }

  return (
    <div className="w-full">
      <div className="text-center mb-3">
        <h1 className="text-lg font-bold mb-0.5">Create your account</h1>
        <p className="text-xs text-gray-500">
          Join our community and unlock exclusive features
        </p>
      </div>

      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />

      <div className="mb-4">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-2.5"
        >
          {currentStep === 1 && (
            <StepOne formData={formData} updateFormData={updateFormData} />
          )}

          {currentStep === 2 && (
            <StepOtp
              email={formData.email}
              onVerifySuccess={handleVerifySuccess}
            />
          )}

          {currentStep === 3 && (
            <StepTwo formData={formData} updateFormData={updateFormData} />
          )}

          {currentStep === 4 && (
            <StepThree formData={formData} updateFormData={updateFormData} />
          )}
        </motion.div>
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}

      <div
        className={`flex mt-4 ${
          currentStep === 1 ? "justify-end" : "justify-between"
        }`}
      >
        {currentStep > 1 && (
          <button
            onClick={handlePrev}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}

        {currentStep !== 2 && (
          <button
            onClick={handleNext}
            disabled={!isStepValid() || isLoading || isRegistering}
            className="flex items-center gap-2 px-5 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              "Processing..."
            ) : currentStep === totalSteps ? (
              <>
                <Check className="w-4 h-4" />
                Complete
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
