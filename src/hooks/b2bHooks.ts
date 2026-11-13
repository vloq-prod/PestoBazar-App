import { useMutation, useQuery, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import {
  b2bGetMasterDataApi,
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
  b2bGetProfileApi,
  b2bGetApplicationStatusApi,
} from "../api/b2b.api";
import { useAppVisitorStore } from "../store/auth";
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

const b2bQueryKeys = {
  status: ["b2b-application-status"] as const,
  profile: ["b2b-profile"] as const,
};

// Refresh both mounted and cached B2B views before the save completes.
function useB2BMutation<TData extends { status: number }, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables>,
) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn,
    ...options,
    onSuccess: async (...args) => {
      if (args[0].status === 1) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: b2bQueryKeys.status,
            refetchType: "all",
          }),
          queryClient.invalidateQueries({
            queryKey: b2bQueryKeys.profile,
            refetchType: "all",
          }),
        ]);
      }
      await options?.onSuccess?.(...args);
    },
  });
}

/**
 * Master Data Hook: Fetches business types, dealer categories, states from DB
 */
export const useB2BMasterData = () => {
  return useQuery({
    queryKey: ["b2b-master-data"],
    queryFn: b2bGetMasterDataApi,
    staleTime: 1000 * 60 * 30, // 30 minutes cache
  });
};

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
  return useB2BMutation(b2bSaveBasicDetailsApi, options);
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
  return useB2BMutation(b2bVerifyOtpApi, options);
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
  return useB2BMutation(b2bSaveBusinessDetailsApi, options);
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
  return useB2BMutation(b2bSaveAddressDetailsApi, options);
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
  return useB2BMutation(b2bSaveKycDetailsApi, options);
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
  return useB2BMutation(b2bSubmitKycDetailsApi, options);
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

/**
 * 10. Hook: Fetch B2B User Profile details
 * Calls GET /api/app-b2b/profile
 */
export const useB2BProfile = (params?: {
  user_id?: string | number;
  public_id?: string;
  mobile?: string;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: params?.user_id
      ? [...b2bQueryKeys.profile, params.user_id]
      : [...b2bQueryKeys.profile, params?.public_id || "guest", params?.mobile || "none"],
    queryFn: () =>
      b2bGetProfileApi({
        user_id: params?.user_id,
        public_id: params?.public_id,
        mobile: params?.mobile,
      }),
    enabled: params?.enabled !== undefined ? params.enabled : true,
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 3, // 3 minutes cache
  });
};

export interface B2BStatusResult {
  has_application: boolean;
  is_b2b_user: boolean;
  status: string | null;
  status_badge?: any;
  public_id?: string;
  business_name?: string;
  title?: string;
  message?: string;
  status_message?: string;
}

/**
 * 11. Hook: Fetch B2B Application Status (for TabBar, Header, Badges)
 * Checks GET /api/app-b2b/application/status with automatic fallback to profile
 */
export const useB2BApplicationStatus = () => {
  const userId = useAppVisitorStore((s) => s.userId);
  const userMobile = useAppVisitorStore((s) => s.userMobile);

  return useQuery<B2BStatusResult>({
    queryKey: [...b2bQueryKeys.status, userId, userMobile],
    staleTime: 30 * 1000,
    queryFn: async (): Promise<B2BStatusResult> => {
      if (!userId && !userMobile) {
        return {
          has_application: false,
          is_b2b_user: false,
          status: null,
        };
      }

      // 1. Try GET /api/app-b2b/application/status
      try {
        const res = await b2bGetApplicationStatusApi({
          user_id: userId || undefined,
          mobile: userMobile || undefined,
        });
        if (res && res.data) {
          const d = res.data;
          const rawStatus = d.status || null;
          const isApproved =
            d.is_b2b_user === true || (rawStatus || "").toLowerCase() === "approved";
          return {
            has_application: Boolean(d.has_application ?? rawStatus),
            is_b2b_user: isApproved,
            status: rawStatus,
            status_badge: d.status_badge,
            public_id: d.public_id,
            business_name: d.business_name,
            title: d.title,
            message: d.message,
            status_message: d.status_message,
          };
        }
      } catch (e) {
        // Fallback below
      }

      // 2. Safe Fallback to b2bGetProfileApi
      try {
        const profile = await b2bGetProfileApi({
          user_id: userId || undefined,
          mobile: userMobile || undefined,
        });

        if (profile && profile.data) {
          const d = profile.data;
          const rawStatus = d.status || d.dealer?.status || null;
          const isApproved =
            d.is_b2b_user === true || (rawStatus || "").toLowerCase() === "approved";
          return {
            has_application: Boolean(d.has_b2b_application ?? d.dealer ?? rawStatus),
            is_b2b_user: isApproved,
            status: rawStatus,
            status_badge: d.status_badge,
            public_id: d.dealer?.public_id,
            business_name: d.dealer?.business_name,
          };
        }
      } catch (profileErr) {
        // Fallback error ignored
      }

      return {
        has_application: false,
        is_b2b_user: false,
        status: null,
      };
    },
    refetchOnWindowFocus: false,
  });
};

