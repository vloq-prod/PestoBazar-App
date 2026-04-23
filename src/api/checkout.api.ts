import { apiClient } from "../lib/apiClient";
import { CheckoutRequest, CheckoutResponse, GetAddressParams, GetAddressResponse, GetSingleAddressParams, GetSingleAddressResponse, RemoveAddressRequest, RemoveAddressResponse, SaveAddressRequest, SaveAddressResponse, ShippingRequest, ShippingResponse, ValidateCartRequest, ValidateCartResponse, ValidatePincodeRequest, ValidatePincodeResponse } from "../types/checkout.types";

export const checkoutApi = async (
  payload: CheckoutRequest
): Promise<CheckoutResponse> => {
  const response = await apiClient.post(
    "/app-api/v1/checkout",
    payload
  );

  return response.data;
};



export const getAddressApi = async (
  params: GetAddressParams
): Promise<GetAddressResponse> => {
  const response = await apiClient.get(
    "/app-api/v1/get-address",
    {
      params, // ✅ query params
    }
  );

  return response.data;
};


export const getSingleAddressApi = async (
  params: GetSingleAddressParams
): Promise<GetSingleAddressResponse> => {
  const response = await apiClient.get(
    "/app-api/v1/get-single-address",
    {
      params, // ✅ query params
    }
  );

  return response.data;
};




export const saveAddressApi = async (
  payload: SaveAddressRequest
): Promise<SaveAddressResponse> => {
  const response = await apiClient.post(
    "/app-api/v1/save-address",
    payload
  );

  return response.data;
};


export const removeAddressApi = async (
  payload: RemoveAddressRequest
): Promise<RemoveAddressResponse> => {
  const response = await apiClient.post(
    "/app-api/v1/remove-address",
    payload
  );

  return response.data;
};




export const shippingApi = async (
  payload: ShippingRequest
): Promise<ShippingResponse> => {
  const response = await apiClient.post(
    "/app-api/v1/shipping",
    payload
  );

  return response.data;
};






export const validateCartApi = async (
  payload: ValidateCartRequest
): Promise<ValidateCartResponse> => {
  const response = await apiClient.post(
    "/app-api/v1/validate-cart",
    payload
  );

  return response.data;
};



export const validatePincodeApi = async (
  payload: ValidatePincodeRequest
): Promise<ValidatePincodeResponse> => {
  const response = await apiClient.post(
    "/app-api/v1/validate-pincode",
    payload
  );

  return response.data;
};