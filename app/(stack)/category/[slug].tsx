// app/(stack)/category/[slug].tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, StatusBar, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useSharedValue } from "react-native-reanimated";
import { useTheme } from "../../../src/theme";
import AppNavbar from "../../../src/components/comman/AppNavbar";
import { useCategory } from "../../../src/hooks/homeHooks";
import { CategoryItem } from "../../../src/types/home.types";
import CategoryRightPanel, {
  ViewMode,
} from "../../../src/components/CategoryDetails/CategoryRightPanel";
import CategorySidebar from "../../../src/components/CategoryDetails/CategorySidebar";
import AddToCartPreview from "../../../src/components/cart/AddToCartPreview";

const CategoryDetails = () => {
  const { slug, name, image, selectedSubCategoryId } = useLocalSearchParams();

  const mainCategoryId = Number(slug);
  const initialSelectedSubCategoryId = Number(selectedSubCategoryId);
  const { colors } = useTheme();
  const { categories, loading: catLoading } = useCategory(mainCategoryId);
  const hasAppliedInitialSelectionRef = useRef(false);
  const [productCount, setProductCount] = useState(0);
  const cartPreviewVisible = useSharedValue(1);

  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

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
    if (categoriesWithAll.length === 0) return;

    if (
      !hasAppliedInitialSelectionRef.current &&
      initialSelectedSubCategoryId &&
      categories.length > 0
    ) {
      const matchedSubCategory = categories.find(
        (item) => item.id === initialSelectedSubCategoryId,
      );

      hasAppliedInitialSelectionRef.current = true;

      if (matchedSubCategory) {
        setSelectedCategory(matchedSubCategory);
        return;
      }
    }

    if (selectedCategory === null) {
      setSelectedCategory(categoriesWithAll[0]);
    }
  }, [
    categories,
    categoriesWithAll,
    initialSelectedSubCategoryId,
    selectedCategory,
  ]);

  const hasSidebar = categories.length > 0;
  const hasSubcategories = hasSidebar;
  const resolvedViewMode: ViewMode = hasSubcategories ? "list" : viewMode;

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
        <StatusBar
            barStyle="dark-content"
            backgroundColor="transparent"
            translucent
          />

      <AppNavbar title={String(name)} showBack  count={productCount} />

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
          viewMode={resolvedViewMode}
          onToggleView={toggleViewMode}
          hasSidebar={hasSidebar}
          hasSubcategories={hasSubcategories}
          mainCategoryId={mainCategoryId}
          cartPreviewVisible={cartPreviewVisible}
           onCountChange={setProductCount}
        />
      </View>

      <AddToCartPreview pbandroid={12} pbios={30} />
    </SafeAreaView>
  );
};

export default CategoryDetails;

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1, flexDirection: "row" },
});
