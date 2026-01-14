import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Seeds the initial platform admin.
 * Only works if there are no existing platform admins.
 */
export const seedInitial = internalMutation({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        // Check if any platform admins exist
        const existingAdmin = await ctx.db.query("platformAdmins").first();
        if (existingAdmin) {
            throw new Error("Platform admins already exist. Cannot seed initial admin.");
        }

        // Grant platform admin status
        await ctx.db.insert("platformAdmins", {
            userId: args.userId,
            grantedAt: Date.now(),
            // grantedBy is undefined for the first admin
        });

        console.log(`Seeded initial platform admin: ${args.userId}`);
    },
});

/**
 * Grant platform admin to a user by email.
 * If no admins exist, allows first admin creation without auth.
 * Otherwise requires existing platform admin.
 */
export const grantByEmail = mutation({
    args: {
        email: v.string(),
    },
    handler: async (ctx, args) => {
        // Find user by email in authAccounts table
        const authAccount = await ctx.db
            .query("authAccounts")
            .filter((q) => q.eq(q.field("providerAccountId"), args.email))
            .first();

        if (!authAccount) {
            throw new Error(`No user found with email: ${args.email}. User must sign up first.`);
        }

        const userId = authAccount.userId;

        // Check if any platform admins exist
        const existingAdmin = await ctx.db.query("platformAdmins").first();

        if (existingAdmin) {
            // Require auth for subsequent admin grants
            const currentUserId = await getAuthUserId(ctx);
            if (!currentUserId) {
                throw new Error("Must be authenticated to grant admin privileges");
            }

            const isAdmin = await ctx.db
                .query("platformAdmins")
                .withIndex("by_userId", (q) => q.eq("userId", currentUserId))
                .first();

            if (!isAdmin) {
                throw new Error("Only platform admins can grant admin privileges");
            }
        }

        // Check if user is already an admin
        const alreadyAdmin = await ctx.db
            .query("platformAdmins")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .first();

        if (alreadyAdmin) {
            return { success: true, message: "User is already a platform admin" };
        }

        // Grant admin status
        const currentUserId = await getAuthUserId(ctx);
        await ctx.db.insert("platformAdmins", {
            userId,
            grantedAt: Date.now(),
            grantedBy: existingAdmin && currentUserId ? currentUserId : undefined,
        });

        return { success: true, message: `Granted platform admin to ${args.email}` };
    },
});

/**
 * Check if any platform admins exist (used for initial setup)
 */
export const hasAdmins = query({
    args: {},
    handler: async (ctx) => {
        const admin = await ctx.db.query("platformAdmins").first();
        return !!admin;
    },
});
