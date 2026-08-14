# Pestobazaar Push Notification & Deep Linking API Documentation

This document lists all the supported deep-linkable routes and their corresponding Firebase Cloud Messaging (FCM) JSON payload structures. Use this documentation to configure push notification campaigns from the Admin Panel or Backend Services.

---

## ─── General FCM Payload Rules ───

For notifications to render with images and trigger correct navigation in Javascript:

1. **Duplicate Dynamic Keys in `data`**: Firebase SDK does not expose `notification.image` to the Javascript layer. You **MUST** duplicate the image URL inside the `data` block.
2. **Channel ID**: Always specify `"channel_id": "pestobazaar_general"` under the Android notification settings to enable high priority and sound.
3. **APNs Settings**: For iOS rich notifications, ensure `"mutable-content": 1` is set.

---

## ─── Payload Templates for All Routes ───

### 1. Home

- **Action Type**: `home`
- **Description**: Navigates the user to the Main Home Tab.
- **Data payload**:

```json
"data": {
    "notification_id": "home_promo",
    "action_type": "home",
    "action_value": "0",
    "screen": "home"
}
```

---

### 2. Product Details

- **Action Type**: `product`
- **Description**: Opens a specific product page using its numeric ID.
- **Data payload**:

```json
"data": {
    "notification_id": "product_deal",
    "action_type": "product",
    "action_value": "12",
    "id": "12",
    "product_id": "12"
}
```

---

### 3. Category / Category Detail

- **Action Type**: `category` or `category_detail`
- **Description**: Navigates to a specific category page via slug or ID.
- **Data payload**:

```json
"data": {
    "notification_id": "category_promo",
    "action_type": "category",
    "action_value": "pest-control",
    "slug": "pest-control",
    "category_slug": "pest-control",
    "category_id": "1"
}
```

---

### 4. Cart

- **Action Type**: `cart`
- **Description**: Takes the user directly to the Cart page.
- **Data payload**:

```json
"data": {
    "notification_id": "cart_reminder",
    "action_type": "cart",
    "action_value": "0"
}
```

---

### 5. Order Details

- **Action Type**: `order_detail`
- **Description**: Opens the details screen for a specific Order ID.
- **Data payload**:

```json
"data": {
    "notification_id": "order_dispatch",
    "action_type": "order_detail",
    "action_value": "456",
    "id": "456",
    "order_id": "456"
}
```

---

### 6. Profile

- **Action Type**: `profile`
- **Description**: Takes the user to the Profile/Account settings tab.
- **Data payload**:

```json
"data": {
    "notification_id": "profile_update",
    "action_type": "profile",
    "action_value": "0"
}
```

---

### 7. Return Details

- **Action Type**: `return`
- **Description**: Opens status details for a specific return request ID.
- **Data payload**:

```json
"data": {
    "notification_id": "return_status",
    "action_type": "return",
    "action_value": "789",
    "id": "789",
    "return_id": "789"
}
```

---

### 8. Coupon

- **Action Type**: `coupon`
- **Description**: Navigates to the Available Coupons/Promo codes screen.
- **Data payload**:

```json
"data": {
    "notification_id": "coupons_page",
    "action_type": "coupon",
    "action_value": "0"
}
```

---

### 9. Deals

- **Action Type**: `deals`
- **Description**: Opens the Deals / Offers screen.
- **Data payload**:

```json
"data": {
    "notification_id": "deals_sale",
    "action_type": "deals",
    "action_value": "0"
}
```

---

### 10. External URL

- **Action Type**: `url`
- **Description**: Opens an external link in the device's native browser.
- **Data payload**:

```json
"data": {
    "notification_id": "blog_redirect",
    "action_type": "url",
    "action_value": "https://pestobazaar.com/blog/preventing-monsoon-pests",
    "slug": "https://pestobazaar.com/blog/preventing-monsoon-pests"
}
```

---

### 11. Wishlist

- **Action Type**: `whishlist`
- **Description**: Takes the user to their saved Wishlist items.
- **Data payload**:

```json
"data": {
    "notification_id": "wishlist_sale",
    "action_type": "whishlist",
    "action_value": "0"
}
```

---

### 12. Do It Yourself (DIY)

- **Action Type**: `do_if_yourself`
- **Description**: Opens the DIY Pest Control guides section.
- **Data payload**:

```json
"data": {
    "notification_id": "diy_guides",
    "action_type": "do_if_yourself",
    "action_value": "0"
}
```

---

### 13. Best Selling

- **Action Type**: `best_selling`
- **Description**: Opens a list of Best Selling items.
- **Data payload**:

```json
"data": {
    "notification_id": "best_selling_redirect",
    "action_type": "best_selling",
    "action_value": "best-selling"
}
```

---

### 14. New Arrival

- **Action Type**: `new_arrival`
- **Description**: Opens the New Arrival product feed.
- **Data payload**:

```json
"data": {
    "notification_id": "new_arrival_redirect",
    "action_type": "new_arrival",
    "action_value": "new-arrival"
}
```

---

### 15. Top Rated

- **Action Type**: `top_rated`
- **Description**: Opens highly rated products list.
- **Data payload**:

```json
"data": {
    "notification_id": "top_rated_redirect",
    "action_type": "top_rated",
    "action_value": "top-rated"
}
```

---

### 16. Trending

- **Action Type**: `trending`
- **Description**: Opens the trending products feed.
- **Data payload**:

```json
"data": {
    "notification_id": "trending_redirect",
    "action_type": "trending",
    "action_value": "trending"
}
```

---

### 17. Custom Section

- **Action Type**: `custom_section`
- **Description**: Navigates to a specific curated custom homepage section by its ID.
- **Data payload**:

```json
"data": {
    "notification_id": "custom_section_monsoon",
    "action_type": "custom_section",
    "action_value": "2",
    "id": "2",
    "custom_Section_id": "2"
}
```

---

### 18. Category Detail (Alternative)

- **Action Type**: `category_detail`
- **Description**: Opens the list of items for a specific category ID.
- **Data payload**:

```json
"data": {
    "notification_id": "category_detail_redirect",
    "action_type": "category_detail",
    "action_value": "3",
    "id": "3",
    "category_id": "3"
}
```
