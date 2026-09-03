export interface ProductComparisonPrice {
  mrp: number;
  selling_price: number;
  display_price: number;
}

export interface ProductComparisonProduct {
  variation_id: number;
  product_id: number;
  product_name: string;
  display_name: string;
  sku: string;
  size: string;
  unit: string;
  brand_id: number;
  brand_name: string;
  is_arbuda: boolean;
  is_current: boolean;
  slug: string;
  product_url: string;
  image_url: string;
  price: ProductComparisonPrice;
  attributes: Record<string, string>;
  is_best_value: boolean;
  saving_from_current: number;
  saving_percent_from_current: number;
}

export interface ProductComparisonAttribute {
  id: number;
  attribute_name: string;
  sequence: number;
}

export interface ProductComparisonData {
  has_comparison: boolean;
  show_economical_card: boolean;

  current: ProductComparisonProduct;

  economical_product: ProductComparisonProduct | null;

  best_value_variation_id: number | null;

  products: ProductComparisonProduct[];

  attributes: ProductComparisonAttribute[];

  info_message: string;
}

export interface ProductComparisonResponse {
  message: string;
  status: number;
  data: ProductComparisonData;
}