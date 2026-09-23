import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../context/ToastContext";
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
  GetAddressResponse,
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
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (payload: SaveAddressRequest) => saveAddressApi(payload),
    onSuccess: (_res, variables) => {
      showToast(
        `Address ${variables.address_id ? "updated" : "saved"} successfully`,
        "success",
      );
      queryClient.invalidateQueries({ queryKey: ["address"] });
      queryClient.invalidateQueries({ queryKey: ["single-address"] });
      onDone?.();
    },
    onError: (error: any) => {
      showToast(error?.message || "Failed to save address", "error");
    },
  });
};

// done
export const useRemoveAddress = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (payload: RemoveAddressRequest) => removeAddressApi(payload),
    onSuccess: () => {
      showToast("Address deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["address"] });
    },
    onError: (err: any) => {
      showToast(err?.message || "Failed to delete address", "error");
    },
  });
};
//
export const useShipping = () => {
  return useMutation({
    mutationFn: (payload: ShippingRequest) => shippingApi(payload),
  });
};

export const useValidateCart = () => {
  return useMutation({
    mutationFn: (payload: ValidateCartRequest) => validateCartApi(payload),
  });
};

export const useValidatePincode = () => {
  return useMutation({
    mutationFn: (payload: ValidatePincodeRequest) =>
      validatePincodeApi(payload),
  });
};
