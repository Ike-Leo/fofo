import { MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

type OrderItemInput = {
    variantId: Id<"productVariants">;
    quantity: number;
};

type CustomerInfo = {
    name: string;
    email: string;
    address?: string;
    phone?: string;
};

/**
 * Shared Internal Logic for Order Creation
 * Used by Admin Manual Entry and Public Checkout
 */
export async function createOrderImpl(
    ctx: MutationCtx,
    args: {
        orgId: Id<"organizations">;
        items: OrderItemInput[];
        customerInfo: CustomerInfo;
        userId?: Id<"users">; // Optional: Admin ID for manual, undefined for public
    }
) {
    // 1. Fetch all variants to validate stock and get snapshot data
    const variantIds = args.items.map(i => i.variantId);

    // Fetch unique variants
    const uniqueVariantIds = Array.from(new Set(variantIds));
    const variants = await Promise.all(uniqueVariantIds.map(id => ctx.db.get(id)));

    const variantMap = new Map();
    for (const v of variants) {
        if (!v) throw new Error("Variant not found");
        if (v.orgId !== args.orgId) throw new Error("Security violation: Variant belongs to different org");
        variantMap.set(v._id, v);
    }

    // 2. Fetch Products
    const productIds = Array.from(new Set(variants.map(v => v!.productId)));
    const products = await Promise.all(productIds.map(id => ctx.db.get(id!)));
    const productMap = new Map();
    for (const p of products) {
        if (p) productMap.set(p._id, p);
    }

    // 3. Validate Stock & Calculate Total
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of args.items) {
        const variant = variantMap.get(item.variantId);
        if (!variant) throw new Error("Variant not found in map"); // Should be impossible

        if (variant.stockQuantity < item.quantity) {
            throw new Error(`Insufficient stock for ${variant.name} (SKU: ${variant.sku}). Requested: ${item.quantity}, Available: ${variant.stockQuantity}`);
        }

        const product = productMap.get(variant.productId);

        // Price fallback logic
        const price = variant.price ?? product.price;

        totalAmount += (price * item.quantity);

        orderItemsData.push({
            productId: variant.productId,
            variantId: variant._id,
            productName: product.name,
            variantName: variant.name,
            quantity: item.quantity,
            price: price,
        });
    }

    // 4. Create Order Record
    const now = Date.now();
    const orderNumber = `ORD-${now.toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    const orderId = await ctx.db.insert("orders", {
        orgId: args.orgId,
        orderNumber,
        status: "pending",
        paymentStatus: "pending",
        totalAmount,
        customerInfo: args.customerInfo,
        createdAt: now,
        updatedAt: now,
    });

    // 5. Create Order Items & Deduct Stock
    for (const itemData of orderItemsData) {
        // Insert Item
        await ctx.db.insert("orderItems", {
            orderId,
            ...itemData,
        });

        // Deduct Stock
        const variant = variantMap.get(itemData.variantId);
        const newStock = variant.stockQuantity - itemData.quantity;

        // Update Variant
        await ctx.db.patch(variant._id, {
            stockQuantity: newStock,
        });

        // Log Movement
        await ctx.db.insert("inventoryMovements", {
            orgId: args.orgId,
            variantId: variant._id,
            productId: variant.productId,
            type: "sold",
            quantity: -itemData.quantity,
            reason: `Order ${orderNumber}`,
            userId: args.userId, // Can be undefined now
            createdAt: now,
        });
    }

    // 6. Update Customer (CRM)
    const existingCustomer = await ctx.db
        .query("customers")
        .withIndex("by_orgId_email", q => q.eq("orgId", args.orgId).eq("email", args.customerInfo.email))
        .first();

    if (existingCustomer) {
        await ctx.db.patch(existingCustomer._id, {
            totalOrders: existingCustomer.totalOrders + 1,
            totalSpend: existingCustomer.totalSpend + totalAmount,
            lastSeenAt: now,
            // Update address/phone if provided
            name: args.customerInfo.name, // Always update name? Or keep "official"? Updating is usually better for CRM freshness
            phone: args.customerInfo.phone ?? existingCustomer.phone,
            address: args.customerInfo.address ?? existingCustomer.address,
        });
    } else {
        await ctx.db.insert("customers", {
            orgId: args.orgId,
            email: args.customerInfo.email,
            name: args.customerInfo.name,
            phone: args.customerInfo.phone,
            address: args.customerInfo.address,
            totalOrders: 1,
            totalSpend: totalAmount,
            firstSeenAt: now,
            lastSeenAt: now,
        });
    }

    return orderId;
}
