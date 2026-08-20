export interface FreeProductResponse {
  success: boolean;
  message: string;
  data: FreeProductData;
}

export interface SelectedProduct {
  product_id: number;
  product_name: string;
  product_slug: string;
  brand_id?: number | null;
  category_ids?: number[];
  variation_id: number;
  variation: string;
  size: string;
  unit: string;
  sku: string;
  mrp: number;
  selling_price: number;
}

export interface ActiveCoupon {
  promo_code_id: number;
  code: string;
  title: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  max_discount_amount: number | null;
  min_order_amount: number | null;
  eligible_subtotal: number;
  cart_subtotal: number;
  discount_amount: number;
  payable_amount: number;
  required_more_amount: number;
  is_min_order_met: boolean;
  valid_till: string;
  applicable_on: string;
  match_source: string;
  matching_product_id: number | null;
  matching_brand_id: number | null;
  matching_category_ids: number[];
  is_free_product_coupon: boolean;
  message: string;
}

export interface FreeProductData {
  has_free_product: boolean;
  has_combo_default_free_product: boolean;
  selected_product: SelectedProduct;
  has_coupon?: boolean;
  active_coupons?: ActiveCoupon[];
  primary_offer: OfferRule | null;
  rules: OfferRule[];
  rule_groups: RuleGroups;
}

export interface RuleGroups {
  combo_default: OfferRule[];
  buy_x_get_y: OfferRule[];
  cart_value: OfferRule[];
  coupon_linked: OfferRule[];
}

export interface OfferRule {
  rule_id: number;
  rule_code: string;
  rule_name: string;
  rule_type: string;
  priority: number;
  start_date: string;
  end_date: string;
  max_application_per_cart: number | null;
  stop_further_rule_processing: boolean;

  condition: RuleCondition;

  coupons: any[];

  offer_badge: string;
  offer_title: string;
  offer_message: string;
  short_offer_message: string;
  cart_prompt_message: string;
  urgency_message: string;

  free_products: FreeRewardProduct[];
}

export interface RuleCondition {
  minimum_cart_value?: number | null;
  maximum_cart_value?: number | null;
  cart_value_basis?: string;
  include_tax?: boolean;
  include_shipping?: boolean;

  // BUY_X_GET_Y fields
  buy_product_variation_id?: number;
  minimum_buy_quantity?: number;
  allow_multiple_applications?: boolean;
}

export interface FreeRewardProduct {
  reward_id: number;

  product_id: number;
  product_name: string;
  product_slug: string;

  variation_id: number;
  variation: string;

  size: string;
  unit: string;
  sku: string;

  mrp: number;
  selling_price: number;
  final_price: number;

  free_quantity: number;
  maximum_free_quantity: number;

  stock_failure_action: string;
  s3_image_path?: string | null;
}