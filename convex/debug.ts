import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const testFlow = mutation({
    args: {},
    handler: async (ctx) => {
        // 1. Get first org
        const org = await ctx.db.query("organizations").first();
        if (!org) return "No organizations";

        const email = `debug.${Date.now()}@test.com`;

        // 2. Insert Customer
        const id = await ctx.db.insert("customers", {
            orgId: org._id,
            email: email,
            name: "Debug User",
            totalOrders: 1,
            totalSpend: 100,
            firstSeenAt: Date.now(),
            lastSeenAt: Date.now(),
        });

        // 3. Query
        const customers = await ctx.db
            .query("customers")
            .withIndex("by_orgId", q => q.eq("orgId", org._id))
            .collect();

        // 4. Cleanup
        await ctx.db.delete(id);

        return `Inserted ${email}. Total customers found: ${customers.length}. IDs: ${customers.map(c => c._id).join(", ")}`;
    },
});
