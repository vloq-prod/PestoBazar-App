// ======================================================
// src/services/content/content.hooks.ts
// ======================================================

import { useQuery } from "@tanstack/react-query";

import { getTermsApi, getAboutUsApi, getRefundApi, getShippingApi, getPrivacyPolicyApi } from "../api/content.api";

    
// Terms
export const useTerms = () => {
    return useQuery({
        queryKey: ["terms"],

        queryFn: getTermsApi,

        staleTime: 1000 * 60 * 10,
    });
};


// Shipping
export const useShipping = () => {
    return useQuery({
        queryKey: ["shipping"],

        queryFn: getShippingApi,

        staleTime: 1000 * 60 * 10,
    });
};


// Refund
export const useRefund = () => {
    return useQuery({
        queryKey: ["refund"],

        queryFn: getRefundApi,

        staleTime: 1000 * 60 * 10,
    });
};


// About Us
export const useAboutUs = () => {
    return useQuery({
        queryKey: ["about-us"],

        queryFn: getAboutUsApi,

        staleTime: 1000 * 60 * 10,
    });
};


// Privacy Policy

export const usePrivacyPolicy = () => {
  return useQuery({
    queryKey: ["privacy-policy"],

    queryFn: getPrivacyPolicyApi,

    staleTime: 1000 * 60 * 10,
  });
};