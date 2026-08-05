import { apiClient } from "../lib/apiClient";
import { CustomSectionProductsRequest, CustomSectionProductsResponse, GetCustomSectionsResponse } from "../types/customSection.types";



export const getCustomSectionProducts = async ({
  sectionId,
  page = 1,
}: CustomSectionProductsRequest) => {
  const { data } =
    await apiClient.get<CustomSectionProductsResponse>(
      `/app-api/v1/custom-sections/${sectionId}/products?page=${page}`,
    );

  return data;
};



export const getCustomSections = async () => {
  const { data } = await apiClient.get<GetCustomSectionsResponse>(
    "/app-api/v1/get-custom-section",
  );

  return data;
};