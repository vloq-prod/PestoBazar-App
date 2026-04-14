export interface ProductDetailsParams {
  product_id: number;
}

/* ---------- PRODUCT MASTER ---------- */
export interface ProductMaster {
  id: number;
  product_name: string;
  description: string;
  slug: string;
  category_id: number;
  brand_id: number;
  keywords: string;
  variant_type: string;
  is_featured: string;
  is_best_selling: string;
  active: string;
  created_at: string;
  created_by: number;
  total_reviews: number;
  avg_rating: number;
  type: string | null;
  updated_at: string;
  updated_by: number;
  unit: string | null;
  tax: string;
  hsn_code: string;
  msds_file: string;
  dfu_file: string;
  meta_description: string;
  meta_title: string;
  og_msds_file: string;
  og_dfu_file: string;
  is_new: string;
  overview: string;
  sequence: number;
  vendor_id: number;
  schema_product: string | null;
  country_of_origin: number;
  import_id: number;
  listing_type: string;
}

/* ---------- VARIATION MASTER ---------- */
export interface ProductVariation {
  id: number;
  slug: string;
  size: string | null;
  actual_weight: string | null;
  unit_of_measure: string | null;
  unit_sellig_price: string; // keep as API
}

/* ---------- SELECTED VARIATION ---------- */
export interface SelectedVariation {
  id: number;
  product_id: number;
  size: string | null;
  unit: string | null;
  mrp: string | null;
  selling_price: string | null;
  slug: string;
  length: string;
  breadth: string;
  height: string;
  weight: string;
  moq: number;
  stock: number | null;
  sku: string;
  created_by: number;
  created_at: string;
  active: string;
  updated_at: string;
  updated_by: number;
  sequence: number;
  item_in_pack: number;
  actual_weight: string | null;
  unit_of_measure: string | null;
  product_visibility: string;
}

/* ---------- IMAGES ---------- */
export interface ProductImage {
  id: number;
  product_id: number;
  image_path: string;
  active: string;
  created_at: string;
  created_by: number;
  sequence: number;
  product_variation_id: number;
  asset_type: "image" | "video";
  video_path: string | null;
  is_compressed: string;
  old_image_path: string | null;
  s3_image_path: string;
  is_s3_uploaded: string;
}

/* ---------- REVIEW MEDIA ---------- */
export interface ReviewMedia {
  first_image: string | null;
  video: string | null;
  other_images: string[];
}

/* ---------- REVIEWS ---------- */
export interface Review {
  id: number;
  rating: number;
  review: string;
  full_name: string;
  email: string;
  admin_comments: string | null;
  created_at: string;
  media: ReviewMedia;
}

/* ---------- DROP DESCRIPTION ---------- */
export interface ProductDropDescription {
  id: number;
  product_id: number;
  drop_name: string;
  drop_description: string;
  created_by: number;
  created_at: string;
  updated_by: number;
  updated_at: string;
  active: string;
}

/* ---------- IMPORT INFO ---------- */
export interface ImportInfo {
  name: string;
  contact_no: string;
  address: string;
  country_name: string;
}

/* ---------- COMBO ---------- */
export interface ProductCombo {
  product_name: string;
  selling_price: string;
  mrp: string;
  slug: string;
  variation_id: number;
}

/* ---------- MAIN RESPONSE ---------- */
export interface ProductDetailsResponse {
  message: string;
  status: number;
  data: {
    product_master: ProductMaster;
    product_variation_master: ProductVariation[];
    selected_variation: SelectedVariation;
    product_images: ProductImage[];
    sorted_product_images: ProductImage[];
    product_drop_description: ProductDropDescription[];
    grouped_reviews: Record<string, Review>;
    import_info: ImportInfo;
    unit_selling_price: string;
    product_combo_variation: ProductCombo[];
    selected_combo_variation: ProductCombo[];
  };
}