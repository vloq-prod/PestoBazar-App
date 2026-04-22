// components/ProductCard/index.tsx

import React, { memo } from "react";
import ListCard from "./ListCard";
import GridCard from "./GridCard";
import { ListingItem } from "../../types/shop.types";


interface Props {
  item: ListingItem;
  mode?: "grid" | "list";
  onPress?: (item: ListingItem) => void;
onAddToCart?: (item: ListingItem, qty: number) => void;
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
        onAddToCart={onAddToCart}
      />
    );
  }

  return (
    <GridCard
      item={item}

      onAddToCart={onAddToCart}
    />
  );
};

export default memo(ProductCard);