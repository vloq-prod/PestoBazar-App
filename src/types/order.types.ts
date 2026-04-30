// ======================================================
// src/services/order/order.types.ts
// ======================================================

// Common API Response
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// --------------------------------------
// COD Success Request
// --------------------------------------
export interface CodSuccessRequest {
  cart_id: string;
}

// --------------------------------------
// COD Success Response
// --------------------------------------
export interface CodSuccessResponse {
  status: number;
  message: string;
  order_id: string;
}





// --------------------------------------
// Request
// --------------------------------------
export interface ViewOrderRequest {
  order_id: string;
}

// --------------------------------------
// Order Main Info
// --------------------------------------
export interface OrderInfo {
  id: number;
  order_code: string;
  full_name: string;
  mobile: string;
  address: string;
  city: string;
  pincode: string;
  state: string;
  created_at: string;
  current_status: string;
  payment_type: string;
  paid_amount: string;
  order_amount: string;
  shipping_charge: string;
  invoice_no: string;
}

// --------------------------------------
// Order Product Item
// --------------------------------------
export interface OrderDetailItem {
  id: number;
  qty: number;
  total_amount: string;
  name: string;
  product_name: string;
  size: string;
  main_image: string;
  sku: string;
  price_per_piece: string;
}

// --------------------------------------
// Billing / Delivery
// --------------------------------------
export interface OrderAddressInfo {
  full_name: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
  state_name: string;
}

// --------------------------------------
// Cancel Reason
// --------------------------------------
export interface CancelReasonItem {
  id: number;
  reason: string;
  active: string;
}

// --------------------------------------
// Final Response Data
// --------------------------------------
export interface ViewOrderData {
  order_id: string;
  order: OrderInfo;
  order_detail: OrderDetailItem[];
  order_billing_info: OrderAddressInfo;
  order_delivery_info: OrderAddressInfo;
  shiprocket_orders: any[];
  order_return: any[];
  cancel_reason: CancelReasonItem[];
  order_combo_detail: any[];
}

// --------------------------------------
// Final Response
// --------------------------------------
export type ViewOrderResponse =
  ApiResponse<ViewOrderData>;






  // ======================================================
// src/services/order/order.types.ts
// ADD THIS IN SAME FILE
// ======================================================

// Common API Response
export interface ApiResponse<T> {
  message: string;
  status: number;
  data: T;
}

// --------------------------------------
// Request
// --------------------------------------
export interface UserOrderHistoryRequest {
  user_id: string;
}

// --------------------------------------
// Single Order Item
// --------------------------------------
export interface UserOrderHistoryItem {
  id: number;
  order_code: string;
  order_no: string;
  full_name: string;
  mobile: string;
  city: string;
  pincode: string;
  address: string;

  order_amount: string;
  shipping_charge: string;
  payment_type: string;
  payment_id: string | null;

  current_status: string;
  created_at: string;

  invoice_no: string;
  invoice_path: string | null;

  logistic_provider: string;
}

// --------------------------------------
// Response Data
// --------------------------------------
export interface UserOrderHistoryData {
  order_master: UserOrderHistoryItem[];
}

// --------------------------------------
// Final Response
// --------------------------------------
export type UserOrderHistoryResponse =
  ApiResponse<UserOrderHistoryData>;