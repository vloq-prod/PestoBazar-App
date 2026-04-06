// components/ProductCard/index.tsx

import React, { memo } from "react";
import ListCard from "./ListCard";
import GridCard from "./GridCard";
import { ListingItem } from "../../../types/shop.types";


interface Props {
  item: ListingItem;
  mode?: "grid" | "list";
  onPress?: (item: ListingItem) => void;
  onAddToCart?: (item: ListingItem) => void;
}

const ProductCard: React.FC<Props> = ({
  mode = "grid",
  item,
  onPress,
  onAddToCart,
}) => {
  if (mode === "list") {
    return (
      <ListCard
        item={item}
        onPress={onPress}
        onAddToCart={onAddToCart}
      />
    );
  }

  return (
    <GridCard
      item={item}
      onPress={onPress}
      onAddToCart={onAddToCart}
    />
  );
};

export default memo(ProductCard);