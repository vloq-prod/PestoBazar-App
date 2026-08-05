export interface CustomSectionProductsRequest {
  sectionId: number;
  page?: number;
}

// Shared product shape used by both useCustomSections and useCustomSectionProducts
export interface CustomSectionProduct {
  overview: string;
  id: number;
  url: string;
  mrp: number;
  selling_price: number;
  size: string | null;
  unit: string | null;
  product_name: string;
  s3_image_path: string;  // was image_path — API now returns s3_image_path
  is_new: string;
  is_best_selling: string;
  avg_rating: number;
  product_variation_id: number;
  enc_product_variation_id: string;
  product_id: number;
  brand_id: number;
}

export interface Pagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
  has_more_pages: boolean;
  next_page_url: string | null;
  previous_page_url: string | null;
}

export interface CustomSection {
  section_id: number;
  section_title: string;
  section_description: string | null;
  sequence: number;
  selection_type: string;
  start_datetime: string;
  end_datetime: string;
  product_count: number;
  products: CustomSectionProduct[];
}

export interface CustomSectionProductsData {
  section: CustomSection;
  products: CustomSectionProduct[];
  pagination: Pagination;
}

export interface CustomSectionProductsResponse {
  status: boolean;
  message: string;
  data: CustomSectionProductsData;
}

export interface GetCustomSectionsResponse {
  status: boolean;
  message: string;
  data: CustomSection[];
}