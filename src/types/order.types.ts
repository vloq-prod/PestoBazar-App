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




  




// ======================================================
// REQUEST
// ======================================================

export interface ViewOrderRequest {
  order_id: string;
}

// ======================================================
// MAIN ORDER INFO
// ======================================================

export interface OrderInfo {
  id: number;
  order_code: string;
  user_id: number;
  cart_id: number;

  order_amount: string;
  shipping_charge: string;
  cod_charges: string;
  paid_amount: string;

  address: string;
  pincode: string;
  city: string;
  state: string;

  landmark: string;
  area: string;
  alternate_no: string;

  gst: string | null;
  company: string;

  full_name: string;
  mobile: string;
  email: string | null;

  ip: string;
  created_at: string;
  updated_at: string | null;

  current_status: string;
  delivery_note: string;

  processed: "Yes" | "No";

  tracking_no: string | null;
  courier_company: string | null;
  expected_delivery_date: string | null;
  tracking_id: string | null;

  payment_id: string | null;
  payment_type: string;
  payment_mode: string;

  invoice_no: string;
  invoice_sequence: number;
  invoice_year: number;
  invoice_path: string | null;

  logistic_provider: string;

  refund_status: string;
  refund_id: string | null;

  total_refunded_amount: string;
  refundable_amount: string;
  refund_amount: string;

  is_eligible_for_refund: "Yes" | "No";

  order_no: string;
}

// ======================================================
// PRODUCT ITEM
// ======================================================

export interface OrderItem {
  id: number;
  qty: number;
  pack: number | null;

  price_per_piece: string;
  total_amount: string;

  name: string;
  product_name: string;

  product_url: string;
  product_slug: string;
  category_slug: string;

  variation_id: number;
  product_id: number;

  actual_price: string | null;
  you_save: string | null;

  shipping_charge: string;

  main_image: string;
  size: string;
  sku: string;

  tax_percent: string;
  gst_amount: string;

  listing_type: "Static" | "Combo";
  parent_variant_id: number;

  active: "Active" | "Inactive";
}

// ======================================================
// ADDRESS INFO
// ======================================================

export interface OrderAddressInfo {
  id: number;
  order_id: number;

  full_name: string;
  mobile: string;
  email: string;

  address: string;
  pincode: string;
  city: string;
  state: string;
  state_name: string;

  gst: string | null;
}

// ======================================================
// CANCEL REASON
// ======================================================

export interface CancelReason {
  id: number;
  reason: string;
  active: "Yes" | "No";
}

// ======================================================
// FINAL DATA
// ======================================================

export interface ViewOrderData {
  order_id: string;

  order: OrderInfo;

  order_detail: OrderItem[];

  order_billing_info: OrderAddressInfo;

  order_delivery_info: OrderAddressInfo;

  shiprocket_orders: any[];

  order_return: any[];

  cancel_reason: CancelReason[];

  order_combo_detail: any[];
}

// ======================================================
// FINAL RESPONSE
// ======================================================

export type ViewOrderResponse =
  ApiResponse<ViewOrderData>;