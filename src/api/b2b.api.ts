// src/api/b2b.api.ts

import { apiClient } from "../lib/apiClient";
import { StorageUtil } from "../utils/storage";
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
  B2BMasterDataResponse,
  B2BProfileResponse,
} from "../types/b2b.types";

/**
 * Fetch B2B Master Data (Business Types, Dealer Categories, States, etc. from DB)
 * Endpoint: GET /app-api/v1/b2b-master-data
 */
export const b2bGetMasterDataApi = async (): Promise<B2BMasterDataResponse> => {
  const { data } = await apiClient.get<B2BMasterDataResponse>(
    "/app-api/v1/b2b-master-data",
  );
  return data;
};

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
  console.log("🌐 [b2bSaveKycDetailsApi] Starting KYC upload request...");
  const isFd =
    payload instanceof FormData ||
    (payload &&
      (typeof (payload as any).append === "function" ||
        (payload as any)._parts !== undefined));
  const formData = isFd
    ? (payload as FormData)
    : buildKycFormData(payload as B2BSaveKycDetailsPayload);

  if ((formData as any)._parts) {
    console.log("📦 [b2bSaveKycDetailsApi] FormData _parts keys:", (formData as any)._parts.map((p: any) => p[0]));
  }

  try {
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
    console.log("✅ [b2bSaveKycDetailsApi] Success response:", JSON.stringify(data, null, 2));
    return data;
  } catch (err: any) {
    console.error("❌ [b2bSaveKycDetailsApi] Request FAILED:", {
      message: err?.message,
      code: err?.code,
      status: err?.response?.status,
      statusText: err?.response?.statusText,
      data: err?.response?.data,
      url: err?.config?.url,
    });
    throw err;
  }
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

/**
 * 9.5 Fetch B2B Application Status (Ultra-fast ~300ms)
 * Endpoint: GET /app-api/v1/app-b2b/application/status
 */
export const b2bGetApplicationStatusApi = async (params?: {
  user_id?: string | number;
  public_id?: string;
  mobile?: string;
}) => {
  try {
    const { data } = await apiClient.get(
      "/app-api/v1/app-b2b/application/status",
      { params },
    );
    return data;
  } catch (err) {
    const { data } = await apiClient.get(
      "/api/app-b2b/application/status",
      { params },
    );
    return data;
  }
};

/**
 * 10. Fetch B2B User Profile details (Ultra-fast ~300ms)
 * Uses /app-api/v1/app-b2b/application/status first, with fallback to registration details.
 */
export const b2bGetProfileApi = async (params?: {
  user_id?: string | number;
  public_id?: string;
  mobile?: string;
}): Promise<B2BProfileResponse> => {
  // 1. Try fast status endpoint first (~300ms)
  try {
    const res = await b2bGetApplicationStatusApi(params);
    if (res && res.data) {
      const d = res.data;
      if (!d.has_application) {
        return {
          status: 0,
          message: "No B2B profile found.",
          data: undefined,
        };
      }

      const isApproved =
        d.is_b2b_user === true || (d.status || "").toLowerCase() === "approved";

      return {
        status: 1,
        message: "B2B profile fetched successfully",
        data: {
          is_b2b_user: isApproved,
          has_b2b_application: true,
          status: d.status,
          status_badge: d.status_badge,
          user: null,
          dealer: {
            id: 0,
            public_id: d.public_id,
            tracking_token: d.tracking_token || "",
            status: d.status,
            kyc_status: d.status,
            current_step: d.current_step,
            last_completed_step: d.last_completed_step,
            mobile_verified: d.mobile_verified ? "Yes" : "No",
            last_admin_remark: d.last_admin_remark || "",
            correction_step: d.correction_step,
            correction_fields: d.correction_fields,

            owner_name: d.owner_name || "",
            mobile: d.mobile || "",
            alternate_mobile: d.alternate_mobile,
            email: d.email || "",

            business_name: d.business_name || d.legal_business_name || "Business Profile",
            legal_business_name: d.legal_business_name,
            business_type_id: d.business_type_id,
            business_type: d.business_type,
            dealer_category_id: d.dealer_category_id,
            dealer_category: d.dealer_category,
            years_in_business: d.years_in_business,
            referral_code: d.referral_code,
            gst_number: d.gst_number,
            pan_number: d.pan_number,
            pan_name: d.pan_name,

            business_address: d.business_address,
            business_city: d.business_city,
            business_state_id: null,
            business_state: d.business_state,
            business_pincode: d.business_pincode,

            delivery_same_as_business: d.delivery_same_as_business || "Yes",
            delivery_address: d.delivery_address,
            delivery_city: d.delivery_city,
            delivery_state_id: null,
            delivery_state: d.delivery_state,
            delivery_pincode: d.delivery_pincode,
          },
        },
      };
    }
  } catch (err: any) {
    // If status endpoint failed, fallback to registration details
  }

  // 2. Direct Fallback to /app-api/v1/b2b-registration-details without slow waterfalls
  try {
    const storedUserId = await StorageUtil.getUserId();
    const session = await StorageUtil.getB2BSession();
    const storedMobile = await StorageUtil.getUserMobile();

    const uId = params?.user_id || storedUserId || undefined;
    const mob = params?.mobile || session?.mobile || storedMobile || undefined;
    const pId = params?.public_id || session?.publicId || undefined;

    if (uId || pId || mob) {
      const regRes = await b2bGetRegistrationDetailsApi({
        user_id: uId,
        public_id: pId,
        mobile: mob,
      });

      if (regRes && regRes.status === 1 && regRes.data) {
        const d = regRes.data;
        if (d.public_id) {
          await StorageUtil.setB2BSession(
            d.public_id,
            d.tracking_token || session?.trackingToken || "",
            mob || d.basic_details?.mobile || "",
          );
        }
        const statesMap = new Map((d.states || []).map((s: any) => [s.id, s.name]));
        const bState = d.address_details?.business_state_id
          ? statesMap.get(d.address_details.business_state_id)
          : undefined;
        const dState = d.address_details?.delivery_state_id
          ? statesMap.get(d.address_details.delivery_state_id)
          : undefined;

        const isApproved =
          d.status === "Approved" ||
          d.is_b2b_user === "Yes" ||
          String(d.is_b2b_user || "").toLowerCase() === "yes";

        return {
          status: 1,
          message: "B2B profile fetched successfully",
          data: {
            is_b2b_user: isApproved,
            has_b2b_application: true,
            status: d.status,
            status_badge: {
              status: d.status,
              is_approved: isApproved,
              label: d.status || "Approved",
              color: isApproved ? "#087A54" : "#F59E0B",
              bg_color: isApproved ? "#E3F8EF" : "#FEF3C7",
              can_resume: ["Draft", "Correction Required"].includes(d.status),
            },
            user: null,
            dealer: {
              id: 0,
              public_id: d.public_id,
              tracking_token: d.tracking_token,
              status: d.status,
              kyc_status: d.status,
              current_step: d.current_step,
              last_completed_step: d.last_completed_step,
              mobile_verified: d.mobile_verified,
              last_admin_remark: d.last_admin_remark,
              correction_step: d.correction_step,
              correction_fields: d.correction_fields,

              owner_name: d.basic_details?.owner_name || "",
              mobile: mob || d.basic_details?.mobile,
              alternate_mobile: d.basic_details?.alternate_mobile,
              email: d.basic_details?.email || "",

              business_name:
                d.business_details?.business_name ||
                d.business_details?.legal_business_name,
              legal_business_name: d.business_details?.legal_business_name,
              business_type_id: d.business_details?.business_type_id,
              business_type: d.business_details?.business_type,
              dealer_category_id: d.business_details?.dealer_category_id,
              dealer_category: d.business_details?.dealer_category,
              years_in_business: d.business_details?.years_in_business,
              referral_code: d.business_details?.referral_code,
              gst_number: d.business_details?.gst_number,
              pan_number: d.business_details?.pan_number,
              pan_name: d.business_details?.pan_name,

              business_address: d.address_details?.business_address,
              business_city: d.address_details?.business_city,
              business_state_id: d.address_details?.business_state_id,
              business_state: bState,
              business_pincode: d.address_details?.business_pincode,

              delivery_same_as_business:
                d.address_details?.delivery_same_as_business || "Yes",
              delivery_address: d.address_details?.delivery_address,
              delivery_city: d.address_details?.delivery_city,
              delivery_state_id: d.address_details?.delivery_state_id,
              delivery_state: dState,
              delivery_pincode: d.address_details?.delivery_pincode,
            },
          },
        };
      }
    }
  } catch (fallbackErr) {
    // fallback error ignored
  }

  return {
    status: 0,
    message: "No B2B profile found",
    data: undefined,
  };
};

