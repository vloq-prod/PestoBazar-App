// src/hooks/useVisitor.ts

import { useMutation } from "@tanstack/react-query";
import { createVisitor, googleAuthCallback, sendOtpApi, verifyOtpApi, verifyUser } from "../api/auth.api";
import {
  GoogleCallbackRequest,
  GoogleCallbackResponse,
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
  });
};

export const useVerifyOtp = () => {
  return useMutation<VerifyOtpResponse, Error, VerifyOtpRequest>({
    mutationFn: verifyOtpApi,
  });
};



export const useVerifyUser = () => {
  return useMutation({
    mutationFn: (payload: VerifyUserRequest) =>
      verifyUser(payload),
  });
};

export const useGoogleAuthCallback = () => {
  return useMutation<GoogleCallbackResponse, Error, GoogleCallbackRequest>({
    mutationFn: googleAuthCallback,
  });
};


