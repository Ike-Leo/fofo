import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { api } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

auth.addHttpRoutes(http);

// --- API Helpers ---
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Helper for JSON responses
function jsonResponse(data: any, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
        },
    });
}

// Helper for Error responses
function errorResponse(message: string, status = 400) {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
        },
    });
}

// GET /api/store/:orgSlug/products (with pagination & filters)
// GET /api/store/:orgSlug/products/search?q=<query>&limit=<n>
// GET /api/store/:orgSlug/products/:productSlug
// GET /api/store/:orgSlug/products/:productSlug/related
// GET /api/store/:orgSlug/categories
// GET /api/store/:orgSlug/categories/:categorySlug
// GET /api/store/:orgSlug/categories/:categorySlug/products
// GET /api/store/:orgSlug/orders/:orderNumber?email=<email>
// GET /api/store/:orgSlug/cart
http.route({
    pathPrefix: "/api/store/",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
        const url = new URL(request.url);
        const pathParts = url.pathname.split("/");
        // pathParts format: ["", "api", "store", ":orgSlug", ":resource", ":resourceId"?, ":subResource"?]

        const orgSlug = pathParts[3];
        const resource = pathParts[4];
        const resourceId = pathParts[5];
        const subResource = pathParts[6];

        if (!orgSlug) return errorResponse("Missing Organization Slug", 400);

        // --- PRODUCTS ---

        // 1. Product Search: GET /api/store/:orgSlug/products/search?q=<query>
        if (resource === "products" && resourceId === "search") {
            const query = url.searchParams.get("q") || "";
            const limit = parseInt(url.searchParams.get("limit") || "20", 10);

            const products = await ctx.runQuery(api.public.products.search, {
                orgSlug,
                query,
                limit,
            });
            return jsonResponse(products);
        }

        // 2. Related Products: GET /api/store/:orgSlug/products/:productSlug/related
        if (resource === "products" && resourceId && subResource === "related") {
            const limit = parseInt(url.searchParams.get("limit") || "4", 10);

            const relatedProducts = await ctx.runQuery(api.public.products.getRelated, {
                orgSlug,
                productSlug: resourceId,
                limit,
            });
            return jsonResponse(relatedProducts);
        }

        // 3. Product Detail: GET /api/store/:orgSlug/products/:productSlug
        if (resource === "products" && resourceId) {
            const product = await ctx.runQuery(api.public.products.get, {
                orgSlug,
                productSlug: resourceId,
            });
            if (!product) return errorResponse("Product not found", 404);
            return jsonResponse(product);
        }

        // 4. Products List (with pagination & filters): GET /api/store/:orgSlug/products
        if (resource === "products" && !resourceId) {
            const limit = parseInt(url.searchParams.get("limit") || "20", 10);
            const cursor = url.searchParams.get("cursor") || undefined;
            const minPrice = url.searchParams.get("minPrice")
                ? parseInt(url.searchParams.get("minPrice")!, 10)
                : undefined;
            const maxPrice = url.searchParams.get("maxPrice")
                ? parseInt(url.searchParams.get("maxPrice")!, 10)
                : undefined;
            const inStockOnly = url.searchParams.get("inStockOnly") === "true";

            const result = await ctx.runQuery(api.public.products.list, {
                orgSlug,
                limit,
                cursor,
                minPrice,
                maxPrice,
                inStockOnly: inStockOnly || undefined,
            });
            return jsonResponse(result);
        }

        // --- CATEGORIES ---

        // 5. Category Products: GET /api/store/:orgSlug/categories/:categorySlug/products
        if (resource === "categories" && resourceId && subResource === "products") {
            const limit = parseInt(url.searchParams.get("limit") || "20", 10);

            const products = await ctx.runQuery(api.public.products.listByCategory, {
                orgSlug,
                categorySlug: resourceId,
                limit,
            });
            return jsonResponse(products);
        }

        // 6. Category Detail: GET /api/store/:orgSlug/categories/:categorySlug
        if (resource === "categories" && resourceId) {
            const category = await ctx.runQuery(api.public.categories.get, {
                orgSlug,
                categorySlug: resourceId,
            });
            if (!category) return errorResponse("Category not found", 404);
            return jsonResponse(category);
        }

        // 7. Categories List: GET /api/store/:orgSlug/categories
        if (resource === "categories" && !resourceId) {
            const categories = await ctx.runQuery(api.public.categories.list, {
                orgSlug,
            });
            return jsonResponse(categories);
        }

        // --- ORDERS ---

        // 8. Order Status: GET /api/store/:orgSlug/orders/:orderNumber?email=<email>
        if (resource === "orders" && resourceId) {
            const email = url.searchParams.get("email");
            if (!email) return errorResponse("Missing email parameter", 400);

            const orderStatus = await ctx.runQuery(api.public.orders.getStatus, {
                orgSlug,
                orderNumber: resourceId,
                email,
            });
            if (!orderStatus) return errorResponse("Order not found", 404);
            return jsonResponse(orderStatus);
        }

        // --- CART ---

        // 9. Get Cart: GET /api/store/:orgSlug/cart?sessionId=<sessionId>
        if (resource === "cart" && !resourceId) {
            const sessionId = url.searchParams.get("sessionId");
            if (!sessionId) return errorResponse("Missing sessionId", 400);

            const cart = await ctx.runQuery(api.public.cart.get, {
                orgId: undefined,
                sessionId,
            });
            return jsonResponse(cart || { items: [], totalAmount: 0 });
        }

        return errorResponse("Endpoint not found", 404);
    }),
});

// POST /api/store/:orgSlug/cart/items or /api/store/:orgSlug/checkout
http.route({
    pathPrefix: "/api/store/",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const url = new URL(request.url);
        const pathParts = url.pathname.split("/");
        const orgSlug = pathParts[3];
        const resource = pathParts[4]; // "cart" or "checkout"
        const subResource = pathParts[5]; // "items" or "checkout"?

        if (!orgSlug) return errorResponse("Missing Organization Slug", 400);

        // Parse Body
        let body;
        try {
            body = await request.json();
        } catch (e) {
            return errorResponse("Invalid JSON body", 400);
        }

        // Resolve Org ID (Cached lookup ideally, but here distinct query)
        const org = await ctx.runQuery(api.public.organizations.getBySlug, { slug: orgSlug });
        if (!org) return errorResponse("Organization not found", 404);

        // 1. Add Item: POST /api/store/:orgSlug/cart/items
        if (resource === "cart" && subResource === "items") {
            const { sessionId, productId, variantId, quantity } = body;
            if (!sessionId || !productId || !variantId || !quantity) {
                return errorResponse("Missing required fields", 400);
            }

            try {
                await ctx.runMutation(api.public.cart.addItem, {
                    orgId: org._id,
                    sessionId,
                    productId,
                    variantId,
                    quantity
                });
                return jsonResponse({ success: true });
            } catch (e: any) {
                return errorResponse(e.message || "Failed to add item", 500);
            }
        }

        // 2. Checkout: POST /api/store/:orgSlug/checkout
        if (resource === "checkout") {
            const { cartId, customerInfo } = body;
            try {
                const orderId = await ctx.runMutation(api.public.cart.checkout, {
                    cartId,
                    customerInfo
                });
                return jsonResponse({ success: true, orderId });
            } catch (e: any) {
                return errorResponse(e.message, 500);
            }
        }

        return errorResponse("Endpoint not found", 404);
    }),
});

// PATCH /api/store/:orgSlug/cart/items/:itemId
http.route({
    pathPrefix: "/api/store/",
    method: "PATCH",
    handler: httpAction(async (ctx, request) => {
        const url = new URL(request.url);
        const pathParts = url.pathname.split("/");
        const resource = pathParts[4];
        const subResource = pathParts[5];
        const itemId = pathParts[6];

        if (resource === "cart" && subResource === "items" && itemId) {
            let body;
            try {
                body = await request.json();
            } catch (e) {
                return errorResponse("Invalid JSON body", 400);
            }
            const { quantity, cartId } = body;

            try {
                await ctx.runMutation(api.public.cart.updateQuantity, {
                    cartId: cartId as any,
                    variantId: itemId as any,
                    quantity
                });
                return jsonResponse({ success: true });
            } catch (e: any) {
                return errorResponse(e.message, 500);
            }
        }
        return errorResponse("Endpoint not found", 404);
    })
});

// DELETE /api/store/:orgSlug/cart/items/:itemId
http.route({
    pathPrefix: "/api/store/",
    method: "DELETE",
    handler: httpAction(async (ctx, request) => {
        const url = new URL(request.url);
        const pathParts = url.pathname.split("/");
        const resource = pathParts[4];
        const subResource = pathParts[5];
        const itemId = pathParts[6];

        if (resource === "cart" && subResource === "items" && itemId) {
            const urlParams = url.searchParams;
            const cartId = urlParams.get("cartId");

            if (!cartId) return errorResponse("Missing cartId param", 400);

            try {
                await ctx.runMutation(api.public.cart.removeItem, {
                    cartId: cartId as any,
                    variantId: itemId as any
                });
                return jsonResponse({ success: true });
            } catch (e: any) {
                return errorResponse(e.message, 500);
            }
        }
        return errorResponse("Endpoint not found", 404);
    })
});

// OPTIONS Handler for CORS Pre-flight
http.route({
    pathPrefix: "/api/",
    method: "OPTIONS",
    handler: httpAction(async (_, __) => {
        return new Response(null, {
            status: 204,
            headers: corsHeaders,
        });
    }),
});

export default http;
