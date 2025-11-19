"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, RefreshCw } from "lucide-react";
import ErrorMessage from "../common/ErrorMessage";
import {
  resendOtpRequest,
  resetOtpState,
  verifyOtpCode,
} from "@/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

interface StepOtpProps {
  email: string;
  onVerifySuccess: () => void;
}

export default function StepOtp({ email, onVerifySuccess }: StepOtpProps) {
  const dispatch = useAppDispatch();
  const { otpError, otpVerifyStatus, otpResendStatus, isOtpVerified } =
    useAppSelector((state) => state.auth);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [success, setSuccess] = useState(false);

  const isVerifying = otpVerifyStatus === "loading";
  const resendLoading = otpResendStatus === "loading";

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // auto focus next
    if (value && index < otp.length - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // If current field is empty, move to previous field
        const prevInput = document.getElementById(`otp-${index - 1}`);
        prevInput?.focus();
      } else if (otp[index]) {
        // If current field has value, clear it
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");

    // Remove any non-digit characters and limit to 6 digits
    const digits = pastedData.replace(/\D/g, "").slice(0, 6);

    if (digits.length > 0) {
      const newOtp = [...otp];

      // Fill the OTP fields with pasted digits
      for (let i = 0; i < digits.length && i < otp.length; i++) {
        newOtp[i] = digits[i];
      }

      setOtp(newOtp);

      // Focus on the next empty field or the last field
      const nextEmptyIndex = Math.min(digits.length, otp.length - 1);
      const nextInput = document.getElementById(`otp-${nextEmptyIndex}`);
      nextInput?.focus();
    }
  };

  const handleVerify = async () => {
    if (otp.join("").length !== 6 || isVerifying) return;
    try {
      await dispatch(verifyOtpCode({ email, otp: otp.join("") })).unwrap();
    } catch {
      // errors handled via Redux state
    }
  };

  const handleResend = async () => {
    if (resendLoading) return;
    try {
      await dispatch(resendOtpRequest(email)).unwrap();
      setOtp(["", "", "", "", "", ""]);
    } catch {
      // errors handled via Redux state
    }
  };

  useEffect(() => {
    if (isOtpVerified) {
      setSuccess(true);
      const timer = setTimeout(() => {
        onVerifySuccess();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOtpVerified, onVerifySuccess]);

  useEffect(() => {
    return () => {
      dispatch(resetOtpState());
    };
  }, [dispatch]);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-base font-semibold text-gray-800">
          Verify your email
        </h2>
        <p className="text-sm text-gray-600">
          We sent a 6-digit OTP to <span className="font-medium">{email}</span>
        </p>
      </div>

      {otpError && <ErrorMessage message={otpError} />}

      <div className="flex justify-center gap-2">
        {otp.map((digit, idx) => (
          <input
            key={idx}
            id={`otp-${idx}`}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target.value, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            onPaste={handlePaste}
            className="w-10 h-12 text-center text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        ))}
      </div>

      <div className="flex justify-between items-center mt-3">
        <button
          onClick={handleResend}
          disabled={resendLoading}
          className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-800"
        >
          <RefreshCw
            className={`w-4 h-4 ${resendLoading ? "animate-spin" : ""}`}
          />{" "}
          Resend OTP
        </button>
        <button
          onClick={handleVerify}
          disabled={isVerifying || otp.join("").length !== 6}
          className="px-5 py-2 bg-orange-500 text-white rounded-md text-sm disabled:opacity-50"
        >
          {isVerifying ? "Verifying..." : "Verify"}
        </button>
      </div>

      {success && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 text-green-600 text-sm"
        >
          <CheckCircle className="w-4 h-4" /> Verified successfully
        </motion.div>
      )}
    </div>
  );
}
