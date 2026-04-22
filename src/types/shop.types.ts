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
  category_slug?: string;
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
    total_count: number;
  };
}




export interface Category {
  id: number;
  category_name: string;
}

export interface Brand {
  id: number;
  brand_name: string;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface FilterData {
  category: Category[];
  brand: Brand[];
  price: PriceRange;
}

export interface FilterResponse {
  message: string;
  status: number;
  data: FilterData;
}