import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const seedCustomers = mutation({
    args: {
        count: v.optional(v.number()), // Optional count, default 20
    },
    handler: async (ctx, args) => {
        // Skip auth check for dev seeding
        // const userId = await getAuthUserId(ctx);
        // if (!userId) throw new Error("Unauthorized");

        // Get the first org in the DB
        const org = await ctx.db
            .query("organizations")
            .first();

        if (!org) throw new Error("No organizations found");

        const orgId = org._id;
        const count = args.count ?? 20;

        const names = [
            "Emma Thompson", "Liam Wilson", "Olivia Davis", "Noah Martinez", "Ava Taylor",
            "William Anderson", "Sophia Thomas", "James Jackson", "Isabella White", "Oliver Harris",
            "Mia Martin", "Benjamin Thompson", "Charlotte Garcia", "Lucas Martinez", "Amelia Robinson",
            "Henry Clark", "Harper Rodriguez", "Alexander Lewis", "Evelyn Lee", "Daniel Walker"
        ];

        for (let i = 0; i < count; i++) {
            const name = names[i % names.length] + (i >= names.length ? ` ${i}` : "");
            // cleanup email to be safe
            const email = name.toLowerCase().replace(/[^a-z]/g, ".") + `${i}@example.com`;

            await ctx.db.insert("customers", {
                orgId: orgId,
                name: name,
                email: email,
                totalOrders: Math.floor(Math.random() * 20) + 1,
                totalSpend: Math.floor(Math.random() * 500000) + 5000, // $50 - $5000
                firstSeenAt: Date.now() - Math.floor(Math.random() * 10000000000),
                lastSeenAt: Date.now() - Math.floor(Math.random() * 100000000),
                phone: `555-01${10 + i}`,
                address: `${100 + i} Main St, Cityville, ST`
            });
        }

        return `Successfully seeded ${count} customers for org ${orgId}`;
    },
});
