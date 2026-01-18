import { v } from "convex/values";
import { query } from "../_generated/server";

/**
 * Get public organization details by slug
 */
export const getBySlug = query({
    args: {
        slug: v.string(),
    },
    handler: async (ctx, args) => {
        const org = await ctx.db
            .query("organizations")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();

        if (!org || !org.isActive) {
            return null;
        }

        return {
            _id: org._id,
            name: org.name,
            slug: org.slug,
        };
    },
});
