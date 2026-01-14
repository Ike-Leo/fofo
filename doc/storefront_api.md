# Storefront HTTP API Documentation

This guide details the HTTP API endpoints available for building custom storefronts on top of the Commerce Platform. These endpoints allow developers to query products, manage shopping carts, and process checkout without strictly depending on the Convex WebSocket client, making it easier to integrate with standard REST-based workflows or alternative frontend frameworks.

## 🌐 Base URL

All endpoints are prefixed with the following base URL structure:

```
https://<YOUR_CONVEX_DEPLOYMENT_URL>.convex.cloud/api/store/<ORG_SLUG>
```

*   `YOUR_CONVEX_DEPLOYMENT_URL`: Your specific project instance (e.g., `fast-horse-123`).
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

#### List All Products
Retrieves a list of active products for the organization.

*   **GET** `/products`
*   **Response**: `200 OK`
    ```json
    [
      {
        "_id": "...",
        "name": "Classic T-Shirt",
        "slug": "classic-t-shirt",
        "price": 2500, // Cents
        "images": ["url1", "url2"],
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
      "name": "Classic T-Shirt",
      "description": "...",
      "price": 2500,
      "variants": [
        {
          "_id": "...",
          "name": "Small / Red",
          "stockQuantity": 10
        }
      ]
    }
    ```

---

### 2. Shopping Cart

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
          "productName": "Classic T-Shirt",
          "quantity": 2,
          "price": 2500,
          "total": 5000
        }
      ]
    }
    ```

#### Add Item to Cart
Adds a specific variant to the cart. If the item exists, quantities are merged (logic handled by backend).

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
    *Note: `cartId` is returned in the GET /cart response and is required here for security/validation context.*

#### Remove Item
Removes an item completely from the cart.

*   **DELETE** `/cart/items/<VARIANT_ID>?cartId=<CART_ID>`

---

### 3. Checkout

#### Process Checkout
Converts the cart into an Order. **Note**: In a real implementation, this would likely verify a Stripe Payment Intent first or be called via a Webhook. For this logical flow, it creates the order record.

*   **POST** `/checkout`
*   **Body**:
    ```json
    {
      "cartId": "cart_123",
      "customerInfo": {
        "name": "John Doe",
        "email": "john@example.com",
        "address": "123 Main St"
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
*   **Persist Cart State**: While the backend is the source of truth, keep a local lightweight representation of the cart count to show instant UI feedback (e.g., cart badge number) while the network request resolves.

### 2. Optimistic UI Updates
When a user clicks "Add to Cart":
1.  Immediately show a "Adding..." spinner or disable the button.
2.  Send the `POST /cart/items` request.
3.  On success, trigger a re-fetch of `GET /cart` to ensure your pricing and inventory data is perfectly synced with the server.

### 3. Handling Stock
The API validates stock logic on the server.
*   If `POST /cart/items` returns a `400` or `500` error, it likely means insufficient stock.
*   Display the error message returned in the `error` field to the user (e.g., "Insufficient stock. Only 2 available.").

### 4. Security
*   **SSL is Enforced**: All requests must be over HTTPS.
*   **Input Validation**: The backend validates IDs and Data Types.
*   **Payment Security**: This API does not handle raw credit card numbers. Use Stripe Elements (frontend) to tokenize cards, then pass the result/intent to the backend.

---

## 📝 Example Workflow (JavaScript)

```javascript
const STORE_API = "https://fast-horse-123.convex.cloud/api/store/nike";
const SESSION_ID = localStorage.getItem("sid") || generateId();

// 1. Fetch Products
const res = await fetch(`${STORE_API}/products`);
const products = await res.json();

// 2. Add to Cart
await fetch(`${STORE_API}/cart/items`, {
  method: "POST",
  body: JSON.stringify({
    sessionId: SESSION_ID,
    productId: products[0]._id,
    variantId: products[0].variants[0]._id,
    quantity: 1
  })
});

// 3. View Cart
const cartRes = await fetch(`${STORE_API}/cart?sessionId=${SESSION_ID}`);
const cart = await cartRes.json();
console.log("Cart Total:", cart.totalAmount);
```
