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
}

export interface CartItem {
  id: number;
  qty: number;
  price_per_piece: string;
  total_price: string;
  name: string;
  slug: string;
  main_image: string;
  size: string;
  stock: number;
  product_id: number;
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
