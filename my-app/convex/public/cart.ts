import { v } from "convex/values";
import { mutation, query, internalQuery } from "../_generated/server";
import { createOrderImpl } from "../helpers/orders";

/**
 * Add an item to the cart
 * Creates a cart if one doesn't exist for the session
 */
export const addItem = mutation({
    args: {
        orgId: v.id("organizations"),
        sessionId: v.string(),
        productId: v.id("products"),
        variantId: v.id("productVariants"),
        quantity: v.number(),
    },
    handler: async (ctx, args) => {
        // 1. Validate quantity
        if (args.quantity <= 0) throw new Error("Quantity must be positive");

        // 2. Validate Product & Variant exists and belongs to Org
        const product = await ctx.db.get(args.productId);
        const variant = await ctx.db.get(args.variantId);

        if (!product || !variant) throw new Error("Product or variant not found");
        if (product.orgId !== args.orgId) throw new Error("Product does not belong to this organization");
        if (variant.productId !== args.productId) throw new Error("Variant does not belong to this product");

        // 3. Find or Create Active Cart
        let cart = await ctx.db
            .query("carts")
            .withIndex("by_orgId_sessionId", (q) =>
                q.eq("orgId", args.orgId).eq("sessionId", args.sessionId)
            )
            .filter((q) => q.eq(q.field("status"), "active"))
            .first();

        if (!cart) {
            const cartId = await ctx.db.insert("carts", {
                orgId: args.orgId,
                sessionId: args.sessionId,
                status: "active",
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });
            cart = await ctx.db.get(cartId);
        }

        if (!cart) throw new Error("Failed to create cart");

        // 4. Check if item already in cart
        const existingItem = await ctx.db
            .query("cartItems")
            .withIndex("by_cartId_variantId", (q) =>
                q.eq("cartId", cart._id).eq("variantId", args.variantId)
            )
            .first();

        const currentQtyInCart = existingItem ? existingItem.quantity : 0;
        const newTotalQty = currentQtyInCart + args.quantity;

        // 5. Validate Stock
        if (variant.stockQuantity < newTotalQty) {
            throw new Error(`Insufficient stock. Only ${variant.stockQuantity} available.`);
        }

        // 6. Update or Insert Item
        if (existingItem) {
            await ctx.db.patch(existingItem._id, {
                quantity: newTotalQty,
            });
        } else {
            await ctx.db.insert("cartItems", {
                cartId: cart._id,
                productId: args.productId,
                variantId: args.variantId,
                quantity: args.quantity,
            });
        }

        // 7. Touch cart update time
        await ctx.db.patch(cart._id, { updatedAt: Date.now() });

        return cart._id;
    },
});

/**
 * Update quantity of an item in the cart
 */
export const updateQuantity = mutation({
    args: {
        cartId: v.id("carts"),
        variantId: v.id("productVariants"),
        quantity: v.number(),
    },
    handler: async (ctx, args) => {
        // 1. Get Cart
        const cart = await ctx.db.get(args.cartId);
        if (!cart || cart.status !== "active") throw new Error("Cart not active");

        // 2. Remove item if quantity is 0 or less
        if (args.quantity <= 0) {
            const item = await ctx.db
                .query("cartItems")
                .withIndex("by_cartId_variantId", (q) =>
                    q.eq("cartId", args.cartId).eq("variantId", args.variantId)
                )
                .first();

            if (item) await ctx.db.delete(item._id);
            return;
        }

        // 3. Check Stock
        const variant = await ctx.db.get(args.variantId);
        if (!variant) throw new Error("Variant not found");

        if (variant.stockQuantity < args.quantity) {
            throw new Error(`Insufficient stock. Only ${variant.stockQuantity} available.`);
        }

        // 4. Update Item
        const item = await ctx.db
            .query("cartItems")
            .withIndex("by_cartId_variantId", (q) =>
                q.eq("cartId", args.cartId).eq("variantId", args.variantId)
            )
            .first();

        if (!item) throw new Error("Item not in cart");

        await ctx.db.patch(item._id, { quantity: args.quantity });
        await ctx.db.patch(cart._id, { updatedAt: Date.now() });
    },
});

/**
 * Remove an item from the cart
 */
export const removeItem = mutation({
    args: {
        cartId: v.id("carts"),
        variantId: v.id("productVariants"),
    },
    handler: async (ctx, args) => {
        const item = await ctx.db
            .query("cartItems")
            .withIndex("by_cartId_variantId", (q) =>
                q.eq("cartId", args.cartId).eq("variantId", args.variantId)
            )
            .first();

        if (item) {
            await ctx.db.delete(item._id);
            await ctx.db.patch(args.cartId, { updatedAt: Date.now() });
        }
    },
});

/**
 * Checkout (Convert Cart to Order)
 */
export const checkout = mutation({
    args: {
        cartId: v.id("carts"),
        customerInfo: v.object({
            name: v.string(),
            email: v.string(),
            address: v.optional(v.string()),
            phone: v.optional(v.string()),
        }),
    },
    handler: async (ctx, args) => {
        // 1. Get Cart
        const cart = await ctx.db.get(args.cartId);
        if (!cart || cart.status !== "active") throw new Error("Cart not active");

        // 2. Get Items
        const cartItems = await ctx.db
            .query("cartItems")
            .withIndex("by_cartId", (q) => q.eq("cartId", args.cartId))
            .collect();

        if (cartItems.length === 0) throw new Error("Cart is empty");

        // 3. Prepare Items for Order Creation
        const items = cartItems.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
        }));

        // 4. Create Order (Internal Helper)
        // This handles stock validation AND deduction
        const orderId = await createOrderImpl(ctx, {
            orgId: cart.orgId,
            items,
            customerInfo: args.customerInfo,
            userId: cart.userId ?? undefined,
        });

        // 5. Close Cart
        await ctx.db.patch(cart._id, {
            status: "completed",
            updatedAt: Date.now(),
        });

        return orderId;
    },
});


/**
 * Get cart details
 */
export const get = query({
    args: {
        orgId: v.optional(v.id("organizations")),
        sessionId: v.string(),
    },
    handler: async (ctx, args) => {
        // 1. Find Active Cart
        let cart;

        if (args.orgId) {
            cart = await ctx.db
                .query("carts")
                .withIndex("by_orgId_sessionId", (q) =>
                    q.eq("orgId", args.orgId!).eq("sessionId", args.sessionId)
                )
                .filter((q) => q.eq(q.field("status"), "active"))
                .order("desc")
                .first();
        } else {
            // Find most recent active cart for session across any org (or restricted context)
            cart = await ctx.db
                .query("carts")
                .filter(q => q.and(
                    q.eq(q.field("sessionId"), args.sessionId),
                    q.eq(q.field("status"), "active")
                ))
                .order("desc") // Need an index for efficient sort, but filter scan is slow anyway.
                // Assuming low volume of active carts per session.
                .first();
        }

        if (!cart) {
            return null;
        }

        // 2. Get Cart Items
        const items = await ctx.db
            .query("cartItems")
            .withIndex("by_cartId", (q) => q.eq("cartId", cart._id))
            .collect();

        // 3. Hydrate Items with Product/Variant details
        let totalAmount = 0;
        const hydratedItems = await Promise.all(
            items.map(async (item) => {
                const product = await ctx.db.get(item.productId);
                const variant = await ctx.db.get(item.variantId);

                if (!product || !variant) {
                    // Product/Variant might have been deleted.
                    return null;
                }

                const price = variant.price ?? product.price;
                const lineTotal = price * item.quantity;
                totalAmount += lineTotal;

                const image = product.images.length > 0 ? product.images[0] : null;

                return {
                    _id: item._id,
                    productId: product._id,
                    variantId: variant._id,
                    name: product.name + (variant.name && variant.name !== "Standard" ? ` - ${variant.name}` : ""),
                    image,
                    price,
                    quantity: item.quantity,
                    maxStock: variant.stockQuantity,
                    total: lineTotal,
                };
            })
        );

        // Filter out nulls (deleted products)
        const validItems = hydratedItems.filter((i) => i !== null) as NonNullable<typeof hydratedItems[number]>[];

        return {
            _id: cart._id,
            orgId: cart.orgId,
            sessionId: cart.sessionId,
            totalAmount,
            totalItems: validItems.reduce((acc, item) => acc + item.quantity, 0),
            items: validItems,
        };
    },
});
// Internal query for server-side actions (like Stripe)
export const getInternal = internalQuery({
    args: {
        sessionId: v.string(),
    },
    handler: async (ctx, args) => {
        // Need to find any active cart for this session, perhaps we iterate or pick most recent
        // NOTE: The previous 'get' implementation required orgId.
        // But for global checkout of a session, we might want to find the cart generally.
        // However, our data model keys carts by orgId+sessionId.
        // So a session could have multiple carts if they shopped at multiple stores?
        // For this project, let's assume one active cart per session or pick the most recent.

        const cart = await ctx.db
            .query("carts")
            // We don't have a by_sessionId index, only by_orgId_sessionId. 
            // We can filter by sessionId if we scan, but that's slow.
            // OR we just use the sessionId. 
            // Ideally we should pass cartId to the action, but sessionId is safer 
            // (less spoofable if we validate it matches the user's implicit session).
            // Actually, passing `cartId` to `createPaymentIntent` AND validating it belongs to `sessionId` is best.
            // But my `createPaymentIntent` currently only takes `sessionId`.
            // let's stick to the pattern.
            .filter(q => q.and(
                q.eq(q.field("sessionId"), args.sessionId),
                q.eq(q.field("status"), "active")
            ))
            .first();

        if (!cart) return null;

        // Calculate total
        const items = await ctx.db
            .query("cartItems")
            .withIndex("by_cartId", (q) => q.eq("cartId", cart._id))
            .collect();

        let totalAmount = 0;
        for (const item of items) {
            const product = await ctx.db.get(item.productId);
            const variant = await ctx.db.get(item.variantId);
            if (product && variant) {
                const price = variant.price ?? product.price;
                totalAmount += price * item.quantity;
            }
        }

        return {
            _id: cart._id,
            sessionId: cart.sessionId,
            totalAmount,
            items: items.map(i => i._id),
            orgId: cart.orgId
        };
    }
});
