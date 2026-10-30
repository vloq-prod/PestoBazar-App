// src/api/b2b.api.ts

import { apiClient } from "../lib/apiClient";
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
 * 0. Get Registration Details / Resume (Checks session, mobile, or public_id)
 * Endpoint: POST /app-api/v1/b2b-registration-details
 */
export const b2bGetRegistrationDetailsApi = async (
  payload: B2BGetRegistrationDetailsPayload,
): Promise<B2BGetRegistrationDetailsResponse> => {
  const { data } = await apiClient.post<B2BGetRegistrationDetailsResponse>(
    "/app-api/v1/b2b-registration-details",
    payload,
  );
  return data;
};

/**
 * 1. Save Basic Details (Step 1)
 * Endpoint: POST /app-api/v1/b2b-save-basic-details
 */
export const b2bSaveBasicDetailsApi = async (
  payload: B2BSaveBasicDetailsPayload,
): Promise<B2BSaveBasicDetailsResponse> => {
  const { data } = await apiClient.post<B2BSaveBasicDetailsResponse>(
    "/app-api/v1/b2b-save-basic-details",
    payload,
  );
  return data;
};

/**
 * 2. Verify OTP (Step 1.2)
 * Endpoint: POST /app-api/v1/b2b-verify-otp
 */
export const b2bVerifyOtpApi = async (
  payload: B2BVerifyOtpPayload,
): Promise<B2BVerifyOtpResponse> => {
  const { data } = await apiClient.post<B2BVerifyOtpResponse>(
    "/app-api/v1/b2b-verify-otp",
    payload,
  );
  return data;
};

/**
 * 3. Resend OTP
 * Endpoint: POST /app-api/v1/b2b-resend-otp
 */
export const b2bResendOtpApi = async (
  payload: B2BResendOtpPayload,
): Promise<B2BResendOtpResponse> => {
  const { data } = await apiClient.post<B2BResendOtpResponse>(
    "/app-api/v1/b2b-resend-otp",
    payload,
  );
  return data;
};

/**
 * 4. Validate Sales Referral Code
 * Endpoint: POST /app-api/v1/b2b-validate-referral-code
 */
export const b2bValidateReferralCodeApi = async (
  payload: B2BValidateReferralCodePayload,
): Promise<B2BValidateReferralCodeResponse> => {
  const { data } = await apiClient.post<B2BValidateReferralCodeResponse>(
    "/app-api/v1/b2b-validate-referral-code",
    payload,
  );
  return data;
};

/**
 * 5. Verify GSTIN
 * Endpoint: POST /app-api/v1/b2b-verify-gst
 */
export const b2bVerifyGstApi = async (
  payload: B2BVerifyGstPayload,
): Promise<B2BVerifyGstResponse> => {
  const { data } = await apiClient.post<B2BVerifyGstResponse>(
    "/app-api/v1/b2b-verify-gst",
    payload,
  );
  return data;
};

/**
 * 6. Save Business Details (Step 2)
 * Endpoint: POST /app-api/v1/b2b-save-business-details
 */
export const b2bSaveBusinessDetailsApi = async (
  payload: B2BSaveBusinessDetailsPayload,
): Promise<B2BSaveBusinessDetailsResponse> => {
  const { data } = await apiClient.post<B2BSaveBusinessDetailsResponse>(
    "/app-api/v1/b2b-save-business-details",
    payload,
  );
  return data;
};

/**
 * 7. Save Address Details (Step 3)
 * Endpoint: POST /app-api/v1/b2b-save-address-details
 */
export const b2bSaveAddressDetailsApi = async (
  payload: B2BSaveAddressDetailsPayload,
): Promise<B2BSaveAddressDetailsResponse> => {
  const { data } = await apiClient.post<B2BSaveAddressDetailsResponse>(
    "/app-api/v1/b2b-save-address-details",
    payload,
  );
  return data;
};

/**
 * Helper to build FormData from React Native file/payload objects
 */
function buildKycFormData(payload: B2BSaveKycDetailsPayload): FormData {
  const formData = new FormData();

  formData.append("public_id", payload.public_id);
  formData.append("tracking_token", payload.tracking_token);
  formData.append("legal_business_name", payload.legal_business_name);
  formData.append("pan_number", payload.pan_number);
  formData.append("pan_name", payload.pan_name);
  formData.append("aadhaar_holder_name", payload.aadhaar_holder_name);
  formData.append("business_proof_type", payload.business_proof_type);

  if (payload.gst_certificate) {
    formData.append("gst_certificate", payload.gst_certificate as any);
  }
  if (payload.pan_card) {
    formData.append("pan_card", payload.pan_card as any);
  }
  if (payload.aadhaar_card) {
    formData.append("aadhaar_card", payload.aadhaar_card as any);
  }
  if (payload.business_proof_document) {
    formData.append("business_proof_document", payload.business_proof_document as any);
  }

  return formData;
}

/**
 * 8. Save KYC Documents (Step 4)
 * Supports either a direct FormData object or B2BSaveKycDetailsPayload object.
 * Endpoint: POST /app-api/v1/b2b-save-kyc-details
 */
export const b2bSaveKycDetailsApi = async (
  payload: FormData | B2BSaveKycDetailsPayload,
): Promise<B2BSaveKycDetailsResponse> => {
  const isFd =
    payload instanceof FormData ||
    (payload &&
      (typeof (payload as any).append === "function" ||
        (payload as any)._parts !== undefined));
  const formData = isFd
    ? (payload as FormData)
    : buildKycFormData(payload as B2BSaveKycDetailsPayload);

  const { data } = await apiClient.post<B2BSaveKycDetailsResponse>(
    "/app-api/v1/b2b-save-kyc-details",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: [(d) => d],
      timeout: 120000,
    },
  );
  return data;
};

/**
 * 9. Submit Application (Step 5)
 * Endpoint: POST /app-api/v1/b2b-submit-kyc-details
 */
export const b2bSubmitKycDetailsApi = async (
  payload: B2BSubmitKycDetailsPayload,
): Promise<B2BSubmitKycDetailsResponse> => {
  const { data } = await apiClient.post<B2BSubmitKycDetailsResponse>(
    "/app-api/v1/b2b-submit-kyc-details",
    payload,
  );
  return data;
};
