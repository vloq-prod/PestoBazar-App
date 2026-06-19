// ======================================================
// src/services/content/content.api.ts
// ======================================================



import { apiClient } from "../lib/apiClient";
import {
  TermsResponse,
  ShippingResponse,
  RefundResponse,
  AboutUsResponse,
  PrivacyPolicyResponse,
} from "../types/content.types";


// Terms
export const getTermsApi =
async (): Promise<TermsResponse> => {

  const response =
    await apiClient.get<TermsResponse>(
      "/app-api/v1/terms-and-condition"
    );

  return response.data;
};


// Shipping
export const getShippingApi =
async (): Promise<ShippingResponse> => {

  const response =
    await apiClient.get<ShippingResponse>(
      "/app-api/v1/shipping-cancellation"
    );

  return response.data;
};


// Refund
export const getRefundApi =
async (): Promise<RefundResponse> => {

  const response =
    await apiClient.get<RefundResponse>(
      "/app-api/v1/refund-policy"
    );

  return response.data;
};


// About Us
export const getAboutUsApi =
async (): Promise<AboutUsResponse> => {

  const response =
    await apiClient.get<AboutUsResponse>(
      "/app-api/v1/about-us"
    );

  return response.data;
};


// Privacy Policy
export const getPrivacyPolicyApi =
async (): Promise<PrivacyPolicyResponse> => {

  const response =
    await apiClient.get<PrivacyPolicyResponse>(
      "/app-api/v1/privacy-policy"
    );

  return response.data;
};