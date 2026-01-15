import { v } from "convex/values";
import { query } from "../_generated/server";

/**
 * PUBLIC API - No authentication required
 * Category queries for storefront navigation.
 */

/**
 * List all categories for a storefront
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
            return [];
        }

        // 2. Query all categories for this org
        const categories = await ctx.db
            .query("categories")
            .withIndex("by_orgId", (q) => q.eq("orgId", org._id))
            .collect();

        // 3. Sort by position and return public-safe fields
        return categories
            .sort((a, b) => a.position - b.position)
            .map((category) => ({
                _id: category._id,
                name: category.name,
                slug: category.slug,
                parentId: category.parentId,
                position: category.position,
            }));
    },
});

/**
 * Get a single category by slug
 * Public query - no authentication required
 */
export const get = query({
    args: {
        orgSlug: v.string(),
        categorySlug: v.string(),
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

        // 2. Find category by slug
        const category = await ctx.db
            .query("categories")
            .withIndex("by_orgId_slug", (q) =>
                q.eq("orgId", org._id).eq("slug", args.categorySlug)
            )
            .first();

        if (!category) {
            return null;
        }

        // 3. Get product count in this category
        const products = await ctx.db
            .query("products")
            .withIndex("by_orgId_status", (q) =>
                q.eq("orgId", org._id).eq("status", "active")
            )
            .filter((q) => q.eq(q.field("categoryId"), category._id))
            .collect();

        return {
            _id: category._id,
            name: category.name,
            slug: category.slug,
            parentId: category.parentId,
            position: category.position,
            productCount: products.length,
        };
    },
});
