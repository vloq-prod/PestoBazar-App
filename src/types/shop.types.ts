// 🔹 Request Payload
export interface ListingParams {
  page_no: number;
  category_id?: string;
  sort_by?: number;
  type?: string;
  filter_category_id?: string;
  filter_brand_id?: string;
  filter_from_price?: number;
  filter_to_price?: number;
}

// 🔹 Product Item
export interface ListingItem {
  id: number;
  url: string;
  mrp: string;
  selling_price: string;
  size: string;
  unit: string;
  product_name: string;
  image_path: string;
  overview: string | null;
  is_new: string;
  is_best_selling: string;
  avg_rating: string;
  product_variation_id: number;
  enc_product_variation_id: string;
}

// 🔹 Response
export interface ListingApiResponse {
  message: string;
  status: number;
  data: {
    data: ListingItem[];
  };
}
