import { useQuery } from "@tanstack/react-query";
import { CustomSectionProductsRequest } from "../types/customSection.types";
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

