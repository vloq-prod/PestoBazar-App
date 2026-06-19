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

    onSuccess: async (_res, variables) => {
      const userId = variables.user_id;

      // Invalidate both the list and any single address queries
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["address", userId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["single-address"],
        }),
      ]);

      showToast(`Address ${variables.address_id ? "updated" : "saved"} successfully`, "success");
      onDone?.();
    },
    onError: (error: any) => {
      showToast(error?.message || "Failed to save address", "error");
    }
  });
};

// done
export const useRemoveAddress = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (payload: RemoveAddressRequest) => removeAddressApi(payload),

    // ── Optimistic Update ──
    onMutate: async (variables) => {
      const userId = variables.user_id;
      const addressId = variables.address_id;

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["address", userId] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<GetAddressResponse>(["address", userId]);

      // Optimistically update to the new value
      if (previousData?.data) {
        queryClient.setQueryData<GetAddressResponse>(["address", userId], {
          ...previousData,
          data: {
            ...previousData.data,
            billing_address: previousData.data.billing_address.filter(a => a.id !== addressId),
            delivery_address: previousData.data.delivery_address.filter(a => a.id !== addressId),
          }
        });
      }

      return { previousData };
    },

    onError: (err, variables, context) => {
      // Rollback if mutation fails
      if (context?.previousData) {
        queryClient.setQueryData(["address", variables.user_id], context.previousData);
      }
      showToast("Failed to delete address", "error");
    },

    onSuccess: (_res, variables) => {
      showToast("Address deleted successfully", "success");
    },

    onSettled: (data, error, variables) => {
      // Always refetch after error or success to keep server in sync
      queryClient.invalidateQueries({
        queryKey: ["address", variables.user_id],
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
