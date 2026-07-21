export interface AddToCartRequest {
  user_id?: string | number;
  visitor_id?: string | null;
  product_id: number;
  qty: number;
}

export interface CartSummary {
  cart_id: string;
  cart_amount: string;
  cart_count: number;
  shipping_charge: string;
  amount_to_pay: number;
  free_shipping_message: string;
  free_shipping: string;
  gst_amount?: number | string;
  cod_charges?: string;
}

// src/types/cart.types.ts
export interface CartItem {
  id: number;
  qty: number;
  price_per_piece: string;
  pack: number;
  total_price: string;

  name: string;
  slug: string;
  active: string;

  cart_amount?: string;
  cart_id: number;
  enc_product_id: string;

  actual_price: string;
  you_save: string;

  variation_id: number;
  product_id: number;

  category_slug: string;
  product_slug: string;

  shipping_charge: string;
  main_image: string;

  s3_image_path: string; 
  size: string;
  tax_percent: string;
  gst_amount: string;

  stock: number;
  branch_id: number;
  listing_type: string;

  parent_variant_id: number;
  sku: string;
}


export interface AddToCartData {
  cart: CartSummary;
  cart_details: CartItem[];
}

export interface AddToCartResponse {
  status: number;
  message: string;
  data: AddToCartData;
}


// get cart response
// src/types/cart.types.ts

export interface GetCartParams {
  user_id?: number;
  visitor_id?: string;
}

export interface UseCartParams {
  user_id?: number;
  visitor_id?: string;
}


export interface RazorpayConfig {
  RAZORPAY_KEY: string;
  RAZORPAY_SECRET: string;
}

export interface CartData {
  cart: CartSummary;
  cart_details: CartItem[];
  cart_app: CartSummary;
  razorpay: RazorpayConfig;
}

export interface CartResponse {
  message: string;
  status: number;
  data: CartData;
}




export interface GetCartCountParams {
  user_id: number | string;
  visitor_id: string;
}
export interface CartCountResponse {
  message: string;
  status: number;
  data: number; 
}





export interface GetQuickCartParams {
  user_id: number | string;
  visitor_id: string;
}

export interface QuickCartItem {
  main_image: string;
}

export interface QuickCartResponse {
  message: string;
  status: number;
  data: QuickCartItem[];
}





export interface RemoveCartItemRequest {
  visitor_id?: string;
  user_id?: string  | number;
  product_id: string;
  qty: number; 
  cart_id: string;
  cart_detail_id: number;
}

export interface RemoveCartItemResponse {
  message: string;
  status: number;
  data: [];
}