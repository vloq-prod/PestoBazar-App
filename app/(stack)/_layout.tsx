import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="address" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="search" />
      <Stack.Screen name="userprofile" />

      
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
