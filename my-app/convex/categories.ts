import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { isPlatformAdmin, getOrgRole } from "./helpers/auth";

/**
 * Create a category
 * Requires org admin or platform admin
 */
export const create = mutation({
    args: {
        orgId: v.id("organizations"),
        name: v.string(),
        slug: v.optional(v.string()),
        parentId: v.optional(v.id("categories")),
        position: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        // 1. Authentication
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Unauthenticated");
        }

        // 2. Authorization
        const isPlatAdmin = await isPlatformAdmin(ctx, userId);
        const orgRole = await getOrgRole(ctx, userId, args.orgId);

        if (!isPlatAdmin && orgRole !== "admin") {
            throw new Error("Unauthorized: Must be organization admin or platform admin");
        }

        // 3. Verify organization exists
        const org = await ctx.db.get(args.orgId);
        if (!org) {
            throw new Error("Organization not found");
        }

        // 4. Validate name
        const trimmedName = args.name.trim();
        if (trimmedName.length === 0) {
            throw new Error("Category name cannot be empty");
        }
        if (trimmedName.length > 100) {
            throw new Error("Category name cannot exceed 100 characters");
        }

        // 5. Generate or validate slug
        let slug = args.slug?.trim();
        if (!slug) {
            slug = trimmedName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
        }

        if (slug.length === 0) {
            throw new Error("Slug cannot be empty");
        }
        const slugRegex = /^[a-z0-9-]+$/;
        if (!slugRegex.test(slug)) {
            throw new Error("Invalid slug format");
        }

        // Check uniqueness
        const existing = await ctx.db
            .query("categories")
            .withIndex("by_orgId_slug", (q) => q.eq("orgId", args.orgId).eq("slug", slug))
            .first();

        if (existing) {
            throw new Error(`Category slug '${slug}' already exists`);
        }

        // 6. Validate parentId if provided
        if (args.parentId) {
            const parent = await ctx.db.get(args.parentId);
            if (!parent || parent.orgId !== args.orgId) {
                throw new Error("Parent category not found");
            }
        }

        // 7. Determine position
        let position = args.position ?? 0;
        if (position === 0) {
            // Auto-assign next position
            const siblings = await ctx.db
                .query("categories")
                .withIndex("by_parentId", (q) => q.eq("parentId", args.parentId))
                .collect();
            const maxPos = siblings.reduce((max, c) => Math.max(max, c.position), 0);
            position = maxPos + 1;
        }

        // 8. Create category
        const categoryId = await ctx.db.insert("categories", {
            orgId: args.orgId,
            name: trimmedName,
            slug,
            parentId: args.parentId,
            position,
            createdAt: Date.now(),
        });

        return categoryId;
    },
});

/**
 * Update a category
 * Requires org admin or platform admin
 */
export const update = mutation({
    args: {
        categoryId: v.id("categories"),
        name: v.optional(v.string()),
        slug: v.optional(v.string()),
        parentId: v.optional(v.id("categories")),
        position: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        // 1. Get category
        const category = await ctx.db.get(args.categoryId);
        if (!category) {
            throw new Error("Category not found");
        }

        // 2. Authentication
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Unauthenticated");
        }

        // 3. Authorization
        const isPlatAdmin = await isPlatformAdmin(ctx, userId);
        const orgRole = await getOrgRole(ctx, userId, category.orgId);

        if (!isPlatAdmin && orgRole !== "admin") {
            throw new Error("Unauthorized");
        }

        // 4. Build updates
        const updates: Record<string, unknown> = {};

        if (args.name !== undefined) {
            const trimmedName = args.name.trim();
            if (trimmedName.length === 0) {
                throw new Error("Name cannot be empty");
            }
            if (trimmedName.length > 100) {
                throw new Error("Name cannot exceed 100 characters");
            }
            updates.name = trimmedName;
        }

        if (args.slug !== undefined) {
            const slug = args.slug.trim();
            if (slug.length === 0) {
                throw new Error("Slug cannot be empty");
            }
            if (slug.length > 100) {
                throw new Error("Slug cannot exceed 100 characters");
            }
            const slugRegex = /^[a-z0-9-]+$/;
            if (!slugRegex.test(slug)) {
                throw new Error("Invalid slug format");
            }

            if (slug !== category.slug) {
                const existing = await ctx.db
                    .query("categories")
                    .withIndex("by_orgId_slug", (q) =>
                        q.eq("orgId", category.orgId).eq("slug", slug)
                    )
                    .first();
                if (existing) {
                    throw new Error(`Slug '${slug}' already exists`);
                }
            }
            updates.slug = slug;
        }

        if (args.parentId !== undefined) {
            // Prevent circular reference
            if (args.parentId === args.categoryId) {
                throw new Error("Category cannot be its own parent");
            }
            if (args.parentId) {
                const parent = await ctx.db.get(args.parentId);
                if (!parent || parent.orgId !== category.orgId) {
                    throw new Error("Parent category not found");
                }
            }
            updates.parentId = args.parentId;
        }

        if (args.position !== undefined) {
            updates.position = args.position;
        }

        // 5. Apply updates
        if (Object.keys(updates).length > 0) {
            await ctx.db.patch(args.categoryId, updates);
        }
    },
});

/**
 * Delete a category
 * Requires org admin or platform admin
 */
export const remove = mutation({
    args: {
        categoryId: v.id("categories"),
    },
    handler: async (ctx, args) => {
        // 1. Get category
        const category = await ctx.db.get(args.categoryId);
        if (!category) {
            throw new Error("Category not found");
        }

        // 2. Authentication
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Unauthenticated");
        }

        // 3. Authorization
        const isPlatAdmin = await isPlatformAdmin(ctx, userId);
        const orgRole = await getOrgRole(ctx, userId, category.orgId);

        if (!isPlatAdmin && orgRole !== "admin") {
            throw new Error("Unauthorized");
        }

        // 4. Check for products using this category
        const productsUsingCategory = await ctx.db
            .query("products")
            .withIndex("by_orgId", (q) => q.eq("orgId", category.orgId))
            .filter((q) => q.eq(q.field("categoryId"), args.categoryId))
            .first();

        if (productsUsingCategory) {
            throw new Error("Cannot delete category: Products are using this category");
        }

        // 5. Check for child categories
        const children = await ctx.db
            .query("categories")
            .withIndex("by_parentId", (q) => q.eq("parentId", args.categoryId))
            .first();

        if (children) {
            throw new Error("Cannot delete category: Has child categories");
        }

        // 6. Delete category
        await ctx.db.delete(args.categoryId);
    },
});

/**
 * List categories for an organization
 * Returns flat list - frontend builds tree
 */
export const list = query({
    args: {
        orgId: v.id("organizations"),
    },
    handler: async (ctx, args) => {
        // 1. Authentication
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Unauthenticated");
        }

        // 2. Authorization
        const isPlatAdmin = await isPlatformAdmin(ctx, userId);
        const orgRole = await getOrgRole(ctx, userId, args.orgId);

        if (!isPlatAdmin && !orgRole) {
            throw new Error("Unauthorized");
        }

        // 3. Get all categories sorted by position
        const categories = await ctx.db
            .query("categories")
            .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
            .collect();

        // Sort by position, then name
        return categories.sort((a, b) => {
            if (a.position !== b.position) return a.position - b.position;
            return a.name.localeCompare(b.name);
        });
    },
});
