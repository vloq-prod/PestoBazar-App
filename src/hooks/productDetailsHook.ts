import { useQuery } from "@tanstack/react-query";
import { ProductDetailsParams } from "../types/productdetails.types";
import { getProductDetails } from "../api/productdetails.api";

export const useProductDetails = (params: ProductDetailsParams) => {
  return useQuery({
    queryKey: ["product-details", params.product_id],
    queryFn: () => getProductDetails(params),
    enabled: !!params.product_id,

    select: (res) => {
      const data = res?.data;

      return {
        // core
        product: data?.product_master,
        images: data?.sorted_product_images || [],

        // pricing + stock (IMPORTANT)
        variation: data?.selected_variation,

        // reviews
        reviews: Object.values(data?.grouped_reviews || {}),

        // combo
        combos: data?.product_combo_variation || [],
        selectedCombo: data?.selected_combo_variation || [],

        // descriptions (accordion UI use)
        descriptions: data?.product_drop_description || [],

        // meta
        importInfo: data?.import_info,
        unitPrice: data?.unit_selling_price,
      };
    },
  });
};