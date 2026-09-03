import ProductMediaLightbox, { ProductMediaItem } from "./ProductMediaLightbox";

export type MediaItem = ProductMediaItem & {
  reviewInfo?: any;
};

export default ProductMediaLightbox;
