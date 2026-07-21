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
  orderId?: string;
  key?: string;
  mobile?: string;
  email?: string;
  first_name?: string;
  total_cost?: number | string;
  company_name?: string;
  currency?: string; // Fallback if needed
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
  shipping_gst: string;

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

  enc_order_id: string;


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

export interface CancelReasonData {
  return_reason: CancelReason[];
}

export type CancelReasonResponse = ApiResponse<CancelReasonData>;

export interface CancelOrderRequest {
  order_id: string;
  user_id: string;
  cancel_reason?: string;
  cancel_reason_id: string | number;
}

export type CancelOrderResponse = ApiResponse<void>;

export interface ReturnReason {
  id: number;
  reason: string;
  active: "Yes" | "No";
  parent_id: number;
  image_required?: "Yes" | "No";
}

export interface ReturnReasonData {
  return_reason: ReturnReason[];
}

export type ReturnReasonResponse = ApiResponse<ReturnReasonData>;


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








// ======================================================
// REQUEST
// ======================================================

export interface UserOrderHistoryRequest {
  user_id: string;
}

// ======================================================
// ORDER ITEM
// ======================================================

export interface OrderHistoryItem {
  id: number;
  order_code: string;
  user_id: number;
  cart_id: number;

  order_amount: string;
  shipping_charge: string;
  cod_charges: string;

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

  current_status: string;
  delivery_note: string;

  processed: "Yes" | "No";

  tracking_no: string | null;
  courier_company: string | null;
  expected_delivery_date: string | null;
  tracking_id: string | null;

  payment_id: string | null;
  payment_type: string;

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

  cancelled_by: number | null;
  cancelled_at: string | null;
  cancel_reason_id: number | null;
  cancel_reason: string | null;

  enc_order_id: string;
  payment_mode?: string;
  bank_ref_no?: string | null;
  weight?: string;
  shiprocket_channel_id?: number;
  stock_email_triggered?: string;
  shipping_gst?: string;
  updated_at?: string | null;
  updated_by?: number | null;
  branch_id?: number;
  is_tally_sync?: number;
  tally_sync_date?: string;
  cod_charges_gst?: string;
  return_id?: number;
  product_images?: string[];
}

// ======================================================
// DATA
// ======================================================

export interface UserOrderHistoryData {
  order_master: OrderHistoryItem[];
}

// ======================================================
// FINAL RESPONSE
// ======================================================

export type UserOrderHistoryResponse =
  ApiResponse<UserOrderHistoryData>;





// ======================================================
// REQUEST
// ======================================================

export interface PaymentSuccessRequest {
  razorpay_signature: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
}

// ======================================================
// RESPONSE DATA
// Flexible because backend may return order_id / payment info
// ======================================================

export interface PaymentSuccessData {
  order_id?: string;
  payment_id?: string;
  transaction_id?: string;
}

// ======================================================
// FINAL RESPONSE
// ======================================================

export type PaymentSuccessResponse =
  ApiResponse<PaymentSuccessData>;
  











export interface Order {
  id: number;
  order_code: string;
  user_id: number;
  cart_id: number;
  order_amount: string;
  shipping_charge: string;
  cod_charges: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
  landmark: string | null;
  area: string;
  alternate_no: string;
  gst: string | null;
  company: string;
  full_name: string;
  ip: string;
  created_at: string;
  current_status: string;
  delivery_note: string;
  mobile: string;
  processed: string;
  payment_mode: string;
  tracking_no: string | null;
  courier_company: string | null;
  expected_delivery_date: string | null;
  tracking_id: string | null;
  bank_ref_no: string | null;
  email: string | null;
  weight: string;
  shiprocket_channel_id: number;
  invoice_no: string;
  invoice_sequence: number;
  invoice_year: number;
  invoice_path: string | null;
  stock_email_triggered: string;
  shipping_gst: string;
  cancelled_by: number | null;
  cancelled_at: string | null;
  cancel_reason_id: number | null;
  cancel_reason: string | null;
  order_no: string;
  payment_id: string;
  logistic_provider: string | null;
  updated_at: string | null;
  updated_by: number | null;
  branch_id: number;
  payment_type: string;
  total_refunded_amount: string;
  refund_status: string;
  refund_id: number | null;
  is_eligible_for_refund: string;
  refundable_amount: string;
  refund_amount: string;
  is_tally_sync: number;
  tally_sync_date: string;
  cod_charges_gst: string;
  return_id: number;
  paid_amount: string;
}

export interface OrderDetail {
  size: string;
  order_id: number;
  qty: number;
  price_per_piece: string;
  pack: number;
  total_amount: string;
  product_name: string;
  main_image: string;
  product_url: string;
}

export interface OrderBillingInfo {
  id: number;
  order_id: number;
  full_name: string;
  mobile: string;
  email: string;
  address: string;
  pincode: string;
  state: string;
  city: string;
  gst: string | null;
  landmark: string | null;
  state_name: string;
}

export interface OrderDeliveryInfo extends OrderBillingInfo {}

export interface ShiprocketOrder {
  id: number;
  order_id: number;
  ship_rocket_order_id: string | null;
  channel_order_id: string | null;
  shipment_id: string | null;
  awb_code: string | null;
  courier_company_id: number | null;
  courier_name: string | null;
  created_at: string;
  ship_rocket_label_path: string | null;
  pestopbazaar_label_path: string | null;
  label_created_at: string | null;
  awb_created_at: string | null;
  current_order_status: string;
  order_status_updated_at: string | null;
  freight_charges: string | null;
  pickup_scheduled_date: string | null;
  pickup_scheduled_date_created_at: string | null;
  order_status: string;
  pickup_cancelled_by: number | null;
  pickup_cancelled_at: string | null;
  is_delivered: string;
  delivered_at: string | null;
  return_initiated: string;
  return_initiated_at: string | null;
  manifest_url: string | null;
  manifest_created_at: string | null;
  tracking_url: string | null;
  logistic_provider: string;
  old_order_id: number | null;
  return_available: string;
}

export interface OrderReturn {
  id: number;
  order_id: number;
  created_at: string;
  return_status: string;
  return_key: string;
  logistic_provider: string | null;
  order_status: string;
  return_rejected_comment: string | null;
  return_rejected_at: string | null;
  return_at: string;
  unboxing_video?: string | null;
}

export interface OrderReturnProduct {
  id: number;
  return_id: number;
  product_id: number;
  quantity: number;
  size: string;
  selling_price: string;
  slug: string;
  sku: string;
  product_name: string;
  main_image: string;
  comments: string;
  main_reason: string;
  sub_reason: string;
}

export interface OrderReturnProductImage {
  return_product_detail_id: number;
  image_path: string;
}

export interface RefundBankDetail {
  id: number;
  order_return_id: number;
  order_id: number;
  refund_mode: "bank" | "upi" | string;
  account_holder?: string | null;
  account_number?: string | null;
  ifsc_code?: string | null;
  bank_name?: string | null;
  upi_id?: string | null;
  attachment_path?: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface ViewCustomerReturnOrderResponse {
  order: Order;
  order_detail: OrderDetail[];
  order_billing_info: OrderBillingInfo;
  order_delivery_info: OrderDeliveryInfo;
  shiprocket_orders: ShiprocketOrder[];
  order_return: OrderReturn;
  order_return_product: OrderReturnProduct[];
  order_return_product_images: OrderReturnProductImage[];
  refund_bank_details?: RefundBankDetail[];
  status: number;
}




export interface ReturnHistoryItem {
  return_id: number;
  return_status: string;
  order_id: number;
  return_at: string;
  returnid: string;
  enc_return_id: string;
  product_images?: string[];
  return_price?: number;
  products?: { price_per_piece: string; image: string }[];
}

export interface ReturnHistoryResponse {
  status: number;
  order_return: ReturnHistoryItem[];
}




export interface UploadReturnVideoData {
  video_path: string;
  video_name: string;
}

export interface UploadReturnVideoResponse {
  status: number;
  message: string;
  data: UploadReturnVideoData;
}



export interface ReturnProductRequest {
  order_id: string;
  product_id: number;
  return_quantity: number;
  purchased_qty: number;
  return_reason: number;
  more_return_reason: number;
  comments: string;
  return_key: string;
  product_variation_id: number;
  refund_mode: "bank" | "upi";

  account_holder?: string;
  account_number?: string;
  ifsc_code?: string;
  bank_name?: string;

  upi_id?: string | null;
  bank_path?: string | null;

  video_path: string;
}

export interface ReturnProductResponse {
  status: number;
  message: string;
  data?: {
    order_return_product_detail_id: number;
    order_id: number | string;
    order_return_id: number;
  };
}



export interface SaveReturnImageRequest {
  order_return_product_detail_id: number;
  order_return_id: number;
  order_id: number;
  image_path: string;
}

export interface SaveReturnImageResponse {
  status: number;
  message: string;
}



export interface OrderDetailItem {
  id: number;
  qty: number;
  price_per_piece: string;
  pack: number;
  total_amount: string;
  name: string;
  product_name: string;
  product_url: string;
  product_slug: string;
  category_slug: string;
  active: string;
  order_amount: string;
  order_id: number;
  actual_price: string;
  you_save: string;
  variation_id: number;
  product_id: number;
  shipping_charge: string;
  main_image: string;
  size: string;
  tax_percent: string;
  gst_amount: string;
  listing_type: string;
  parent_variant_id: number;
  sku: string;
}

export interface AddressInfo {
  id: number;
  order_id: number;
  full_name: string;
  mobile: string;
  email: string;
  address: string;
  pincode: string;
  state: string;
  city: string;
  gst: string | null;
  landmark: string | null;
  state_name: string;
}



export interface OrderDetailData {
  order_id: string;
  order: Order;
  order_detail: OrderDetailItem[];
  order_billing_info: AddressInfo;
  order_delivery_info: AddressInfo;
  shiprocket_orders: ShiprocketOrder[];
  order_return: unknown[];
  cancel_reason: CancelReason[];
  order_combo_detail: unknown[];
}

export interface OrderDetailResponse {
  message: string;
  status: number;
  data: OrderDetailData;
}