import { apiClient } from "../lib/apiClient";
import {
  CustomSectionProductsRequest,
  CustomSectionProductsResponse,
  GetCustomSectionsResponse,
  GetCustomCategorySectionsResponse,
  GetCustomProductSectionsResponse,
} from "../types/customSection.types";

export const getCustomSectionProducts = async ({
  sectionId,
  page = 1,
  user_id,
}: CustomSectionProductsRequest & { user_id?: string | null }) => {
  const { data } =
    await apiClient.get<CustomSectionProductsResponse>(
      `/app-api/v1/custom-sections/${sectionId}/products?page=${page}`,
      {
        params: user_id ? { user_id } : undefined,
      },
    );

  return data;
};

// 1) Get Custom Category Sections
export const getCustomCategorySections = async (params?: { user_id?: string | null }) => {
  const { data } = await apiClient.get<GetCustomCategorySectionsResponse>(
    "/app-api/v1/get-custom-category-sections",
    {
      params: params?.user_id ? { user_id: params.user_id } : undefined,
    },
  );

  return data;
};

// 2) Get Custom Product Sections
export const getCustomProductSections = async (params?: { user_id?: string | null }) => {
  const { data } = await apiClient.get<GetCustomProductSectionsResponse>(
    "/app-api/v1/get-custom-product-sections",
    {
      params: params?.user_id ? { user_id: params.user_id } : undefined,
    },
  );

  return data;
};

// Legacy alias for backwards compatibility
export const getCustomSections = async (params?: { user_id?: string | null }) => {
  return getCustomProductSections(params);
};
