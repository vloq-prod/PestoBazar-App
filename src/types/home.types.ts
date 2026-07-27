export interface BannerItem {
  s3_image_path: string;
  app_redirect_key: string;
  app_redirect_value: string;
}

export interface BannerData {
  sliding_banners: BannerItem[];
  featured_banner: BannerItem[];
  home_bottom_banners: BannerItem[];
}

export interface BannerApiResponse {
  message: string;
  status: number;
  data: BannerData;
}

// app header banner
export interface AppHeaderBannerItem {
  id: number;
  desktop_banner: string;
  mobile_banner: string;
  redirect: string;
  banner_type: string;
  sequence: number;
  s3_image_path: string;
  is_s3_uploaded: string | null;
  desktop_banner_url: string;
  mobile_banner_url: string;
  s3_image_url: string;
}

export interface AppHeaderBannerApiResponse {
  message: string;
  status: number;
  data: {
    data: AppHeaderBannerItem[];
  };
}

// app main banner
export interface AppMainBannerItem {
  id: number;
  desktop_banner: string;
  mobile_banner: string;
  redirect: string;
  banner_type: string;
  sequence: number;
  s3_image_path: string;
  is_s3_uploaded: string | null;
  desktop_banner_url: string;
  mobile_banner_url: string;
  s3_image_url: string;
}

export interface AppMainBannerApiResponse {
  message: string;
  status: number;
  data: {
    data: AppMainBannerItem[];
  };
}

// category
export interface CategoryItem {
  category_name: string;
  slug: string;
  id: number;
  category_image?: string;
  s3_image_path: string;
}

export interface CategoryData {
  category_master: CategoryItem[];
}

export interface CategoryApiResponse {
  message: string;
  status: number;
  data: CategoryData;
}

export interface CategoryWithSubcategories {
  mainCategory: CategoryItem;
  mainCategoryId: number;
  mainCategoryName: string;
  subcategories: CategoryItem[];
}

// home product
export interface ProductItem {
  id: number;
  slug: string;
  overview: string;
  selling_price: string;
  mrp: string;
  product_name: string;
  total_reviews: number;
  avg_rating: string;
  s3_image_path: string;
}

export interface ProductSection {
  title: string;
  products: ProductItem[];
}

export interface HomeProductApiResponse {
  message: string;
  status: number;
  data: ProductSection[];
}


// deals of the day 
export interface DealItem {
  id: number;
  product_id: number;
  selling_price: string;
  mrp: string;
  slug: string;
  product_name: string;
  avg_rating: string;
  s3_image_path: string;
  overview: string | null;
  expiry_date: string;
  images: string[];
}

export interface DealsApiResponse {
  message: string;
  status: number;
  data: DealItem[];
}

export interface DealsListingBanner {
  id: number;
  desktop_banner?: string | null;
  mobile_banner?: string | null;
  redirect?: string | null;
  banner_type?: string | null;
  sequence?: number | null;
  s3_image_path?: string | null;
  is_s3_uploaded?: string | null;
  desktop_banner_url?: string | null;
  mobile_banner_url?: string | null;
  s3_image_url?: string | null;
}

export interface DealsListingProductImage {
  asset_type: string;
  s3_image_path: string;
}

export interface DealsListingItem {
  id: number;
  product_id: number;
  url: string;
  size?: string | null;
  unit?: string | null;
  mrp: string;
  selling_price: string;
  discount_percentage?: string | null;
  product_name: string;
  overview?: string | null;
  avg_rating?: string | null;
  total_reviews?: number | null;
  listing_type?: string | null;
  image_path?: string | null;
  product_variation_id?: number | null;
  enc_product_variation_id?: string | null;
  deal_start_date?: string | null;
  expiry_date?: string | null;
  product_all_images?: DealsListingProductImage[];
}

export interface DealsListingApiResponse {
  message: string;
  status: number;
  data: {
    banner: DealsListingBanner | null;
    data: DealsListingItem[];
    total_count: number;
    page_no: number;
    page_size: number;
  };
}

// Feature items 
export interface FeaturedItem {
  id: number;
  product_id: number;
  mrp: string;
  selling_price: string;
  slug: string;
  product_name: string;
  avg_rating: string;
  overview: string | null;
  s3_image_path: string;
  expiry_date: string;
  images: string[];
}

export interface FeaturedApiResponse {
  message: string;
  status: number;
  data: FeaturedItem[];
}


// TestimonialItem
export interface TestimonialItem {
  name: string;
  comment: string;
  img: string;
  ratings: string;
}

export interface TestimonialApiResponse {
  message: string;
  status: number;
  data: TestimonialItem[];
}






export interface UspItem {
  image: string;
  text: string;
}

export interface UspApiResponse {
  message: string;
  status: number;
  data: UspItem[];
}


export interface BranchItem {
  order_count: number;
  branch_id: number;
  branch_name: string;
  state_name: string;
}

export interface BranchApiResponse {
  message: string;
  status: number;
  data: BranchItem[];
}





// types/recentlyViewed.types.ts
export interface RecentlyViewedItem {
  id: number;
  product_variation_id: number;
  active: string;
  is_new: string;
  overview: string;
  avg_rating: string;
  url: string;
  selling_price: string;
  mrp: string;
  size: string;
  unit: string | null;
  product_name: string;
  image_path: string;
  moq: number;
  s3_image_path: string;
  enc_product_variation_id: string;
}

export interface GetRecentlyViewedResponse {
  message: string;
  status: number;
  data: {
    recently_viewed: RecentlyViewedItem[];
  };
}

export interface GetRecentlyViewedParams {
  visitor_id: string;
  user_id?: string;
}



// ======================================================
// src/services/enquiry/enquiry.types.ts
// ======================================================

// Common API Response
export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

// ======================================================
// REQUEST
// ======================================================

export interface BulkEnquiryRequest {
  email: string;
  mobile: string;
  name: string;
  product: string;
}

// ======================================================
// RESPONSE DATA
// ======================================================

export interface BulkEnquiryData {
  id: number;

  name: string;
  mobile: string;
  email: string;
  product: string;

  ip_address: string;

  created_at: string;
  updated_at: string;
}

// ======================================================
// FINAL RESPONSE
// ======================================================

export type BulkEnquiryResponse =
  ApiResponse<BulkEnquiryData>;




export interface CartQuantityItem {
  product_id: number;
  qty: number;
}

export interface GetCartQuantityResponse {
  message: string;
  status: number;
  data: CartQuantityItem[];
}

export interface GetCartQuantityParams {
  visitor_id: string;
  user_id: string;
}




export interface SubmitRatingRequest {
  visitor_id: string;
  product_id: string;
  user_id: string;
  rating: string;
  rating_comment: string;
  rating_full_name: string;
  rating_email: string;

  images?: {
    uri: string;
    name: string;
    type: string;
  }[];

  video?: {
    uri: string;
    name: string;
    type: string;
  };
}

export interface SubmitRatingResponse {
  status: number;
  message: string;
}