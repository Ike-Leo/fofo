import { v } from "convex/values";
import { query } from "../_generated/server";

/**
 * PUBLIC API - No authentication required
 * These queries are designed for storefront use, scoped by organization slug.
 * Only returns publicly safe data (active products, no sensitive fields).
 */

/**
 * List active products for a storefront
 * Public query - no authentication required
 */
export const list = query({
    args: {
        orgSlug: v.string(),
    },
    handler: async (ctx, args) => {
        // 1. Find organization by slug
        const org = await ctx.db
            .query("organizations")
            .withIndex("by_slug", (q) => q.eq("slug", args.orgSlug))
            .first();

        if (!org || !org.isActive) {
            // Return empty array for non-existent or inactive orgs
            return [];
        }

        // 2. Query only active products
        const products = await ctx.db
            .query("products")
            .withIndex("by_orgId_status", (q) =>
                q.eq("orgId", org._id).eq("status", "active")
            )
            .order("desc")
            .collect();

        // 3. Get variants for each product (for stock calculation)
        const productsWithDetails = await Promise.all(
            products.map(async (product) => {
                const variants = await ctx.db
                    .query("productVariants")
                    .withIndex("by_productId", (q) => q.eq("productId", product._id))
                    .collect();

                // Calculate total stock and get default variant price
                const totalStock = variants.reduce((sum, v) => sum + v.stockQuantity, 0);

                return {
                    _id: product._id,
                    name: product.name,
                    slug: product.slug,
                    description: product.description,
                    price: product.price,
                    compareAtPrice: product.compareAtPrice,
                    images: product.images,
                    // Calculated fields
                    inStock: totalStock > 0,
                    totalStock,
                    variantCount: variants.length,
                    // Include variants with public-safe fields only
                    variants: variants.map((variant) => ({
                        _id: variant._id,
                        name: variant.name,
                        sku: variant.sku,
                        price: variant.price ?? product.price, // Fallback to product price
                        stockQuantity: variant.stockQuantity,
                        options: variant.options,
                        isDefault: variant.isDefault,
                    })),
                };
            })
        );

        return productsWithDetails;
    },
});

/**
 * Get a single product by slug for a storefront
 * Public query - no authentication required
 */
export const get = query({
    args: {
        orgSlug: v.string(),
        productSlug: v.string(),
    },
    handler: async (ctx, args) => {
        // 1. Find organization by slug
        const org = await ctx.db
            .query("organizations")
            .withIndex("by_slug", (q) => q.eq("slug", args.orgSlug))
            .first();

        if (!org || !org.isActive) {
            return null;
        }

        // 2. Find product by org + slug
        const product = await ctx.db
            .query("products")
            .withIndex("by_orgId_slug", (q) =>
                q.eq("orgId", org._id).eq("slug", args.productSlug)
            )
            .first();

        if (!product || product.status !== "active") {
            return null; // Only return active products
        }

        // 3. Get all variants
        const variants = await ctx.db
            .query("productVariants")
            .withIndex("by_productId", (q) => q.eq("productId", product._id))
            .collect();

        // 4. Get category (if exists)
        let categoryName = null;
        if (product.categoryId) {
            const category = await ctx.db.get(product.categoryId);
            if (category) {
                categoryName = category.name;
            }
        }

        // 5. Calculate stock info
        const totalStock = variants.reduce((sum, v) => sum + v.stockQuantity, 0);

        return {
            _id: product._id,
            orgId: product.orgId,
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: product.price,
            compareAtPrice: product.compareAtPrice,
            images: product.images,
            categoryName,
            // Stock info
            inStock: totalStock > 0,
            totalStock,
            // Variants with public-safe fields
            variants: variants.map((variant) => ({
                _id: variant._id,
                name: variant.name,
                sku: variant.sku,
                price: variant.price ?? product.price,
                stockQuantity: variant.stockQuantity,
                options: variant.options,
                isDefault: variant.isDefault,
            })),
        };
    },
});

// =============================================================================
// TypeScript Types for Frontend Use
// =============================================================================

/**
 * Type for a public product variant (used in storefront)
 */
export type PublicVariant = {
    _id: string;
    name: string;
    sku: string;
    price: number;
    stockQuantity: number;
    options: {
        size?: string;
        color?: string;
        material?: string;
        custom?: string;
    };
    isDefault: boolean;
};

/**
 * Type for a product in the listing (summary)
 */
export type PublicProductSummary = {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    images: string[];
    inStock: boolean;
    totalStock: number;
    variantCount: number;
    variants: PublicVariant[];
};

/**
 * Type for a single product detail page
 */
export type PublicProductDetail = {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    images: string[];
    categoryName: string | null;
    inStock: boolean;
    totalStock: number;
    variants: PublicVariant[];
};
