// src/types/wishlist.types.ts

/**
 * Common identity parameters for wishlist requests.
 * user_id is optional across all endpoints.
 */
export interface WishlistIdentityParams {
  user_id?: string | number | null;
  visitor_id?: string | null;
}

/**
 * Request payload for adding / toggling a product in the wishlist.
 */
export interface AddToWishlistRequest extends WishlistIdentityParams {
  product_id: number;
}

/**
 * Request payload for removing a product from the wishlist.
 */
export interface RemoveFromWishlistRequest extends WishlistIdentityParams {
  product_id: number;
}

/**
 * Response data for Add/Toggle and Remove wishlist endpoints.
 */
export interface WishlistToggleData {
  is_wishlisted: boolean;
  count: number;
}

export interface WishlistToggleResponse {
  message: string;
  status: number;
  data: WishlistToggleData;
}

/**
 * Response for wishlist count endpoint (/get-wishlist-count).
 */
export interface WishlistCountData {
  count: number;
}

export interface WishlistCountResponse {
  message: string;
  status: number;
  data: WishlistCountData;
}

/**
 * Lightweight representation of a product in wishlist or active cart.
 */
export interface WishlistItemLight {
  product_id: number;
  enc_product_id: string;
}

/**
 * Response data for /get-wishlist-data.
 * Contains lightweight wishlist and cart product arrays and total wishlist count.
 */
export interface WishlistDataResponseData {
  wishlist: WishlistItemLight[];
  products: WishlistItemLight[];
  count: number;
}

export interface WishlistDataResponse {
  message: string;
  status: number;
  data: WishlistDataResponseData;
}

/**
 * Full product details item returned by /get-user-wishlist-data.
 */
export interface WishlistProductItem {
  from_wishlist: number;
  is_new: string;
  overview: string;
  avg_rating: string;
  id: number;
  url: string;
  selling_price: string;
  mrp: string;
  size: string;
  unit: string;
  product_name: string;
  image_path: string;
  s3_image_path: string;
  gst_percent: string;
  listing_type: string;
  product_variation_id: number;
  moq: number;
  enc_product_variation_id: string;
  is_b2b_user?: string;
  selling_price_inclusive_gst?: number | string;
  category_slug?: string;
  discount?: string | number;
}

/**
 * Response data for /get-user-wishlist-data.
 */
export interface UserWishlistData {
  product_master: WishlistProductItem[];
  count: number;
}

export interface UserWishlistResponse {
  message: string;
  status: number;
  data: UserWishlistData;
}
