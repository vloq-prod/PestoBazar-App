import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import {
  CustomerAlsoBoughtParams,
  DeliveryParams,
  ProductDetailsParams,
  ReviewsResponse,
  SaveRecentlyViewedParams,
} from "../types/productdetails.types";
import {
  getCustomerAlsoBought,
  getEstimatedDelivery,
  getProductDetails,
  getProductReviews,
  saveRecentlyViewed,
} from "../api/productdetails.api";

export const useProductDetails = (params: ProductDetailsParams) => {
  return useQuery({
    queryKey: ["product-details", params.product_id, params.product_slug],
    queryFn: () => getProductDetails(params),

    select: (res) => {
      const data = res?.data;

      const selectedVariation = data?.selected_variation;
      const selectedCombo = data?.selected_combo_variation || [];

      const pricingSource =
        selectedCombo?.length > 0
          ? selectedCombo[0]
          : selectedVariation || null;

      return {
        product: data?.product_master,
        images: data?.sorted_product_images || [],

        variation: selectedVariation,

        // 🔥 ADD THIS
        pricing: pricingSource,

        // reviews
        reviews: Object.values(data?.grouped_reviews || {}),

        variationmaster: data?.product_variation_master || [],
        selectedCombo,

        descriptions: data?.product_drop_description || [],

        importInfo: data?.import_info,
        unitPrice: data?.unit_selling_price,
      };
    },
  });
};

type Params = {
  product_id: number;
};

export const useProductReviews = ({ product_id }: Params) => {
  const query = useInfiniteQuery<
    ReviewsResponse,
    Error,
    InfiniteData<ReviewsResponse>,
    [string, number],
    number
  >({
    queryKey: ["product-reviews", product_id],

    queryFn: ({ pageParam }) =>
      getProductReviews({
        product_id,
        page: pageParam,
      }),

    initialPageParam: 1,

    getNextPageParam: (lastPage) => {
      const pagination = lastPage.data.pagination;

      return pagination.has_more ? pagination.current_page + 1 : undefined;
    },
  });

  const reviews =
    query.data?.pages.flatMap((page) => page.data.grouped_reviews) ?? [];

  return {
    reviews,
    loading: query.isLoading,
    fetchingMore: query.isFetchingNextPage,
    error: query.error,
    hasMore: query.hasNextPage,
    loadMore: query.fetchNextPage,
    refetch: query.refetch,
  };
};

export const useEstimatedDelivery = ({
  selected_variation_id,
  pincode,
}: DeliveryParams) => {
  const query = useQuery({
    queryKey: ["estimated-delivery", selected_variation_id, pincode],

    queryFn: () =>
      getEstimatedDelivery({
        selected_variation_id,
        pincode,
      }),

    enabled: !!selected_variation_id && !!pincode,
  });

  return {
    delivery: query.data?.data,

    loading: query.isLoading,
    error: query.data?.message,
    refetch: query.refetch,
  };
};

export const useCustomerAlsoBought = (params: CustomerAlsoBoughtParams) => {
  const query = useQuery({
    queryKey: ["customer-also-bought", params.product_id],

    queryFn: () => getCustomerAlsoBought(params),

    enabled: !!params.product_id,

    select: (res) => res?.data?.customer_also_bought || [],
  });

  return {
    products: query.data || [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

// const { products, loading } = useCustomerAlsoBought({
//   product_id: productId,
// });

export const useSaveRecentlyViewed = () => {
  const mutation = useMutation({
    mutationFn: (payload: SaveRecentlyViewedParams) =>
      saveRecentlyViewed(payload),
  });

  return {
    saveRecentlyViewed: mutation.mutate,
    saveRecentlyViewedAsync: mutation.mutateAsync,

    loading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
};
