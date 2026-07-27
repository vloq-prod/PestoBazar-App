export interface ProductImage {
  asset_type: string;
  s3_image_path: string;
}

export interface DiyBanner {
  id: number;
  desktop_banner?: string | null;
  mobile_banner?: string | null;
  redirect?: string | null;
  banner_type?: string | null;
  sequence?: number | null;
  s3_image_path?: string | null;
  desktop_banner_url?: string | null;
  mobile_banner_url?: string | null;
  s3_image_url?: string | null;
}

export interface DiyItem {
  diy_id?: number;
  diy_status?: string;
  diy_created_by?: number | null;
  diy_created_at?: string | null;
  diy_updated_by?: number | null;
  diy_updated_at?: string | null;
  overview?: string | null;
  id: number;
  url: string;
  mrp: string;
  selling_price: string;
  size?: string | null;
  unit?: string | null;
  product_name: string;
  is_new?: string | null;
  is_best_selling?: string | null;
  product_variation_id?: number;
  product_id?: number;
  avg_rating?: string | null;
  total_reviews?: number | null;
  listing_type?: string | null;
  hsn_code?: string | null;
  tax?: string | null;
  keywords?: string | null;
  sku?: string | null;
  category_id?: number | null;
  category_name?: string | null;
  category_slug?: string | null;
  image_path?: string | null;
  enc_product_variation_id?: string | null;
  product_all_images?: ProductImage[];
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
  sort_by?: string | number;
  search?: string;
  [key: string]: any;
}
