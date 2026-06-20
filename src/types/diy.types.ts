export interface ProductImage {
  asset_type: string;
  s3_image_path: string;
}

export interface DiyBanner {
  id: number;
  desktop_banner: string;
  mobile_banner: string;
  redirect: string;
  banner_type: string;
  sequence: number;
  s3_image_path: string;
  desktop_banner_url: string;
  mobile_banner_url: string;
  s3_image_url: string;
}

export interface DiyItem {
  diy_id: number;
  diy_status: string;
  diy_created_by: number;
  diy_created_at: string;
  diy_updated_by: number | null;
  diy_updated_at: string | null;
  overview: string;
  id: number;
  url: string;
  mrp: string;
  selling_price: string;
  size: string | null;
  unit: string | null;
  product_name: string;
  is_new: string;
  is_best_selling: string;
  product_variation_id: number;
  product_id: number;
  avg_rating: string;
  total_reviews: number;
  listing_type: string;
  hsn_code: string;
  tax: string;
  keywords: string;
  sku: string;
  category_id: number;
  category_name: string;
  category_slug: string;
  image_path: string;
  enc_product_variation_id: string;
  product_all_images: ProductImage[];
}

export interface DiyListingData {
  banner: DiyBanner | null;
  data: DiyItem[];
  total_count: number;
  page_no: number;
  page_size: number;
}

export interface DiyListingResponse {
  message: string;
  status: number;
  data: DiyListingData;
}

export interface DiyListingRequest {
  page_no?: number;
  page_size?: number;
  [key: string]: any;
}
