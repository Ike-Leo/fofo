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

// --- Product Endpoints ---

// GET /api/store/:orgSlug/products
// GET /api/store/:orgSlug/products/:id
// GET /api/store/:orgSlug/cart
http.route({
    pathPrefix: "/api/store/",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
        const url = new URL(request.url);
        const pathParts = url.pathname.split("/");
        // pathParts format: ["", "api", "store", ":orgSlug", ":resource", ":resourceId"?]

        const orgSlug = pathParts[3];
        const resource = pathParts[4];
        const resourceId = pathParts[5];

        if (!orgSlug) return errorResponse("Missing Organization Slug", 400);

        // 1. Products List
        if (resource === "products" && !resourceId) {
            const products = await ctx.runQuery(api.public.products.list, { orgSlug });
            return jsonResponse(products);
        }

        // 2. Product Detail
        if (resource === "products" && resourceId) {
            const product = await ctx.runQuery(api.public.products.get, { orgSlug, productSlug: resourceId });
            if (!product) return errorResponse("Product not found", 404);
            return jsonResponse(product);
        }

        // 3. Get Cart
        if (resource === "cart" && !resourceId) {
            const urlParams = url.searchParams;
            const sessionId = urlParams.get("sessionId");
            if (!sessionId) return errorResponse("Missing sessionId", 400);

            const cart = await ctx.runQuery(api.public.cart.get, {
                orgId: undefined,
                sessionId
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
