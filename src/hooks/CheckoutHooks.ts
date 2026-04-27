import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  checkoutApi,
  getAddressApi,
  getSingleAddressApi,
  removeAddressApi,
  saveAddressApi,
  shippingApi,
  validateCartApi,
  validatePincodeApi,
} from "../api/checkout.api";
import {
  CheckoutRequest,
  GetAddressParams,
  GetSingleAddressParams,
  RemoveAddressRequest,
  SaveAddressRequest,
  ShippingRequest,
  ValidateCartRequest,
  ValidatePincodeRequest,
} from "../types/checkout.types";

// complete
export const useCheckout = () => {
  return useMutation({
    mutationFn: (payload: CheckoutRequest) => checkoutApi(payload),
  });
};

//  done
export const useAddress = (params: GetAddressParams) => {
  return useQuery({
    queryKey: ["address", params.user_id],
    queryFn: () => getAddressApi(params),
    enabled: !!params.user_id,

    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,

    // ❌ NO select
  });
};
// done
export const useSingleAddress = (params: GetSingleAddressParams) => {
  return useQuery({
    queryKey: ["single-address", params.user_id, params.id],
    queryFn: () => getSingleAddressApi(params),
    enabled: !!params.user_id && !!params.id,
    staleTime: 0,
    select: (res) => {
      return res?.data?.address;
    },
  });
};

// done
export const useSaveAddress = (onDone?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaveAddressRequest) =>
      saveAddressApi(payload),

    onSuccess: async (_res, variables) => {
      const userId = variables.user_id;

      await queryClient.refetchQueries({
        queryKey: ["address", userId],
        exact: true,
      });

      await queryClient.removeQueries({
        queryKey: ["single-address"],
      });

      onDone?.();
    },
  });
};
// done
export const useRemoveAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RemoveAddressRequest) => removeAddressApi(payload),

    onSuccess: async (_res, variables) => {
      const userId = variables.user_id;

      await queryClient.invalidateQueries({
        queryKey: ["address", userId],
      });
    },
  });
};
//
export const useShipping = () => {
  return useMutation({
    mutationFn: (payload: ShippingRequest) => shippingApi(payload),

    onSuccess: (data) => {
      console.log("Shipping Calculated:", data);
    },

    onError: (error) => {
      console.log("Shipping Error:", error);
    },
  });
};

export const useValidateCart = () => {
  return useMutation({
    mutationFn: (payload: ValidateCartRequest) => validateCartApi(payload),

    onSuccess: (data) => {
      console.log("Cart Valid:", data);
    },

    onError: (error) => {
      console.log("Cart Validation Error:", error);
    },
  });
};

export const useValidatePincode = () => {
  return useMutation({
    mutationFn: (payload: ValidatePincodeRequest) =>
      validatePincodeApi(payload),

    onSuccess: (data) => {
      console.log("Pincode Valid:", data);
    },

    onError: (error) => {
      console.log("Pincode Validation Error:", error);
    },
  });
};











// await queryClient.refetchQueries(...)
// setTimeout(() => router.back(), 500)