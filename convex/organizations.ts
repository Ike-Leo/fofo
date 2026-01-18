/* eslint-disable @typescript-eslint/no-explicit-any */
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { isPlatformAdmin, getOrgRole } from "./helpers/auth";

export const create = mutation({
    args: {
        name: v.string(),
        slug: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Unauthenticated");
        }

        const isAdmin = await isPlatformAdmin(ctx, userId);
        if (!isAdmin) {
            throw new Error("Unauthorized: Only platform admins can create organizations");
        }

        // Validate name
        const trimmedName = args.name.trim();
        if (trimmedName.length === 0) {
            throw new Error("Organization name cannot be empty");
        }
        if (trimmedName.length > 100) {
            throw new Error("Organization name cannot exceed 100 characters");
        }

        // Validate slug format
        if (args.slug.length === 0) {
            throw new Error("Slug cannot be empty");
        }
        if (args.slug.length > 50) {
            throw new Error("Slug cannot exceed 50 characters");
        }
        const slugRegex = /^[a-z0-9-]+$/;
        if (!slugRegex.test(args.slug)) {
            throw new Error("Invalid slug: Only lowercase alphanumeric characters and hyphens are allowed");
        }

        // Check availability
        const existing = await ctx.db
            .query("organizations")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();

        if (existing) {
            throw new Error(`Organization slug '${args.slug}' is already taken`);
        }

        const orgId = await ctx.db.insert("organizations", {
            name: trimmedName,
            slug: args.slug,
            plan: "free",
            isActive: true,
            createdAt: Date.now(),
        });

        // Add creator as admin member
        await ctx.db.insert("organizationMembers", {
            orgId,
            userId,
            role: "admin",
            joinedAt: Date.now(),
        });

        return orgId;
    },
});

export const update = mutation({
    args: {
        orgId: v.id("organizations"),
        name: v.optional(v.string()),
        plan: v.optional(v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise"))),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthenticated");

        const isPlatAdmin = await isPlatformAdmin(ctx, userId);
        const orgRole = await getOrgRole(ctx, userId, args.orgId);
        const isOrgAdmin = orgRole === "admin";

        if (!isPlatAdmin && !isOrgAdmin) {
            throw new Error("Unauthorized: Must be organization admin or platform admin");
        }

        // Restricted fields check
        if ((args.plan !== undefined || args.isActive !== undefined) && !isPlatAdmin) {
            throw new Error("Unauthorized: Only platform admins can change plan or status");
        }

        const updates: any = {};
        if (args.name !== undefined) updates.name = args.name;
        if (args.plan !== undefined) updates.plan = args.plan;
        if (args.isActive !== undefined) updates.isActive = args.isActive;

        await ctx.db.patch(args.orgId, updates);
    },
});

export const listAll = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Unauthenticated");
        }

        const isAdmin = await isPlatformAdmin(ctx, userId);
        if (!isAdmin) {
            throw new Error("Unauthorized: Only platform admins can list organizations");
        }

        const orgs = await ctx.db
            .query("organizations")
            .order("desc")
            .collect();

        return orgs;
    },
});
