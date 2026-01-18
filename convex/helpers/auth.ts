import { QueryCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * Checks if a user is a platform admin.
 * @param ctx - The query context
 * @param userId - The user ID to check
 * @returns true if the user is a platform admin, false otherwise
 */
export async function isPlatformAdmin(
    ctx: QueryCtx,
    userId: Id<"users">
): Promise<boolean> {
    const admin = await ctx.db
        .query("platformAdmins")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();
    return !!admin;
}

/**
 * Gets a user's role in an organization.
 * @param ctx - The query context
 * @param userId - The user ID
 * @param orgId - The organization ID
 * @returns The role ('admin' | 'manager' | 'staff') or null if not a member
 */
export async function getOrgRole(
    ctx: QueryCtx,
    userId: Id<"users">,
    orgId: Id<"organizations">
): Promise<"admin" | "manager" | "staff" | null> {
    const membership = await ctx.db
        .query("organizationMembers")
        .withIndex("by_orgId_userId", (q) =>
            q.eq("orgId", orgId).eq("userId", userId)
        )
        .first();
    return membership?.role ?? null;
}
