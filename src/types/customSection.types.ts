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
  image_path?: string;
  s3_image_path?: string;
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
  type?: "category" | "product" | string;
  timezone?: string;
  start_datetime: string;
  end_datetime: string | null;
  product_count?: number;
  products?: CustomSectionProduct[];
  category_count?: number;
  categories?: CustomCategoryItem[];
  parent_category_id?: number;
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

export interface CustomCategoryItem {
  id: number;
  category_name: string;
  slug: string;
  parent_id: number;
  category_image: string | null;
  s3_image_path: string | null;
  flip_image: string | null;
  category_bg_color: string | null;
}

export interface CustomCategorySection {
  section_id: number;
  section_title: string;
  section_description?: string | null;
  parent_category_id: number;
  sequence: number;
  start_datetime: string;
  end_datetime: string | null;
  category_count: number;
  categories: CustomCategoryItem[];
}

export interface GetCustomCategorySectionsResponse {
  status: boolean;
  message: string;
  data: CustomCategorySection[];
}