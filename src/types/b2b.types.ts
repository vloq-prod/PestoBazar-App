// src/types/b2b.types.ts

export interface B2BApiResponse<T = any> {
  status: number; // 1 = success, 0 = failure
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// -------------------------------------------------------------
// 0. Get Registration Details / Resume
// -------------------------------------------------------------
export interface B2BGetRegistrationDetailsPayload {
  public_id?: string;
  tracking_token?: string;
  mobile?: string;
  user_id?: string | number;
}

export interface B2BRegistrationBasicDetails {
  owner_name: string;
  mobile: string;
  alternate_mobile?: string;
  email: string;
  terms_accepted: boolean;
}

export interface B2BRegistrationBusinessDetails {
  business_name?: string;
  business_type_id?: number | null;
  business_type?: string;
  dealer_category_id?: number | null;
  dealer_category?: string;
  years_in_business?: string;
  referral_code?: string;
  gst_number?: string;
  legal_business_name?: string;
  pan_number?: string;
  pan_name?: string;
}

export interface B2BRegistrationAddressDetails {
  business_address?: string;
  business_city?: string;
  business_state_id?: number | null;
  business_pincode?: string;
  delivery_same_as_business?: "Yes" | "No";
  delivery_address?: string;
  delivery_city?: string;
  delivery_state_id?: number | null;
  delivery_pincode?: string;
  warehouse_same?: "Yes" | "No";
  warehouse_address?: string;
  warehouse_city?: string;
  warehouse_state_id?: number | null;
  warehouse_pincode?: string;
}

export interface B2BRegistrationKycDetails {
  legal_business_name?: string;
  gst_number?: string;
  gst_certificate_path?: string;
  pan_number?: string;
  pan_name?: string;
  pan_card_path?: string;
  aadhaar_holder_name?: string;
  aadhaar_card_path?: string;
  business_proof_type?: string;
  business_proof_path?: string;
  business_registration_path?: string;
  address_proof_path?: string;
  shop_licence_path?: string;
  agri_licence_path?: string;
}

export interface B2BRegistrationDetailsData {
  public_id: string;
  tracking_token: string;
  status: string;
  current_step: number;
  last_completed_step: number;
  mobile_verified: "Yes" | "No";
  last_admin_remark?: string;
  basic_details: B2BRegistrationBasicDetails;
  business_details: B2BRegistrationBusinessDetails;
  address_details: B2BRegistrationAddressDetails;
  kyc_details: B2BRegistrationKycDetails;
  business_types?: Array<{ id: number; business_type_name: string }>;
  dealer_categories?: Array<{ id: number; dealer_category_name: string }>;
  states?: Array<{ id: number; name: string }>;
  business_proof_types?: string[];
  years_in_business_options?: string[];
}

export type B2BGetRegistrationDetailsResponse = B2BApiResponse<B2BRegistrationDetailsData>;

// -------------------------------------------------------------
// 1. Save Basic Details (Step 1)
// -------------------------------------------------------------
export interface B2BSaveBasicDetailsPayload {
  public_id?: string;
  tracking_token?: string;
  owner_name: string;
  mobile: string;
  alternate_mobile?: string | null;
  email: string;
  terms_accepted: 1 | true;
}

export interface B2BSaveBasicDetailsData {
  public_id: string;
  status: string;
  current_step: number;
  show_otp: boolean;
  redirect_url?: string;
}

export type B2BSaveBasicDetailsResponse = B2BApiResponse<B2BSaveBasicDetailsData>;

// -------------------------------------------------------------
// 2. Verify OTP (Step 1.2)
// -------------------------------------------------------------
export interface B2BVerifyOtpPayload {
  public_id: string;
  otp: string;
}

export interface B2BVerifyOtpData {
  public_id: string;
  tracking_token: string;
  current_step: number;
  last_completed_step: number;
  mobile_verified: "Yes";
  redirect_url?: string;
}

export type B2BVerifyOtpResponse = B2BApiResponse<B2BVerifyOtpData>;

// -------------------------------------------------------------
// 3. Resend OTP
// -------------------------------------------------------------
export interface B2BResendOtpPayload {
  public_id: string;
  channel?: "sms" | "whatsapp" | "both";
  otp_channel?: "sms" | "whatsapp" | "both";
}

export interface B2BResendOtpData {
  public_id: string;
  channel: string;
  retry_after_seconds: number;
}

export interface B2BResendOtpResponse extends B2BApiResponse<B2BResendOtpData> {
  retry_after_seconds?: number;
}

// -------------------------------------------------------------
// 4. Validate Sales Referral Code
// -------------------------------------------------------------
export interface B2BValidateReferralCodePayload {
  referral_code: string;
}

export interface B2BValidateReferralCodeData {
  valid: boolean;
  sales_code?: string;
  sales_person?: string;
  sales_person_name?: string;
  referral_code?: string;
}

export type B2BValidateReferralCodeResponse = B2BApiResponse<B2BValidateReferralCodeData>;

// -------------------------------------------------------------
// 5. Verify GSTIN
// -------------------------------------------------------------
export interface B2BVerifyGstPayload {
  gstin?: string;
  gst_number?: string;
}

export interface B2BVerifyGstData {
  gstin: string;
  legal_name?: string;
  trade_name?: string;
  business_name?: string;
  pan?: string;
  pan_name?: string;
  state?: string;
  state_code?: string;
  state_id?: number;
  suggested_state_id?: number;
  address?: string;
  city?: string;
  district?: string;
  pincode?: string;
  constitution?: string;
  status?: string;
  registration_date?: string;
  suggested_business_type_id?: number;
  suggested_dealer_category_id?: number;
  suggested_years_in_business?: string;
  [key: string]: any;
}

export type B2BVerifyGstResponse = B2BApiResponse<B2BVerifyGstData>;

// -------------------------------------------------------------
// 6. Save Business Details (Step 2)
// -------------------------------------------------------------
export interface B2BSaveBusinessDetailsPayload {
  public_id: string;
  tracking_token: string;
  business_name: string;
  business_type_id: number;
  dealer_category_id: number;
  years_in_business?: string;
  gst_number: string;
  referral_code?: string;
  legal_business_name?: string;
  pan_name?: string;
  gst_address?: string;
  gst_city?: string;
  gst_state_id?: number;
  gst_pincode?: string;
}

export interface B2BSaveBusinessDetailsData {
  public_id: string;
  tracking_token: string;
  current_step: number;
  last_completed_step?: number;
  redirect_url?: string;
}

export type B2BSaveBusinessDetailsResponse = B2BApiResponse<B2BSaveBusinessDetailsData>;

// -------------------------------------------------------------
// 7. Save Address Details (Step 3)
// -------------------------------------------------------------
export interface B2BSaveAddressDetailsPayload {
  public_id: string;
  tracking_token: string;
  business_address: string;
  business_city: string;
  business_state_id: number;
  business_pincode: string;
  delivery_same_as_business?: "Yes" | "No";
  delivery_address?: string | null;
  delivery_city?: string | null;
  delivery_state_id?: number | null;
  delivery_pincode?: string | null;
  warehouse_same?: "Yes" | "No";
  warehouse_address?: string | null;
  warehouse_city?: string | null;
  warehouse_state_id?: number | null;
  warehouse_pincode?: string | null;
}

export interface B2BSaveAddressDetailsData {
  public_id: string;
  tracking_token: string;
  current_step: number;
  redirect_url?: string;
}

export type B2BSaveAddressDetailsResponse = B2BApiResponse<B2BSaveAddressDetailsData>;

// -------------------------------------------------------------
// 8. Save KYC Documents (Step 4)
// -------------------------------------------------------------
export type B2BBusinessProofType =
  | "Insecticide Licence"
  | "Pest Control Licence"
  | "Shop & Establishment Licence"
  | "Other";

export interface B2BFileAttachment {
  uri: string;
  name: string;
  type: string;
}

export interface B2BSaveKycDetailsPayload {
  public_id: string;
  tracking_token: string;
  legal_business_name: string;
  pan_number: string;
  pan_name: string;
  aadhaar_holder_name: string;
  business_proof_type: B2BBusinessProofType | string;
  gst_certificate?: B2BFileAttachment | any;
  pan_card?: B2BFileAttachment | any;
  aadhaar_card?: B2BFileAttachment | any;
  business_proof_document?: B2BFileAttachment | any;
}

export interface B2BSaveKycDetailsData {
  public_id: string;
  tracking_token: string;
  current_step: number;
  last_completed_step: number;
  redirect_url?: string;
}

export type B2BSaveKycDetailsResponse = B2BApiResponse<B2BSaveKycDetailsData>;

// -------------------------------------------------------------
// 9. Submit KYC / Application (Step 5)
// -------------------------------------------------------------
export interface B2BSubmitKycDetailsPayload {
  public_id: string;
  tracking_token: string;
  final_confirmation: 1 | true;
}

export interface B2BSubmitKycDetailsData {
  public_id: string;
  tracking_token: string;
  status: string; // 'Submitted for Approval'
  redirect_url?: string;
}

export type B2BSubmitKycDetailsResponse = B2BApiResponse<B2BSubmitKycDetailsData>;
