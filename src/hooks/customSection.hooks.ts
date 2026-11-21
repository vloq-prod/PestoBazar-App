import { useQuery, useInfiniteQuery, InfiniteData } from "@tanstack/react-query";
import {
  CustomSectionProductsRequest,
  CustomSectionProductsResponse,
} from "../types/customSection.types";
import {
  getCustomCategorySections,
  getCustomProductSections,
  getCustomSectionProducts,
  getCustomSections,
} from "../api/customSection.api";

export const useCustomSectionProducts = (
  payload: CustomSectionProductsRequest & { user_id?: string | null },
) => {
  return useQuery({
    queryKey: [
      "custom-section-products",
      payload.sectionId,
      payload.page,
      payload.user_id ?? "guest",
    ],
    queryFn: () => getCustomSectionProducts(payload),
    enabled: !!payload.sectionId,
  });
};

export const useInfiniteCustomSectionProducts = (
  sectionId: number,
  userId?: string | null,
) => {
  return useInfiniteQuery<
    CustomSectionProductsResponse,
    Error,
    InfiniteData<CustomSectionProductsResponse>,
    [string, number, string],
    number
  >({
    queryKey: [
      "custom-section-products-infinite",
      sectionId,
      userId ?? "guest",
    ],
    initialPageParam: 1,
    enabled: Boolean(Number.isFinite(sectionId) && sectionId > 0),
    queryFn: ({ pageParam = 1 }) =>
      getCustomSectionProducts({
        sectionId,
        page: pageParam,
        user_id: userId,
      }),
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;
      if (pagination?.has_more_pages) {
        return pagination.current_page + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useCustomCategorySections = (userId?: string | null) => {
  return useQuery({
    queryKey: ["custom-category-sections", userId ?? "guest"],
    queryFn: () =>
      getCustomCategorySections(userId ? { user_id: userId } : undefined),
  });
};

export const useCustomProductSections = (userId?: string | null) => {
  return useQuery({
    queryKey: ["custom-product-sections", userId ?? "guest"],
    queryFn: () =>
      getCustomProductSections(userId ? { user_id: userId } : undefined),
  });
};

export const useCustomSections = (userId?: string | null) => {
  return useQuery({
    queryKey: ["custom-sections", userId ?? "guest"],
    queryFn: () =>
      getCustomSections(userId ? { user_id: userId } : undefined),
  });
};

