# ItemActionButtons Component

## Overview

`ItemActionButtons` is a client-side React component that renders different sets of action buttons based on an item's status. It handles cart operations, wishlist management, downloads, and item management (edit/delete).

## Props

| Prop                 | Type       | Required | Description                                                     |
| -------------------- | ---------- | -------- | --------------------------------------------------------------- |
| item                 | `Item`     | Yes      | The item object containing details like id, status, price, etc. |
| onAddToCart          | `function` | Yes      | Callback function when adding item to cart                      |
| onRemoveFromCart     | `function` | Yes      | Callback function when removing item from cart                  |
| onAddToWishlist      | `function` | No       | Callback function when adding item to wishlist                  |
| onRemoveFromWishlist | `function` | No       | Callback function when removing item from wishlist              |
| onDownload           | `function` | No       | Callback function when downloading an item                      |
| onEdit               | `function` | No       | Callback function when editing an item                          |
| onDelete             | `function` | No       | Callback function when deleting an item                         |
| disabled             | `boolean`  | No       | Disables all buttons when true                                  |

## Usage

//
<ItemActionButtons
item={item}
onAddToCart={() => handleAddToCart(item)
onRemoveFromCart={() => handleRemoveFromCart(item)}
onAddToWishlist={() => handleAddToWishlist(item)}
onRemoveFromWishlist={() => handleRemoveFromWishlist(item)}
/>

## Button States

The component displays different button combinations based on the item's status:

- **Available Items:**
  - Add to Cart
  - Add to Wishlist
- **Items in Cart:**

  - Remove from Cart
  - Add to Wishlist

- **Items in Wishlist:**

  - Add to Cart
  - Remove from Wishlist

- **Purchased Items:**

  - Download
  - Add to Wishlist

- **Owner/Admin Items:**
  - Edit
  - Delete

## Notes

- The component automatically handles button states based on the item's current status
- All buttons can be disabled using the `disabled` prop
- Edit and Delete buttons only appear for users with appropriate permissions
- Download buttons only appear for purchased digital items
