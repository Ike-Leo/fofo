import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { isPlatformAdmin, getOrgRole } from "./helpers/auth";

export const add = mutation({
    args: {
        orgId: v.id("organizations"),
        userId: v.id("users"),
        role: v.union(v.literal("admin"), v.literal("manager"), v.literal("staff")),
    },
    handler: async (ctx, args) => {
        const callerId = await getAuthUserId(ctx);
        if (!callerId) throw new Error("Unauthenticated");

        const isPlatAdmin = await isPlatformAdmin(ctx, callerId);
        const callerRole = await getOrgRole(ctx, callerId, args.orgId);

        if (!isPlatAdmin && callerRole !== "admin") {
            throw new Error("Unauthorized: Must be organization admin or platform admin to add members");
        }

        // Verify organization exists
        const org = await ctx.db.get(args.orgId);
        if (!org) {
            throw new Error("Organization not found");
        }

        // Verify target user exists
        const targetUser = await ctx.db.get(args.userId);
        if (!targetUser) {
            throw new Error("User not found");
        }

        // Check for existing membership
        const existing = await ctx.db
            .query("organizationMembers")
            .withIndex("by_orgId_userId", (q) =>
                q.eq("orgId", args.orgId).eq("userId", args.userId)
            )
            .first();

        if (existing) {
            throw new Error("User is already a member of this organization");
        }

        await ctx.db.insert("organizationMembers", {
            orgId: args.orgId,
            userId: args.userId,
            role: args.role,
            joinedAt: Date.now(),
        });
    },
});

import { query } from "./_generated/server";

export const myOrganizations = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const memberships = await ctx.db
            .query("organizationMembers")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .collect();

        const orgs = await Promise.all(
            memberships.map(async (m) => {
                const org = await ctx.db.get(m.orgId);
                if (!org) return null;
                return { ...org, role: m.role };
            })
        );

        return orgs.filter((o) => o !== null);
    },
});
