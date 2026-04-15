import { StyleSheet, View } from "react-native";
import React, { useEffect } from "react";
import { useAppVisitorStore } from "../../store/auth";
import { useSaveRecentlyViewed } from "../../hooks/productDetailsHook";

interface Props {
  productId: number;
}

const SaveRecentlyViewedProduct = ({ productId }: Props) => {
  const visitorId = useAppVisitorStore((state) => state.visitorId);

  const { saveRecentlyViewed, data } = useSaveRecentlyViewed();

  useEffect(() => {
    if (!productId) return;

    saveRecentlyViewed({
      product_id: productId,
      user_id: "", // ya 0 (as per API)
      visitor_id: visitorId ?? "",
    });
  }, [productId, visitorId]);


  // console.log("recetly view data: ",data )

  return <View />; // 👈 kuch show nahi karna
};

export default SaveRecentlyViewedProduct;

const styles = StyleSheet.create({});