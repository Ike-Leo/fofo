# Storefront HTTP API Documentation

This guide details the HTTP API endpoints available for building custom storefronts on top of the Commerce Platform. These endpoints allow developers to query products, manage shopping carts, and process checkout without strictly depending on the Convex WebSocket client, making it easier to integrate with standard REST-based workflows or alternative frontend frameworks.

## 🌐 Base URL

All endpoints are prefixed with the following base URL structure:

```
https://<YOUR_CONVEX_DEPLOYMENT_URL>.convex.cloud/api/store/<ORG_SLUG>
```

*   `YOUR_CONVEX_DEPLOYMENT_URL`: Your specific project instance (e.g., `acoustic-seahorse-440`).
*   `ORG_SLUG`: The unique identifier for the specific store/organization you are interacting with (e.g., `nike`, `my-coffee-shop`).

---

## 🔑 Concepts

### Session Management
This API is **public** and **session-based**. It does not require an Authorization header for storefront shoppers.
*   **Session ID**: The client is responsible for generating and maintaining a unique `sessionId` (e.g., a UUID or random string) in the browser's LocalStorage or Cookies.
*   **Context**: All cart operations are tied to this `sessionId`.

### CORS
The API supports Cross-Origin Resource Sharing (CORS) from any origin (`*`), allowing you to build storefronts hosted on any domain.

---

## 🛒 Endpoints

### 1. Products

#### List All Products (with Pagination & Filtering)
Retrieves a paginated list of active products for the organization.

*   **GET** `/products`
*   **Query Parameters**:
    | Param | Type | Default | Description |
    |-------|------|---------|-------------|
    | `limit` | number | 20 | Max products to return |
    | `cursor` | string | - | Cursor for pagination (product ID) |
    | `minPrice` | number | - | Minimum price filter (in cents) |
    | `maxPrice` | number | - | Maximum price filter (in cents) |
    | `inStockOnly` | boolean | false | Only return in-stock products |

*   **Response**: `200 OK`
    ```json
    {
      "products": [
        {
          "_id": "...",
          "name": "Classic T-Shirt",
          "slug": "classic-t-shirt",
          "price": 2500,
          "images": ["url1", "url2"],
          "inStock": true,
          "totalStock": 50,
          "variants": [...]
        }
      ],
      "nextCursor": "product_id_or_null",
      "hasMore": true
    }
    ```

#### Search Products
Search for products by name or description.

*   **GET** `/products/search`
*   **Query Parameters**:
    | Param | Type | Default | Description |
    |-------|------|---------|-------------|
    | `q` | string | required | Search query |
    | `limit` | number | 20 | Max results to return |

*   **Response**: `200 OK`
    ```json
    [
      {
        "_id": "...",
        "name": "Classic T-Shirt",
        "slug": "classic-t-shirt",
        "price": 2500,
        "images": ["url1"],
        "inStock": true,
        "variants": [...]
      }
    ]
    ```

#### Get Product Details
Retrieves detailed information for a specific product, including all variants.

*   **GET** `/products/<PRODUCT_SLUG>`
*   **Response**: `200 OK`
    ```json
    {
      "_id": "...",
      "orgId": "...",
      "name": "Classic T-Shirt",
      "description": "...",
      "price": 2500,
      "categoryName": "Apparel",
      "inStock": true,
      "totalStock": 50,
      "variants": [
        {
          "_id": "...",
          "name": "Small / Red",
          "sku": "TSH-SM-RED",
          "price": 2500,
          "stockQuantity": 10,
          "options": { "size": "Small", "color": "Red" },
          "isDefault": false
        }
      ]
    }
    ```

#### Get Related Products
Retrieves products similar to a given product (same category, or random if no category).

*   **GET** `/products/<PRODUCT_SLUG>/related`
*   **Query Parameters**:
    | Param | Type | Default | Description |
    |-------|------|---------|-------------|
    | `limit` | number | 4 | Max related products |

*   **Response**: `200 OK`
    ```json
    [
      {
        "_id": "...",
        "name": "Premium T-Shirt",
        "slug": "premium-t-shirt",
        "price": 3500,
        "images": ["url1"],
        "inStock": true,
        "variants": [...]
      }
    ]
    ```

---

### 2. Categories

#### List All Categories
Retrieves all categories for storefront navigation.

*   **GET** `/categories`
*   **Response**: `200 OK`
    ```json
    [
      {
        "_id": "...",
        "name": "Apparel",
        "slug": "apparel",
        "parentId": null,
        "position": 1
      },
      {
        "_id": "...",
        "name": "T-Shirts",
        "slug": "t-shirts",
        "parentId": "parent_category_id",
        "position": 1
      }
    ]
    ```

#### Get Category Details
Retrieves details for a specific category including product count.

*   **GET** `/categories/<CATEGORY_SLUG>`
*   **Response**: `200 OK`
    ```json
    {
      "_id": "...",
      "name": "Apparel",
      "slug": "apparel",
      "parentId": null,
      "position": 1,
      "productCount": 15
    }
    ```

#### List Products by Category
Retrieves products belonging to a specific category.

*   **GET** `/categories/<CATEGORY_SLUG>/products`
*   **Query Parameters**:
    | Param | Type | Default | Description |
    |-------|------|---------|-------------|
    | `limit` | number | 20 | Max products to return |

*   **Response**: `200 OK`
    ```json
    [
      {
        "_id": "...",
        "name": "Classic T-Shirt",
        "slug": "classic-t-shirt",
        "price": 2500,
        "inStock": true,
        "variants": [...]
      }
    ]
    ```

---

### 3. Shopping Cart

#### Get Cart
Retrieves the current state of the cart for a given session.

*   **GET** `/cart?sessionId=<SESSION_ID>`
*   **Response**: `200 OK`
    ```json
    {
      "_id": "cart_123",
      "totalAmount": 5000,
      "totalItems": 2,
      "items": [
        {
          "_id": "item_abc",
          "productId": "...",
          "variantId": "...",
          "name": "Classic T-Shirt - Small / Red",
          "image": "url",
          "price": 2500,
          "quantity": 2,
          "maxStock": 10,
          "total": 5000
        }
      ]
    }
    ```

#### Add Item to Cart
Adds a specific variant to the cart. If the item exists, quantities are merged.

*   **POST** `/cart/items`
*   **Body**:
    ```json
    {
      "sessionId": "user_session_abc",
      "productId": "product_123",
      "variantId": "variant_456",
      "quantity": 1
    }
    ```
*   **Response**: `200 OK` `{ "success": true }`

#### Update Item Quantity
Updates the quantity of an existing item in the cart.

*   **PATCH** `/cart/items/<VARIANT_ID>`
*   **Body**:
    ```json
    {
      "cartId": "cart_123", 
      "quantity": 3
    }
    ```
*   **Response**: `200 OK` `{ "success": true }`

#### Remove Item
Removes an item completely from the cart.

*   **DELETE** `/cart/items/<VARIANT_ID>?cartId=<CART_ID>`
*   **Response**: `200 OK` `{ "success": true }`

---

### 4. Orders

#### Get Order Status
Look up order status using order number and email (for customer verification).

*   **GET** `/orders/<ORDER_NUMBER>?email=<EMAIL>`
*   **Response**: `200 OK`
    ```json
    {
      "orderNumber": "ORD-2026-001",
      "status": "processing",
      "paymentStatus": "paid",
      "totalAmount": 5000,
      "createdAt": 1736934567890,
      "updatedAt": 1736935000000,
      "items": [
        {
          "productName": "Classic T-Shirt",
          "variantName": "Small / Red",
          "quantity": 2,
          "price": 2500
        }
      ]
    }
    ```
*   **Response**: `404 Not Found` if order not found or email doesn't match

---

### 5. Checkout

#### Process Checkout
Converts the cart into an Order.

*   **POST** `/checkout`
*   **Body**:
    ```json
    {
      "cartId": "cart_123",
      "customerInfo": {
        "name": "John Doe",
        "email": "john@example.com",
        "address": "123 Main St",
        "phone": "+1234567890"
      }
    }
    ```
*   **Response**: `200 OK`
    ```json
    {
      "success": true,
      "orderId": "order_789"
    }
    ```

---

## ⚡ Effective Usage Patterns

### 1. Client-Side Hydration
*   **Generate Session ID Early**: On the very first load of your storefront, check for a `sessionId` in `localStorage`. If missing, generate one `Math.random().toString(36)...` and save it. Use this for all subsequent calls.
*   **Persist Cart State**: While the backend is the source of truth, keep a local lightweight representation of the cart count to show instant UI feedback.

### 2. Pagination Pattern
```javascript
// First page
const firstPage = await fetch(`${STORE_API}/products?limit=20`);
const data = await firstPage.json();

// Next page (if hasMore is true)
if (data.hasMore) {
  const nextPage = await fetch(`${STORE_API}/products?limit=20&cursor=${data.nextCursor}`);
}
```

### 3. Search Implementation
```javascript
const searchResults = await fetch(`${STORE_API}/products/search?q=shirt&limit=10`);
const products = await searchResults.json();
```

### 4. Category Navigation
```javascript
// Get all categories for nav menu
const categories = await fetch(`${STORE_API}/categories`);

// Get products in a category
const categoryProducts = await fetch(`${STORE_API}/categories/apparel/products`);
```

### 5. Order Tracking
```javascript
// Customer order lookup (requires email verification)
const order = await fetch(`${STORE_API}/orders/ORD-2026-001?email=john@example.com`);
if (order.ok) {
  const status = await order.json();
  console.log(`Order Status: ${status.status}`);
}
```

### 6. Security
*   **SSL is Enforced**: All requests must be over HTTPS.
*   **Input Validation**: The backend validates IDs and Data Types.
*   **Email Verification**: Order status requires matching email for security.
*   **Payment Security**: This API does not handle raw credit card numbers. Use Stripe Elements.

---

## 📝 Full Example Workflow (JavaScript)

```javascript
const STORE_API = "https://acoustic-seahorse-440.convex.cloud/api/store/nike";
const SESSION_ID = localStorage.getItem("sid") || generateId();

// 1. Fetch Products with pagination
const res = await fetch(`${STORE_API}/products?limit=12&inStockOnly=true`);
const { products, nextCursor, hasMore } = await res.json();

// 2. Search for products
const searchRes = await fetch(`${STORE_API}/products/search?q=shirt`);
const searchResults = await searchRes.json();

// 3. Get categories for navigation
const catRes = await fetch(`${STORE_API}/categories`);
const categories = await catRes.json();

// 4. Get products in a category
const catProducts = await fetch(`${STORE_API}/categories/apparel/products`);

// 5. Get related products
const relatedRes = await fetch(`${STORE_API}/products/classic-t-shirt/related?limit=4`);
const relatedProducts = await relatedRes.json();

// 6. Add to Cart
await fetch(`${STORE_API}/cart/items`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    sessionId: SESSION_ID,
    productId: products[0]._id,
    variantId: products[0].variants[0]._id,
    quantity: 1
  })
});

// 7. View Cart
const cartRes = await fetch(`${STORE_API}/cart?sessionId=${SESSION_ID}`);
const cart = await cartRes.json();
console.log("Cart Total:", cart.totalAmount);

// 8. Checkout
const checkoutRes = await fetch(`${STORE_API}/checkout`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    cartId: cart._id,
    customerInfo: {
      name: "John Doe",
      email: "john@example.com",
      address: "123 Main St"
    }
  })
});
const { orderId } = await checkoutRes.json();

// 9. Check Order Status
const orderRes = await fetch(`${STORE_API}/orders/${orderId}?email=john@example.com`);
const orderStatus = await orderRes.json();
console.log("Order Status:", orderStatus.status);
```

---

## 📊 Error Responses

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

| Status Code | Meaning |
|-------------|---------|
| `400` | Bad Request (missing required params) |
| `404` | Not Found (resource doesn't exist) |
| `500` | Server Error (processing failure) |

---

**End of API Documentation**
