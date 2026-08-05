export interface FreeProductResponse {
  success: boolean;
  message: string;
  data: FreeProductData;
}

export interface FreeProductData {
  has_free_product: boolean;
  has_combo_default_free_product: boolean;
  selected_product: SelectedProduct;
  primary_offer: OfferRule | null;
  rules: OfferRule[];
  rule_groups: RuleGroups;
}

export interface SelectedProduct {
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
}