// 🔹 Request
export interface CheckoutRequest {
  user_id: string;
}

// 🔹 Cart Summary
export interface CartSummary {
  cart_id: string;
  cart_amount: string;
  cart_count: number;
  shipping_charge: string | number;
  amount_to_pay: number;
  free_shipping_message: string;
  free_shipping: string;
  gst_amount: number | string;
  cod_charges?: string; // ✅ ADD THIS
}

// 🔹 Cart Item
export interface CartItem {
  id: number;
  qty: number;
  price_per_piece: string;
  pack: number;
  total_price: string;
  name: string;
  slug: string;
  active: string;
  cart_amount: string;
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
  size: string;
  tax_percent: string;
  gst_amount: string;
  stock: number;
  branch_id: number;
  listing_type: string;
  parent_variant_id: number;
  sku: string;
  s3_image_path: string;
}

// 🔹 Response
export interface CheckoutResponse {
  message: string;
  status: number;
  data: {
    cart: CartSummary;
    cart_details: CartItem[];
    cart_app: CartSummary;
  };
}

// 🔹 Request Params
export interface GetAddressParams {
  user_id: string;
}

// 🔹 Address
export interface AddressItem {
  address_id: string;
  id: number;
  gst: string;
  full_name: string;
  pincode: string;
  address: string;
  city: string;
  email: string;
  address_name: string;
  building: string;
  area: string;
  state_name: string;
}

// 🔹 State Master
export interface StateItem {
  id: number;
  name: string;
  state_no: number | null;
}

// 🔹 Response
export interface GetAddressResponse {
  message: string;
  status: number;
  data: {
    billing_address: AddressItem[];
    delivery_address: AddressItem[];
    state_master: StateItem[];
  };
}

// 🔹 Request Params
export interface GetSingleAddressParams {
  user_id: string;
  id: number;
}

// 🔹 Single Address
export interface SingleAddress {
  id: number;
  user_id: number;
  full_name: string;
  gst: string;
  pincode: string;
  address: string;
  state: number;
  city: string;
  active: string;
  created_at: string;
  email: string;
  address_name: string;
  mobile_no: string;
  address_type: string;
  deleted_at: string | null;
  building: string;
  area: string;
}

// 🔹 Response
export interface GetSingleAddressResponse {
  message: string;
  status: number;
  data: {
    address: SingleAddress;
  };
}

// 🔹 Request
export interface SaveAddressRequest {
  user_id: string;
  address_name: "Home" | "Office" | "Warehouse" | "Others";
  full_name: string;
  number: string;
  email: string;
  building: string;
  area: string;
  address: string;
  state: string; // state id
  city: string;
  pincode: string;
  gst?: string;
  address_id?: string; // 👉 empty = create, filled = update
  address_type: "billing" | "delivery";
}

// 🔹 Response
export interface SaveAddressResponse {
  message: string;
  status: number;
  data: {
    enc_id: string;
  };
}

export interface RemoveAddressRequest {
  user_id: string;
  address_id: number;
}

// 🔹 Response
export interface RemoveAddressResponse {
  message: string;
  status: number;
  data: [];
}

// 🔹 Request
export interface ShippingRequest {
  visitor_id: string;
  user_id: string;
  cart_id: string;
  address_id: string;
}

// 🔹 Cart Summary (shipping result)
export interface ShippingCart {
  cart_amount: string;
  shipping_charge: string;
  amount_to_pay: string;
  free_shipping_message: string;
  free_shipping: string;
  cod_charges?: string;
}

// 🔹 Response
export interface ShippingResponse {
  message: string;
  status: number;
  data: {
    cart: ShippingCart;
  };
}

// 🔹 Request
export interface ValidateCartRequest {
  visitor_id: string;
  user_id: string;
  cart_id: string;
}

// 🔹 Response
export interface ValidateCartResponse {
  message: string;
  status: number;
  data: any[]; // usually empty, but keep flexible
}

// 🔹 Request
export interface ValidatePincodeRequest {
  cart_id: string;
  delivery_address_id: string;
  payment_method: "cash" | "online"; // extend if needed
}

// 🔹 Response
export interface ValidatePincodeResponse {
  message: string;
  status: number;
  data: any[]; // empty array (keep flexible)
}
