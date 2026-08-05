import { useMutation, useQuery } from "@tanstack/react-query";
import { ApplicablePromoCodesRequest, ApplyPromoCodeRequest, RemovePromoCodeRequest } from "../types/promocoupon.types";
import { applyPromoCode, getApplicablePromoCodes, removePromoCode } from "../api/promocoupon.api";

export const useApplicablePromoCodes = (
  payload: ApplicablePromoCodesRequest,
) => {
  return useQuery({
    queryKey: ["applicable-promo-codes", payload.cart_id],
    queryFn: () => getApplicablePromoCodes(payload),
    enabled: !!payload.cart_id,
  });
};

export const useApplyPromoCode = () => {
  return useMutation({
    mutationFn: (payload: ApplyPromoCodeRequest) =>
      applyPromoCode(payload),
  });
};

export const useRemovePromoCode = () => {
  return useMutation({
    mutationFn: (payload: RemovePromoCodeRequest) =>
      removePromoCode(payload),
  });
};