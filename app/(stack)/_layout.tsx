import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="address" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="search" />
      <Stack.Screen name="userprofile" />

      {/* 👇 FIXED CONFIG */}
      <Stack.Screen
        name="categories"
        options={{
          presentation: "transparentModal",
          animation: "slide_from_right", // required fallback
          gestureDirection: "horizontal",
        }}
      />
    </Stack>
  );
}
