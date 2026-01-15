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
        limit: v.optional(v.number()),
        cursor: v.optional(v.string()),
        minPrice: v.optional(v.number()),
        maxPrice: v.optional(v.number()),
        inStockOnly: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 20;

        // 1. Find organization by slug
        const org = await ctx.db
            .query("organizations")
            .withIndex("by_slug", (q) => q.eq("slug", args.orgSlug))
            .first();

        if (!org || !org.isActive) {
            return { products: [], nextCursor: null, hasMore: false };
        }

        // 2. Query active products with pagination
        let productsQuery = ctx.db
            .query("products")
            .withIndex("by_orgId_status", (q) =>
                q.eq("orgId", org._id).eq("status", "active")
            )
            .order("desc");

        // Apply cursor for pagination
        const allProducts = await productsQuery.collect();

        // Find cursor position
        let startIndex = 0;
        if (args.cursor) {
            const cursorIndex = allProducts.findIndex(p => p._id === args.cursor);
            if (cursorIndex !== -1) {
                startIndex = cursorIndex + 1;
            }
        }

        // 3. Get products with variants and apply filters
        const productsWithDetails = await Promise.all(
            allProducts.slice(startIndex).map(async (product) => {
                // Apply price filters
                if (args.minPrice !== undefined && product.price < args.minPrice) {
                    return null;
                }
                if (args.maxPrice !== undefined && product.price > args.maxPrice) {
                    return null;
                }

                const variants = await ctx.db
                    .query("productVariants")
                    .withIndex("by_productId", (q) => q.eq("productId", product._id))
                    .collect();

                const totalStock = variants.reduce((sum, v) => sum + v.stockQuantity, 0);

                // Apply inStockOnly filter
                if (args.inStockOnly && totalStock <= 0) {
                    return null;
                }

                return {
                    _id: product._id,
                    name: product.name,
                    slug: product.slug,
                    description: product.description,
                    price: product.price,
                    compareAtPrice: product.compareAtPrice,
                    images: product.images,
                    inStock: totalStock > 0,
                    totalStock,
                    variantCount: variants.length,
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
            })
        );

        // Filter out nulls and paginate
        const filteredProducts = productsWithDetails.filter((p): p is NonNullable<typeof p> => p !== null);
        const paginatedProducts = filteredProducts.slice(0, limit);
        const hasMore = filteredProducts.length > limit;
        const nextCursor = hasMore && paginatedProducts.length > 0
            ? paginatedProducts[paginatedProducts.length - 1]._id
            : null;

        return {
            products: paginatedProducts,
            nextCursor,
            hasMore,
        };
    },
});

/**
 * Search products by name or description
 * Public query - no authentication required
 */
export const search = query({
    args: {
        orgSlug: v.string(),
        query: v.string(),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 20;
        const searchQuery = args.query.toLowerCase().trim();

        if (!searchQuery) {
            return [];
        }

        // 1. Find organization by slug
        const org = await ctx.db
            .query("organizations")
            .withIndex("by_slug", (q) => q.eq("slug", args.orgSlug))
            .first();

        if (!org || !org.isActive) {
            return [];
        }

        // 2. Query active products and filter by search term
        const products = await ctx.db
            .query("products")
            .withIndex("by_orgId_status", (q) =>
                q.eq("orgId", org._id).eq("status", "active")
            )
            .collect();

        // 3. Filter by search query (name or description)
        const matchingProducts = products.filter((product) => {
            const nameMatch = product.name.toLowerCase().includes(searchQuery);
            const descMatch = product.description?.toLowerCase().includes(searchQuery);
            return nameMatch || descMatch;
        });

        // 4. Get variants and build response
        const productsWithDetails = await Promise.all(
            matchingProducts.slice(0, limit).map(async (product) => {
                const variants = await ctx.db
                    .query("productVariants")
                    .withIndex("by_productId", (q) => q.eq("productId", product._id))
                    .collect();

                const totalStock = variants.reduce((sum, v) => sum + v.stockQuantity, 0);

                return {
                    _id: product._id,
                    name: product.name,
                    slug: product.slug,
                    description: product.description,
                    price: product.price,
                    compareAtPrice: product.compareAtPrice,
                    images: product.images,
                    inStock: totalStock > 0,
                    totalStock,
                    variantCount: variants.length,
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
            })
        );

        return productsWithDetails;
    },
});

/**
 * List products by category
 * Public query - no authentication required
 */
export const listByCategory = query({
    args: {
        orgSlug: v.string(),
        categorySlug: v.string(),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 20;

        // 1. Find organization by slug
        const org = await ctx.db
            .query("organizations")
            .withIndex("by_slug", (q) => q.eq("slug", args.orgSlug))
            .first();

        if (!org || !org.isActive) {
            return [];
        }

        // 2. Find category by slug
        const category = await ctx.db
            .query("categories")
            .withIndex("by_orgId_slug", (q) =>
                q.eq("orgId", org._id).eq("slug", args.categorySlug)
            )
            .first();

        if (!category) {
            return [];
        }

        // 3. Query active products in this category
        const products = await ctx.db
            .query("products")
            .withIndex("by_orgId_status", (q) =>
                q.eq("orgId", org._id).eq("status", "active")
            )
            .filter((q) => q.eq(q.field("categoryId"), category._id))
            .take(limit);

        // 4. Get variants for each product
        const productsWithDetails = await Promise.all(
            products.map(async (product) => {
                const variants = await ctx.db
                    .query("productVariants")
                    .withIndex("by_productId", (q) => q.eq("productId", product._id))
                    .collect();

                const totalStock = variants.reduce((sum, v) => sum + v.stockQuantity, 0);

                return {
                    _id: product._id,
                    name: product.name,
                    slug: product.slug,
                    description: product.description,
                    price: product.price,
                    compareAtPrice: product.compareAtPrice,
                    images: product.images,
                    inStock: totalStock > 0,
                    totalStock,
                    variantCount: variants.length,
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
            })
        );

        return productsWithDetails;
    },
});

/**
 * Get related products (same category or random if no category)
 * Public query - no authentication required
 */
export const getRelated = query({
    args: {
        orgSlug: v.string(),
        productSlug: v.string(),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 4;

        // 1. Find organization by slug
        const org = await ctx.db
            .query("organizations")
            .withIndex("by_slug", (q) => q.eq("slug", args.orgSlug))
            .first();

        if (!org || !org.isActive) {
            return [];
        }

        // 2. Find the current product
        const currentProduct = await ctx.db
            .query("products")
            .withIndex("by_orgId_slug", (q) =>
                q.eq("orgId", org._id).eq("slug", args.productSlug)
            )
            .first();

        if (!currentProduct) {
            return [];
        }

        // 3. Query active products, prioritizing same category
        type ProductDoc = Awaited<ReturnType<typeof ctx.db.get<"products">>> & {};
        let relatedProducts: NonNullable<ProductDoc>[] = [];

        if (currentProduct.categoryId) {
            // Get products in same category
            relatedProducts = await ctx.db
                .query("products")
                .withIndex("by_orgId_status", (q) =>
                    q.eq("orgId", org._id).eq("status", "active")
                )
                .filter((q) =>
                    q.and(
                        q.eq(q.field("categoryId"), currentProduct.categoryId),
                        q.neq(q.field("_id"), currentProduct._id)
                    )
                )
                .take(limit);
        }

        // 4. If not enough related products, fill with random active products
        if (relatedProducts.length < limit) {
            const remaining = limit - relatedProducts.length;
            const relatedIds = new Set(relatedProducts.map((p) => p._id));
            relatedIds.add(currentProduct._id);

            const otherProducts = await ctx.db
                .query("products")
                .withIndex("by_orgId_status", (q) =>
                    q.eq("orgId", org._id).eq("status", "active")
                )
                .filter((q) => q.neq(q.field("_id"), currentProduct._id))
                .take(remaining + relatedProducts.length);

            for (const product of otherProducts) {
                if (!relatedIds.has(product._id) && relatedProducts.length < limit) {
                    relatedProducts.push(product);
                }
            }
        }

        // 5. Get variants for related products
        const productsWithDetails = await Promise.all(
            relatedProducts.map(async (product) => {
                const variants = await ctx.db
                    .query("productVariants")
                    .withIndex("by_productId", (q) => q.eq("productId", product._id))
                    .collect();

                const totalStock = variants.reduce((sum, v) => sum + v.stockQuantity, 0);

                return {
                    _id: product._id,
                    name: product.name,
                    slug: product.slug,
                    description: product.description,
                    price: product.price,
                    compareAtPrice: product.compareAtPrice,
                    images: product.images,
                    inStock: totalStock > 0,
                    totalStock,
                    variantCount: variants.length,
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
