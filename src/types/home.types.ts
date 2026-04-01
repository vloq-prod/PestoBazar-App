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


// category
export interface CategoryItem {
  category_name: string;
  slug: string;
  category_image: string;
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