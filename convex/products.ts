import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { isPlatformAdmin, getOrgRole } from "./helpers/auth";
import { Id } from "./_generated/dataModel";

/**
 * Create a new product
 * Requires org admin or platform admin role
 */
export const create = mutation({
    args: {
        orgId: v.id("organizations"),
        name: v.string(),
        slug: v.optional(v.string()),
        description: v.optional(v.string()),
        price: v.number(), // In cents
        compareAtPrice: v.optional(v.number()),
        categoryId: v.optional(v.id("categories")),
        images: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        // 1. Authentication
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Unauthenticated");
        }

        // 2. Authorization - require org admin or platform admin
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
            throw new Error("Product name cannot be empty");
        }
        if (trimmedName.length > 200) {
            throw new Error("Product name cannot exceed 200 characters");
        }

        // 5. Validate price
        if (args.price < 0) {
            throw new Error("Price cannot be negative");
        }
        if (args.compareAtPrice !== undefined && args.compareAtPrice < 0) {
            throw new Error("Compare at price cannot be negative");
        }

        // 6. Generate or validate slug
        let slug = args.slug?.trim();
        if (!slug) {
            // Auto-generate slug from name
            slug = trimmedName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
        }

        // Validate slug format
        if (slug.length === 0) {
            throw new Error("Slug cannot be empty");
        }
        if (slug.length > 100) {
            throw new Error("Slug cannot exceed 100 characters");
        }
        const slugRegex = /^[a-z0-9-]+$/;
        if (!slugRegex.test(slug)) {
            throw new Error("Invalid slug: Only lowercase alphanumeric characters and hyphens allowed");
        }

        // 7. Check slug uniqueness within org
        const existingProduct = await ctx.db
            .query("products")
            .withIndex("by_orgId_slug", (q) => q.eq("orgId", args.orgId).eq("slug", slug))
            .first();

        if (existingProduct) {
            throw new Error(`Product slug '${slug}' already exists in this organization`);
        }

        // 8. Validate categoryId if provided
        if (args.categoryId) {
            const category = await ctx.db.get(args.categoryId);
            if (!category || category.orgId !== args.orgId) {
                throw new Error("Category not found or belongs to different organization");
            }
        }

        // 9. Create product
        const now = Date.now();
        const productId = await ctx.db.insert("products", {
            orgId: args.orgId,
            name: trimmedName,
            slug,
            description: args.description?.trim(),
            price: args.price,
            compareAtPrice: args.compareAtPrice,
            status: "draft", // Default to draft
            categoryId: args.categoryId,
            images: args.images ?? [],
            createdAt: now,
            updatedAt: now,
        });

        // 10. Log activity
        await ctx.db.insert("productActivities", {
            orgId: args.orgId,
            productId,
            type: "created",
            description: `Product "${trimmedName}" was created`,
            userId,
            createdAt: now,
        });

        return productId;
    },
});

/**
 * List products for an organization
 * Requires org membership
 */
export const list = query({
    args: {
        orgId: v.id("organizations"),
        status: v.optional(v.union(
            v.literal("draft"),
            v.literal("active"),
            v.literal("archived")
        )),
    },
    handler: async (ctx, args) => {
        // 1. Authentication
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Unauthenticated");
        }

        // 2. Authorization - require org membership
        const isPlatAdmin = await isPlatformAdmin(ctx, userId);
        const orgRole = await getOrgRole(ctx, userId, args.orgId);

        if (!isPlatAdmin && !orgRole) {
            throw new Error("Unauthorized: Not a member of this organization");
        }

        // 3. Query products
        let productsQuery;
        if (args.status) {
            productsQuery = ctx.db
                .query("products")
                .withIndex("by_orgId_status", (q) =>
                    q.eq("orgId", args.orgId).eq("status", args.status!)
                );
        } else {
            productsQuery = ctx.db
                .query("products")
                .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId));
        }

        const products = await productsQuery.order("desc").collect();

        // 4. Get variant counts for each product
        const productsWithVariantCounts = await Promise.all(
            products.map(async (product) => {
                const variants = await ctx.db
                    .query("productVariants")
                    .withIndex("by_productId", (q) => q.eq("productId", product._id))
                    .collect();
                return {
                    ...product,
                    variantCount: variants.length,
                };
            })
        );

        return productsWithVariantCounts;
    },
});

/**
 * Get a single product by ID with its variants
 */
export const get = query({
    args: {
        productId: v.id("products"),
    },
    handler: async (ctx, args) => {
        // 1. Authentication FIRST - before revealing data existence
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Unauthenticated");
        }

        // 2. Get product
        const product = await ctx.db.get(args.productId);
        if (!product) {
            return null;
        }

        // 3. Authorization - verify user has access to this org's data
        const isPlatAdmin = await isPlatformAdmin(ctx, userId);
        const orgRole = await getOrgRole(ctx, userId, product.orgId);

        if (!isPlatAdmin && !orgRole) {
            // Return null instead of error to not reveal product exists in another org
            return null;
        }

        // 4. Get variants
        const variants = await ctx.db
            .query("productVariants")
            .withIndex("by_productId", (q) => q.eq("productId", product._id))
            .collect();

        // 5. Get category if exists
        let category = null;
        if (product.categoryId) {
            category = await ctx.db.get(product.categoryId);
        }

        return {
            ...product,
            variants,
            category,
        };
    },
});

/**
 * Update a product
 * Requires org admin or platform admin
 */
export const update = mutation({
    args: {
        productId: v.id("products"),
        name: v.optional(v.string()),
        slug: v.optional(v.string()),
        description: v.optional(v.string()),
        price: v.optional(v.number()),
        compareAtPrice: v.optional(v.number()),
        categoryId: v.optional(v.id("categories")),
        images: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        // 1. Get existing product
        const product = await ctx.db.get(args.productId);
        if (!product) {
            throw new Error("Product not found");
        }

        // 2. Authentication
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Unauthenticated");
        }

        // 3. Authorization
        const isPlatAdmin = await isPlatformAdmin(ctx, userId);
        const orgRole = await getOrgRole(ctx, userId, product.orgId);

        if (!isPlatAdmin && orgRole !== "admin") {
            throw new Error("Unauthorized: Must be organization admin or platform admin");
        }

        // 4. Build updates object
        const updates: Record<string, unknown> = {
            updatedAt: Date.now(),
        };

        // Validate and add name
        if (args.name !== undefined) {
            const trimmedName = args.name.trim();
            if (trimmedName.length === 0) {
                throw new Error("Product name cannot be empty");
            }
            if (trimmedName.length > 200) {
                throw new Error("Product name cannot exceed 200 characters");
            }
            updates.name = trimmedName;
        }

        // Validate and add slug
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

            // Check uniqueness if changed
            if (slug !== product.slug) {
                const existing = await ctx.db
                    .query("products")
                    .withIndex("by_orgId_slug", (q) =>
                        q.eq("orgId", product.orgId).eq("slug", slug)
                    )
                    .first();
                if (existing) {
                    throw new Error(`Product slug '${slug}' already exists`);
                }
            }
            updates.slug = slug;
        }

        // Add other fields
        if (args.description !== undefined) {
            updates.description = args.description.trim();
        }
        if (args.price !== undefined) {
            if (args.price < 0) throw new Error("Price cannot be negative");
            updates.price = args.price;
        }
        if (args.compareAtPrice !== undefined) {
            if (args.compareAtPrice < 0) throw new Error("Compare at price cannot be negative");
            updates.compareAtPrice = args.compareAtPrice;
        }
        if (args.categoryId !== undefined) {
            if (args.categoryId) {
                const category = await ctx.db.get(args.categoryId);
                if (!category || category.orgId !== product.orgId) {
                    throw new Error("Category not found");
                }
            }
            updates.categoryId = args.categoryId;
        }
        if (args.images !== undefined) {
            updates.images = args.images;
        }

        // 5. Apply updates
        await ctx.db.patch(args.productId, updates);

        // 6. Log activity
        const changes = [];
        if (args.name !== undefined && args.name !== product.name) changes.push("name");
        if (args.slug !== undefined && args.slug !== product.slug) changes.push("slug");
        if (args.description !== undefined) changes.push("description");
        if (args.price !== undefined && args.price !== product.price) changes.push("price");
        if (args.compareAtPrice !== undefined) changes.push("compareAtPrice");
        if (args.categoryId !== undefined && args.categoryId !== product.categoryId) changes.push("category");
        if (args.images !== undefined) changes.push("images");

        if (changes.length > 0) {
            await ctx.db.insert("productActivities", {
                orgId: product.orgId,
                productId: args.productId,
                type: "updated",
                description: `Product updated: ${changes.join(", ")}`,
                userId,
                metadata: {
                    changes: changes.join(", "),
                },
                createdAt: Date.now(),
            });
        }
    },
});

/**
 * Update product status (publish/unpublish/archive)
 * Requires org admin or platform admin
 */
export const setStatus = mutation({
    args: {
        productId: v.id("products"),
        status: v.union(
            v.literal("draft"),
            v.literal("active"),
            v.literal("archived")
        ),
    },
    handler: async (ctx, args) => {
        // 1. Get product
        const product = await ctx.db.get(args.productId);
        if (!product) {
            throw new Error("Product not found");
        }

        // 2. Authentication
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Unauthenticated");
        }

        // 3. Authorization
        const isPlatAdmin = await isPlatformAdmin(ctx, userId);
        const orgRole = await getOrgRole(ctx, userId, product.orgId);

        if (!isPlatAdmin && orgRole !== "admin") {
            throw new Error("Unauthorized: Must be organization admin or platform admin");
        }

        // 4. Update status
        await ctx.db.patch(args.productId, {
            status: args.status,
            updatedAt: Date.now(),
        });

        // 5. Log activity
        if (args.status === "archived") {
            await ctx.db.insert("productActivities", {
                orgId: product.orgId,
                productId: args.productId,
                type: "archived",
                description: `Product "${product.name}" was archived`,
                userId,
                createdAt: Date.now(),
            });
        }
    },
});

/**
 * Bulk import products from CSV data
 * Requires org admin or platform admin
 */
export const bulkImport = mutation({
    args: {
        orgId: v.id("organizations"),
        products: v.array(
            v.object({
                name: v.string(),
                slug: v.optional(v.string()),
                description: v.optional(v.string()),
                price: v.number(),
                compareAtPrice: v.optional(v.number()),
                categorySlug: v.optional(v.string()),
                images: v.optional(v.array(v.string())),
            })
        ),
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

        // 4. Get all categories for slug lookup
        const allCategories = await ctx.db
            .query("categories")
            .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
            .collect();

        const categorySlugToId = new Map(
            allCategories.map((cat) => [cat.slug, cat._id])
        );

        // 5. Import products
        const results = {
            success: 0,
            failed: 0,
            errors: [] as Array<{ row: number; name: string; error: string }>,
        };

        for (let i = 0; i < args.products.length; i++) {
            const productData = args.products[i];
            try {
                // Validate name
                const trimmedName = productData.name.trim();
                if (trimmedName.length === 0) {
                    throw new Error("Product name cannot be empty");
                }
                if (trimmedName.length > 200) {
                    throw new Error("Product name cannot exceed 200 characters");
                }

                // Generate or validate slug
                let slug = productData.slug?.trim();
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
                    .query("products")
                    .withIndex("by_orgId_slug", (q) =>
                        q.eq("orgId", args.orgId).eq("slug", slug)
                    )
                    .first();

                if (existing) {
                    throw new Error(`Product slug '${slug}' already exists`);
                }

                // Look up category by slug
                let categoryId: Id<"categories"> | undefined = undefined;
                if (productData.categorySlug) {
                    categoryId = categorySlugToId.get(productData.categorySlug);
                    if (!categoryId) {
                        throw new Error(`Category '${productData.categorySlug}' not found`);
                    }
                }

                // Validate price
                if (productData.price < 0) {
                    throw new Error("Price cannot be negative");
                }

                // Create product
                const now = Date.now();
                await ctx.db.insert("products", {
                    orgId: args.orgId,
                    name: trimmedName,
                    slug,
                    description: productData.description?.trim(),
                    price: productData.price,
                    compareAtPrice: productData.compareAtPrice,
                    status: "draft",
                    categoryId,
                    images: productData.images ?? [],
                    createdAt: now,
                    updatedAt: now,
                });

                results.success++;
            } catch (error: unknown) {
                results.failed++;
                results.errors.push({
                    row: i + 1,
                    name: productData.name,
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        }

        return results;
    },
});
