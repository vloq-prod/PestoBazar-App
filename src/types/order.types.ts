// ======================================================
// src/services/order/order.types.ts
// ======================================================

// Common API Response
export interface ApiResponse<T> {
  status: number;
  message: string;
  data?: T;
}

export interface CodSuccessRequest {
  cart_id: string;
}

export interface CodSuccessResponse {
  status: number;
  message: string;
  order_id: string;
}





// ======================================================
// REQUEST
// ======================================================

export interface InitiateOrderRequest {
  visitor_id: string;
  user_id: string;
  cart_id: string;
  delivery_address_id?: string;
  billing_address_id: string;
}

// ======================================================
// RESPONSE DATA
// ======================================================

export interface InitiateOrderData {
  order_id?: string;
  payment_id?: string;
  amount?: number | string;
  currency?: string;
  razorpay_order_id?: string;
  key?: string;
}

// ======================================================
// FINAL RESPONSE
// ======================================================

export type InitiateOrderResponse =
  ApiResponse<InitiateOrderData>;




  