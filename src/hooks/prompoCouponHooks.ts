import { useMutation, useQuery } from "@tanstack/react-query";
import { ApplicablePromoCodesRequest, ApplyPromoCodeRequest, RemovePromoCodeRequest } from "../types/promocoupon.types";
import { applyPromoCode, getApplicablePromoCodes, removePromoCode } from "../api/promocoupon.api";

export const useApplicablePromoCodes = (
  payload: ApplicablePromoCodesRequest,
) => {
  return useQuery({
    queryKey: ["applicable-promo-codes", payload.cart_id],
    queryFn: () => getApplicablePromoCodes(payload),
    enabled:
      !!payload.user_id &&
      payload.user_id !== "0" &&
      !!payload.cart_id &&
      payload.cart_id !== "0" &&
      payload.cart_id !== "undefined",
    staleTime: 1000 * 60 * 5, // 5 minutes fresh cache
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
