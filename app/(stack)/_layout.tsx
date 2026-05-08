import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: true,
        gestureDirection: "horizontal",
        fullScreenGestureEnabled: true, // ✅ Important for Android swipe gesture
      }}
    >
      <Stack.Screen name="address" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="search" />
      <Stack.Screen name="userprofile" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="addaddress" />
      <Stack.Screen name="bulkorder" />
      <Stack.Screen name="map" />
      <Stack.Screen name="nointernet" />
      <Stack.Screen name="order" />
      <Stack.Screen name="ordersuccess" />

      <Stack.Screen
        name="categories"
        options={{
          presentation: "transparentModal",
          animation: "slide_from_right",
          gestureDirection: "horizontal",
        }}
      />
    </Stack>
  );
}
