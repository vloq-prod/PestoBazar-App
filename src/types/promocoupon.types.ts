export interface ApplicablePromoCodesRequest {
  cart_id: string;
  user_id: string;
  visitor_id: string;
}

export interface ApplicableCoupon {
  promo_code_id: number;
  code: string;
  title: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  max_discount_amount: number | null;
  min_order_amount: number;
  eligible_subtotal: number;
  discount_amount: number;
  cart_subtotal: number;
  payable_amount: number;
  valid_till: string;
  applicable_on: string;
  is_free_product_coupon: boolean;
  message: string;
}

export interface NearbyCoupon {
  promo_code_id: number;
  code: string;
  title: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  max_discount_amount: number | null;
  min_order_amount: number;
  cart_subtotal: number;
  required_more_amount: number;
  valid_till: string;
  applicable_on: string;
  is_free_product_coupon: boolean;
  message: string;
}

export interface ApplicablePromoCodesData {
  cart_id: number;
  cart_subtotal: number;
  shipping_charge: number;
  cod_charges: number;
  applicable_coupons: ApplicableCoupon[];
  nearby_coupons: NearbyCoupon[];
}

export interface ApplicablePromoCodesResponse {
  status: boolean;
  message: string;
  data: ApplicablePromoCodesData;
}




export interface ApplyPromoCodeRequest {
  cart_id: string;
  user_id: string;
  visitor_id: string;
  promo_code: string;
}

export interface FreeProduct {
  free_cart_item_id: number;
  is_free_product: boolean;
  source_type: string;
  rule_id: number;
  rule_name: string;
  rule_type: string;
  product_id: number;
  product_name: string;
  product_slug: string;
  product_variation_id: number;
  variation: string;
  sku: string;
  quantity: number;
  original_unit_price: number;
  free_discount_amount: number;
  final_unit_price: number;
  display_price: string;
}

export interface FreeProductSync {
  success: boolean;
  message: string;
  applied_rule_ids: number[];
  added: number;
  updated: number;
  removed: number;
  free_products: FreeProduct[];
}

export interface ApplyPromoCodeData {
  cart_id: number;
  promo_code_id: number;
  promo_code: string;
  title: string;
  discount_type: string;
  discount_value: number;
  max_discount_amount: number | null;
  cart_subtotal: number;
  eligible_subtotal: number;
  discount_amount: number;
  total_after_discount: number;
  shipping_charge: number;
  cod_charges: number;
  payable_amount: number;
  applicable_on: string;
  is_free_product_coupon: boolean;
  free_product_sync: FreeProductSync;
}

export interface ApplyPromoCodeResponse {
  status: boolean;
  message: string;
  data: ApplyPromoCodeData;
}

export interface RemovePromoCodeRequest {
  cart_id: string;
  user_id: string;
  visitor_id: string;
}

export interface RemovePromoFreeProductSync {
  success: boolean;
  message: string;
  applied_rule_ids: number[];
  added: number;
  updated: number;
  removed: number;
  free_products: [];
}

export interface RemovePromoCodeData {
  free_product_sync: RemovePromoFreeProductSync;
}

export interface RemovePromoCodeResponse {
  status: boolean;
  message: string;
  data: RemovePromoCodeData;
}