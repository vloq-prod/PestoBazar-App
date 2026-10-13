import { useQuery } from "@tanstack/react-query";
import { CustomSectionProductsRequest } from "../types/customSection.types";
import {
  getCustomCategorySections,
  getCustomSectionProducts,
  getCustomSections,
} from "../api/customSection.api";

export const useCustomSectionProducts = (
  payload: CustomSectionProductsRequest,
) => {
  return useQuery({
    queryKey: ["custom-section-products", payload.sectionId, payload.page],
    queryFn: () => getCustomSectionProducts(payload),
    enabled: !!payload.sectionId,
  });
};

export const useCustomSections = () => {
  return useQuery({
    queryKey: ["custom-sections"],
    queryFn: getCustomSections,
  });
};

export const useCustomCategorySections = () => {
  return useQuery({
    queryKey: ["custom-category-sections"],
    queryFn: getCustomCategorySections,
  });
};
