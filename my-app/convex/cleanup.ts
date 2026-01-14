import { mutation } from "./_generated/server";

/**
 * Cleanup orphaned platform admins (for debugging)
 */
export const cleanupOrphanedAdmins = mutation({
    args: {},
    handler: async (ctx) => {
        const admins = await ctx.db.query("platformAdmins").collect();
        let deleted = 0;

        for (const admin of admins) {
            const user = await ctx.db.get(admin.userId);
            if (!user) {
                // Orphaned admin - user doesn't exist
                await ctx.db.delete(admin._id);
                deleted++;
                console.log(`Deleted orphaned admin: ${admin._id}`);
            }
        }

        return { deleted, total: admins.length };
    },
});

/**
 * Delete all platform admins (for fresh start)
 */
export const deleteAllAdmins = mutation({
    args: {},
    handler: async (ctx) => {
        const admins = await ctx.db.query("platformAdmins").collect();

        for (const admin of admins) {
            await ctx.db.delete(admin._id);
        }

        return { deleted: admins.length };
    },
});
