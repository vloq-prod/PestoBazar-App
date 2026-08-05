import { apiClient } from "../lib/apiClient";
import { ApplicablePromoCodesRequest, ApplicablePromoCodesResponse, ApplyPromoCodeRequest, ApplyPromoCodeResponse, RemovePromoCodeRequest, RemovePromoCodeResponse } from "../types/promocoupon.types";


export const getApplicablePromoCodes = async (
  payload: ApplicablePromoCodesRequest,
) => {
  const { data } = await apiClient.post<ApplicablePromoCodesResponse>(
    "/app-api/v1/applicable-promo-codes",
    payload,
  );

  return data;
};



export const applyPromoCode = async (
  payload: ApplyPromoCodeRequest,
) => {
  const { data } = await apiClient.post<ApplyPromoCodeResponse>(
    "/app-api/v1/apply-promo-code",
    payload,
  );

  return data;
};


export const removePromoCode = async (
  payload: RemovePromoCodeRequest,
) => {
  const { data } = await apiClient.post<RemovePromoCodeResponse>(
    "/app-api/v1/remove-promo-code",
    payload,
  );

  return data;
};