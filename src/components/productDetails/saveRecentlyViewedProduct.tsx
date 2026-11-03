import { StyleSheet, View } from "react-native";
import React, { useEffect } from "react";
import { useAppVisitorStore } from "../../store/auth";
import { useSaveRecentlyViewed } from "../../hooks/productDetailsHook";

interface Props {
  productId: number;
}

const SaveRecentlyViewedProduct = ({ productId }: Props) => {
  const { visitorId, userId } = useAppVisitorStore((state) => state);

  const { saveRecentlyViewed, data } = useSaveRecentlyViewed();

  useEffect(() => {
    if (!productId) return;

    saveRecentlyViewed({
      product_id: productId,
      user_id: userId ? String(userId) : "", 
      visitor_id: visitorId ?? "",
    });
  }, [productId, visitorId, userId]);




  return <View />; 
};

export default SaveRecentlyViewedProduct;

const styles = StyleSheet.create({});