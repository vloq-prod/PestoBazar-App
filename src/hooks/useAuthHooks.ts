// src/hooks/useVisitor.ts

import { useMutation } from "@tanstack/react-query";
import { createVisitor, sendOtpApi } from "../api/auth.api";
import { SendOtpRequest, SendOtpResponse } from "../types/auth.types";

export const useVisitor = () => {
  const mutation = useMutation({
    mutationFn: createVisitor,
   
  });

  return {
    createVisitor: mutation.mutateAsync,
    loading: mutation.isPending,
  };
};



export const useSendOtp = () => {
  return useMutation<SendOtpResponse, Error, SendOtpRequest>({
    mutationFn: sendOtpApi,

    onSuccess: (data) => {
      console.log("✅ OTP Sent:", data.message);
    },

    onError: (error) => {
      console.log("❌ OTP Error:", error.message);
    },
  });
};