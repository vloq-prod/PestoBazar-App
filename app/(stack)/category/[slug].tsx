// app/(stack)/category/[slug].tsx
import React, { useState, useEffect, useCallback } from "react";
import { View, StatusBar, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useTheme } from "../../../src/theme";
import AppNavbar from "../../../src/components/comman/AppNavbar";
import { useCategory } from "../../../src/hooks/homeHooks";
import { CategoryItem } from "../../../src/types/home.types";
import CategoryRightPanel, {
  ViewMode,
} from "../../../src/components/CategoryDetails/CategoryRightPanel";
import CategorySidebar from "../../../src/components/CategoryDetails/CategorySidebar";

const CategoryDetails = () => {
  const { slug, name, image } = useLocalSearchParams();

  const mainCategoryId = Number(slug);
  const { colors } = useTheme();
  const { categories, loading: catLoading } = useCategory(mainCategoryId);

  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const categoriesWithAll: CategoryItem[] = React.useMemo(() => {
    if (!categories || categories.length === 0) return [];

    const allItem: CategoryItem = {
      id: 0,
      slug: "all",
      category_name: "All",
      s3_image_path: String(image), 
    };

    return [allItem, ...categories];
  }, [categories, image]);


  useEffect(() => {
    if (categoriesWithAll.length > 0 && selectedCategory === null) {
      setSelectedCategory(categoriesWithAll[0]); // Always "All"
    }
  }, [categoriesWithAll, selectedCategory]);


  const hasSidebar = categories.length > 0;

  const categoryId = React.useMemo(() => {
    if (!hasSidebar) return String(mainCategoryId);

    if (!selectedCategory || selectedCategory.id === 0) {
      return String(mainCategoryId);
    }

    return String(selectedCategory.id); 
  }, [selectedCategory, hasSidebar, mainCategoryId]);

  const handleSelect = useCallback((item: CategoryItem) => {
    setSelectedCategory(item);
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === "grid" ? "list" : "grid"));
  }, []);

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <AppNavbar title={String(name)} showBack showSearch />

      <View style={styles.body}>
        {/* ✅ Sidebar */}
        {hasSidebar && (
          <CategorySidebar
            categories={categoriesWithAll}
            loading={catLoading}
            selectedSlug={selectedCategory?.slug?.toString() ?? null}
            onSelect={handleSelect}
          />
        )}

        {/* ✅ Right Panel */}
        <CategoryRightPanel
          selectedCategory={selectedCategory}
          categoryId={categoryId}
          viewMode={hasSidebar ? viewMode : "grid"}
          onToggleView={toggleViewMode}
          hasSidebar={hasSidebar}
          mainCategoryId={mainCategoryId}
        />
      </View>
    </SafeAreaView>
  );
};

export default CategoryDetails;

const styles = StyleSheet.create({
  root: { flex: 1 ,},
  body: { flex: 1, flexDirection: "row",},
});
