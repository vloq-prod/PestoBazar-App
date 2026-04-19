// types/search.ts

export interface SearchProduct {
  product_name: string;
  product_url: string;
  image_path: string;
  search_type: string;
  keywords: string;
  size: string;
  mrp: string;
  selling_price: string;
  sequence: number;
}

export interface SearchResponse {
  message: string;
  status: number;
  data: {
    result: SearchProduct[];
  };
}