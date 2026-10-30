// src/hooks/b2bHooks.ts

import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import {
  b2bGetRegistrationDetailsApi,
  b2bSaveBasicDetailsApi,
  b2bVerifyOtpApi,
  b2bResendOtpApi,
  b2bValidateReferralCodeApi,
  b2bVerifyGstApi,
  b2bSaveBusinessDetailsApi,
  b2bSaveAddressDetailsApi,
  b2bSaveKycDetailsApi,
  b2bSubmitKycDetailsApi,
} from "../api/b2b.api";
import {
  B2BGetRegistrationDetailsPayload,
  B2BGetRegistrationDetailsResponse,
  B2BSaveBasicDetailsPayload,
  B2BSaveBasicDetailsResponse,
  B2BVerifyOtpPayload,
  B2BVerifyOtpResponse,
  B2BResendOtpPayload,
  B2BResendOtpResponse,
  B2BValidateReferralCodePayload,
  B2BValidateReferralCodeResponse,
  B2BVerifyGstPayload,
  B2BVerifyGstResponse,
  B2BSaveBusinessDetailsPayload,
  B2BSaveBusinessDetailsResponse,
  B2BSaveAddressDetailsPayload,
  B2BSaveAddressDetailsResponse,
  B2BSaveKycDetailsPayload,
  B2BSaveKycDetailsResponse,
  B2BSubmitKycDetailsPayload,
  B2BSubmitKycDetailsResponse,
} from "../types/b2b.types";

/**
 * 0. Hook: Get Registration Details / Resume
 */
export const useB2BGetRegistrationDetails = (
  options?: UseMutationOptions<
    B2BGetRegistrationDetailsResponse,
    Error,
    B2BGetRegistrationDetailsPayload
  >,
) => {
  return useMutation({
    mutationFn: b2bGetRegistrationDetailsApi,
    ...options,
  });
};

/**
 * 1. Hook: Save Basic Details (Step 1)
 */
export const useB2BSaveBasicDetails = (
  options?: UseMutationOptions<
    B2BSaveBasicDetailsResponse,
    Error,
    B2BSaveBasicDetailsPayload
  >,
) => {
  return useMutation({
    mutationFn: b2bSaveBasicDetailsApi,
    ...options,
  });
};

/**
 * 2. Hook: Verify OTP (Step 1.2)
 */
export const useB2BVerifyOtp = (
  options?: UseMutationOptions<
    B2BVerifyOtpResponse,
    Error,
    B2BVerifyOtpPayload
  >,
) => {
  return useMutation({
    mutationFn: b2bVerifyOtpApi,
    ...options,
  });
};

/**
 * 3. Hook: Resend OTP
 */
export const useB2BResendOtp = (
  options?: UseMutationOptions<
    B2BResendOtpResponse,
    Error,
    B2BResendOtpPayload
  >,
) => {
  return useMutation({
    mutationFn: b2bResendOtpApi,
    ...options,
  });
};

/**
 * 4. Hook: Validate Sales Referral Code
 */
export const useB2BValidateReferralCode = (
  options?: UseMutationOptions<
    B2BValidateReferralCodeResponse,
    Error,
    B2BValidateReferralCodePayload
  >,
) => {
  return useMutation({
    mutationFn: b2bValidateReferralCodeApi,
    ...options,
  });
};

/**
 * 5. Hook: Verify GSTIN
 */
export const useB2BVerifyGst = (
  options?: UseMutationOptions<
    B2BVerifyGstResponse,
    Error,
    B2BVerifyGstPayload
  >,
) => {
  return useMutation({
    mutationFn: b2bVerifyGstApi,
    ...options,
  });
};

/**
 * 6. Hook: Save Business Details (Step 2)
 */
export const useB2BSaveBusinessDetails = (
  options?: UseMutationOptions<
    B2BSaveBusinessDetailsResponse,
    Error,
    B2BSaveBusinessDetailsPayload
  >,
) => {
  return useMutation({
    mutationFn: b2bSaveBusinessDetailsApi,
    ...options,
  });
};

/**
 * 7. Hook: Save Address Details (Step 3)
 */
export const useB2BSaveAddressDetails = (
  options?: UseMutationOptions<
    B2BSaveAddressDetailsResponse,
    Error,
    B2BSaveAddressDetailsPayload
  >,
) => {
  return useMutation({
    mutationFn: b2bSaveAddressDetailsApi,
    ...options,
  });
};

/**
 * 8. Hook: Save KYC Documents (Step 4)
 */
export const useB2BSaveKycDetails = (
  options?: UseMutationOptions<
    B2BSaveKycDetailsResponse,
    Error,
    FormData | B2BSaveKycDetailsPayload
  >,
) => {
  return useMutation({
    mutationFn: b2bSaveKycDetailsApi,
    ...options,
  });
};

/**
 * 9. Hook: Submit Application (Step 5)
 */
export const useB2BSubmitKycDetails = (
  options?: UseMutationOptions<
    B2BSubmitKycDetailsResponse,
    Error,
    B2BSubmitKycDetailsPayload
  >,
) => {
  return useMutation({
    mutationFn: b2bSubmitKycDetailsApi,
    ...options,
  });
};

/**
 * Unified Multi-step Registration Flow Hook
 * Automatically manages public_id, tracking_token, and step transitions.
 */
export const useB2BRegistrationFlow = (initialState?: {
  public_id?: string;
  tracking_token?: string;
  current_step?: number;
}) => {
  const [publicId, setPublicId] = useState<string>(initialState?.public_id || "");
  const [trackingToken, setTrackingToken] = useState<string>(
    initialState?.tracking_token || "",
  );
  const [currentStep, setCurrentStep] = useState<number>(
    initialState?.current_step || 1,
  );

  const saveBasicDetailsMutation = useB2BSaveBasicDetails({
    onSuccess: (res) => {
      if (res.data?.public_id) {
        setPublicId(res.data.public_id);
      }
      if (res.data?.current_step) {
        setCurrentStep(res.data.current_step);
      }
    },
  });

  const verifyOtpMutation = useB2BVerifyOtp({
    onSuccess: (res) => {
      if (res.data?.tracking_token) {
        setTrackingToken(res.data.tracking_token);
      }
      if (res.data?.current_step) {
        setCurrentStep(res.data.current_step);
      }
    },
  });

  const resendOtpMutation = useB2BResendOtp();
  const validateReferralMutation = useB2BValidateReferralCode();
  const verifyGstMutation = useB2BVerifyGst();

  const saveBusinessDetailsMutation = useB2BSaveBusinessDetails({
    onSuccess: (res) => {
      if (res.data?.current_step) {
        setCurrentStep(res.data.current_step);
      }
    },
  });

  const saveAddressDetailsMutation = useB2BSaveAddressDetails({
    onSuccess: (res) => {
      if (res.data?.current_step) {
        setCurrentStep(res.data.current_step);
      }
    },
  });

  const saveKycDetailsMutation = useB2BSaveKycDetails({
    onSuccess: (res) => {
      if (res.data?.current_step) {
        setCurrentStep(res.data.current_step);
      }
    },
  });

  const submitKycDetailsMutation = useB2BSubmitKycDetails({
    onSuccess: (res) => {
      setCurrentStep(5);
    },
  });

  const resetFlow = useCallback(() => {
    setPublicId("");
    setTrackingToken("");
    setCurrentStep(1);
  }, []);

  return {
    // State
    publicId,
    setPublicId,
    trackingToken,
    setTrackingToken,
    currentStep,
    setCurrentStep,
    resetFlow,

    // Step Mutations
    saveBasicDetails: saveBasicDetailsMutation.mutateAsync,
    isSavingBasicDetails: saveBasicDetailsMutation.isPending,

    verifyOtp: verifyOtpMutation.mutateAsync,
    isVerifyingOtp: verifyOtpMutation.isPending,

    resendOtp: resendOtpMutation.mutateAsync,
    isResendingOtp: resendOtpMutation.isPending,

    validateReferralCode: validateReferralMutation.mutateAsync,
    isValidatingReferralCode: validateReferralMutation.isPending,

    verifyGst: verifyGstMutation.mutateAsync,
    isVerifyingGst: verifyGstMutation.isPending,

    saveBusinessDetails: saveBusinessDetailsMutation.mutateAsync,
    isSavingBusinessDetails: saveBusinessDetailsMutation.isPending,

    saveAddressDetails: saveAddressDetailsMutation.mutateAsync,
    isSavingAddressDetails: saveAddressDetailsMutation.isPending,

    saveKycDetails: saveKycDetailsMutation.mutateAsync,
    isSavingKycDetails: saveKycDetailsMutation.isPending,

    submitKycDetails: submitKycDetailsMutation.mutateAsync,
    isSubmittingKycDetails: submitKycDetailsMutation.isPending,

    // Raw mutation objects for full access
    mutations: {
      saveBasicDetailsMutation,
      verifyOtpMutation,
      resendOtpMutation,
      validateReferralMutation,
      verifyGstMutation,
      saveBusinessDetailsMutation,
      saveAddressDetailsMutation,
      saveKycDetailsMutation,
      submitKycDetailsMutation,
    },
  };
};
