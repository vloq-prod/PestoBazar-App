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

    select: (res) => {
      const data = res?.data;

      return {
        billing: data?.billing_address || [],
        delivery: data?.delivery_address || [],
        states: data?.state_master || [],
      };
    },
  });
};

export const useSingleAddress = (params: GetSingleAddressParams) => {
  return useQuery({
    queryKey: ["single-address", params.user_id, params.id],

    queryFn: () => getSingleAddressApi(params),

    enabled: !!params.user_id && !!params.id,

    select: (res) => {
      return res?.data?.address;
    },
  });
};

export const useSaveAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaveAddressRequest) => saveAddressApi(payload),

    onSuccess: (data) => {
      console.log("Address Saved:", data);

      // 🔥 IMPORTANT → refresh address list
      queryClient.invalidateQueries({
        queryKey: ["address"],
      });
    },

    onError: (error) => {
      console.log("Save Address Error:", error);
    },
  });
};
// done
export const useRemoveAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RemoveAddressRequest) => removeAddressApi(payload),

    onSuccess: (data) => {
      console.log("Address Removed:", data);

      // 🔥 Refresh address list
      queryClient.invalidateQueries({
        queryKey: ["address"],
      });
    },

    onError: (error) => {
      console.log("Remove Address Error:", error);
    },
  });
};

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
