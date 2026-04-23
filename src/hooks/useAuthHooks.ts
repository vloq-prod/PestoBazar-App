// src/hooks/useVisitor.ts

import { useMutation } from "@tanstack/react-query";
import { createVisitor, sendOtpApi, verifyOtpApi, verifyUser } from "../api/auth.api";
import {
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  VerifyUserRequest,
} from "../types/auth.types";

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
      console.log("OTP Sent:", data.message);
    },

    onError: (error) => {
      console.log("OTP Error:", error.message);
    },
  });
};

export const useVerifyOtp = () => {
  return useMutation<VerifyOtpResponse, Error, VerifyOtpRequest>({
    mutationFn: verifyOtpApi,

    onSuccess: (data) => {
      console.log("Verify Success:", data.message);

      if (data.data.user_exists === "0") {
        console.log("New User Registered");
      } else {
        console.log("Existing User Logged In");
      }
    },

    onError: (error) => {
      console.log("Verify OTP Error:", error.message);
    },
  });
};




export const useVerifyUser = () => {
  return useMutation({
    mutationFn: (payload: VerifyUserRequest) =>
      verifyUser(payload),

    onSuccess: (data) => {
      console.log("Verify User Success:", data);
    },

    onError: (error) => {
      console.log("Verify User Error:", error);
    },
  });
};


