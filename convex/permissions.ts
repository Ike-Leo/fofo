import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

/**
 * Available permissions for the system
 * Organized by module with read/write capabilities
 */
export const AVAILABLE_PERMISSIONS = {
    // Dashboard
    "dashboard:read": "View dashboard statistics",

    // Products
    "products:read": "View products",
    "products:write": "Create and edit products",
    "products:delete": "Delete products",

    // Orders
    "orders:read": "View orders",
    "orders:write": "Create and update orders",
    "orders:delete": "Cancel orders",

    // Customers
    "customers:read": "View customers",
    "customers:write": "Edit customer information",

    // Inventory
    "inventory:read": "View inventory",
    "inventory:write": "Adjust inventory levels",

    // Categories
    "categories:read": "View categories",
    "categories:write": "Manage categories",

    // Chat
    "chat:read": "View chat conversations",
    "chat:write": "Send messages",

    // Team
    "team:read": "View team members",
    "team:write": "Manage team members",
    "team:permissions": "Manage member permissions",
} as const;

export type Permission = keyof typeof AVAILABLE_PERMISSIONS;

/**
 * Preset role templates for quick assignment
 */
export const ROLE_TEMPLATES = {
    full_access: {
        name: "Full Access",
        description: "All permissions granted",
        permissions: Object.keys(AVAILABLE_PERMISSIONS) as Permission[],
    },
    sales_manager: {
        name: "Sales Manager",
        description: "Access to orders, customers, and dashboard",
        permissions: [
            "dashboard:read",
            "orders:read",
            "orders:write",
            "customers:read",
            "customers:write",
            "products:read",
            "chat:read",
            "chat:write",
        ] as Permission[],
    },
    inventory_manager: {
        name: "Inventory Manager",
        description: "Full access to products and inventory",
        permissions: [
            "dashboard:read",
            "products:read",
            "products:write",
            "inventory:read",
            "inventory:write",
            "categories:read",
            "categories:write",
        ] as Permission[],
    },
    support_agent: {
        name: "Support Agent",
        description: "Customer support focused access",
        permissions: [
            "orders:read",
            "customers:read",
            "products:read",
            "chat:read",
            "chat:write",
        ] as Permission[],
    },
    viewer: {
        name: "Viewer (Read Only)",
        description: "Can view but not modify anything",
        permissions: [
            "dashboard:read",
            "products:read",
            "orders:read",
            "customers:read",
            "inventory:read",
            "categories:read",
        ] as Permission[],
    },
};

/**
 * Get permissions for a member
 */
export const getMemberPermissions = query({
    args: {
        orgId: v.id("organizations"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const currentUserId = await getAuthUserId(ctx);
        if (!currentUserId) throw new Error("Not authenticated");

        const member = await ctx.db
            .query("organizationMembers")
            .withIndex("by_orgId_userId", (q) =>
                q.eq("orgId", args.orgId).eq("userId", args.userId)
            )
            .first();

        if (!member) {
            return { permissions: [], role: null };
        }

        // Admins have all permissions by default
        if (member.role === "admin") {
            return {
                permissions: Object.keys(AVAILABLE_PERMISSIONS),
                role: member.role,
                isAdmin: true,
            };
        }

        return {
            permissions: member.permissions || [],
            role: member.role,
            isAdmin: false,
        };
    },
});

/**
 * Check if a user has a specific permission
 */
export const hasPermission = query({
    args: {
        orgId: v.id("organizations"),
        permission: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return false;

        const member = await ctx.db
            .query("organizationMembers")
            .withIndex("by_orgId_userId", (q) =>
                q.eq("orgId", args.orgId).eq("userId", userId)
            )
            .first();

        if (!member) return false;

        // Admins have all permissions
        if (member.role === "admin") return true;

        // Check specific permission
        return member.permissions?.includes(args.permission) || false;
    },
});

/**
 * Update member permissions
 * Only org admins can update permissions
 */
export const updatePermissions = mutation({
    args: {
        orgId: v.id("organizations"),
        targetUserId: v.id("users"),
        permissions: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        const currentUserId = await getAuthUserId(ctx);
        if (!currentUserId) throw new Error("Not authenticated");

        // Check if current user is an admin
        const currentMember = await ctx.db
            .query("organizationMembers")
            .withIndex("by_orgId_userId", (q) =>
                q.eq("orgId", args.orgId).eq("userId", currentUserId)
            )
            .first();

        if (!currentMember || currentMember.role !== "admin") {
            throw new Error("Only admins can update permissions");
        }

        // Get target member
        const targetMember = await ctx.db
            .query("organizationMembers")
            .withIndex("by_orgId_userId", (q) =>
                q.eq("orgId", args.orgId).eq("userId", args.targetUserId)
            )
            .first();

        if (!targetMember) {
            throw new Error("Member not found");
        }

        // Cannot modify admin permissions
        if (targetMember.role === "admin") {
            throw new Error("Cannot modify admin permissions");
        }

        // Validate permissions
        const validPermissions = Object.keys(AVAILABLE_PERMISSIONS);
        const invalidPermissions = args.permissions.filter(
            (p) => !validPermissions.includes(p)
        );

        if (invalidPermissions.length > 0) {
            throw new Error(`Invalid permissions: ${invalidPermissions.join(", ")}`);
        }

        // Update permissions
        await ctx.db.patch(targetMember._id, {
            permissions: args.permissions,
        });

        return { success: true };
    },
});

/**
 * Apply a role template to a member
 */
export const applyRoleTemplate = mutation({
    args: {
        orgId: v.id("organizations"),
        targetUserId: v.id("users"),
        templateKey: v.string(),
    },
    handler: async (ctx, args) => {
        const currentUserId = await getAuthUserId(ctx);
        if (!currentUserId) throw new Error("Not authenticated");

        // Check if current user is an admin
        const currentMember = await ctx.db
            .query("organizationMembers")
            .withIndex("by_orgId_userId", (q) =>
                q.eq("orgId", args.orgId).eq("userId", currentUserId)
            )
            .first();

        if (!currentMember || currentMember.role !== "admin") {
            throw new Error("Only admins can apply role templates");
        }

        // Get template
        const template = ROLE_TEMPLATES[args.templateKey as keyof typeof ROLE_TEMPLATES];
        if (!template) {
            throw new Error("Template not found");
        }

        // Get target member
        const targetMember = await ctx.db
            .query("organizationMembers")
            .withIndex("by_orgId_userId", (q) =>
                q.eq("orgId", args.orgId).eq("userId", args.targetUserId)
            )
            .first();

        if (!targetMember) {
            throw new Error("Member not found");
        }

        // Cannot modify admin permissions
        if (targetMember.role === "admin") {
            throw new Error("Cannot modify admin permissions");
        }

        // Apply template permissions
        await ctx.db.patch(targetMember._id, {
            permissions: template.permissions,
        });

        return { success: true, appliedTemplate: template.name };
    },
});

/**
 * Update member role
 */
export const updateMemberRole = mutation({
    args: {
        orgId: v.id("organizations"),
        targetUserId: v.id("users"),
        role: v.union(v.literal("admin"), v.literal("manager"), v.literal("staff")),
    },
    handler: async (ctx, args) => {
        const currentUserId = await getAuthUserId(ctx);
        if (!currentUserId) throw new Error("Not authenticated");

        // Check if current user is an admin
        const currentMember = await ctx.db
            .query("organizationMembers")
            .withIndex("by_orgId_userId", (q) =>
                q.eq("orgId", args.orgId).eq("userId", currentUserId)
            )
            .first();

        if (!currentMember || currentMember.role !== "admin") {
            throw new Error("Only admins can update roles");
        }

        // Get target member
        const targetMember = await ctx.db
            .query("organizationMembers")
            .withIndex("by_orgId_userId", (q) =>
                q.eq("orgId", args.orgId).eq("userId", args.targetUserId)
            )
            .first();

        if (!targetMember) {
            throw new Error("Member not found");
        }

        // Prevent demoting the last admin
        if (targetMember.role === "admin" && args.role !== "admin") {
            const admins = await ctx.db
                .query("organizationMembers")
                .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
                .filter((q) => q.eq(q.field("role"), "admin"))
                .collect();

            if (admins.length <= 1) {
                throw new Error("Cannot demote the last admin");
            }
        }

        // Update role
        await ctx.db.patch(targetMember._id, {
            role: args.role,
            // Clear custom permissions if promoting to admin
            permissions: args.role === "admin" ? undefined : targetMember.permissions,
        });

        return { success: true };
    },
});

/**
 * List organization members with their permissions
 */
export const listMembers = query({
    args: {
        orgId: v.id("organizations"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Verify user is a member
        const currentMember = await ctx.db
            .query("organizationMembers")
            .withIndex("by_orgId_userId", (q) =>
                q.eq("orgId", args.orgId).eq("userId", userId)
            )
            .first();

        if (!currentMember) {
            throw new Error("Not a member of this organization");
        }

        const members = await ctx.db
            .query("organizationMembers")
            .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
            .collect();

        // Get user details for each member
        const memberDetails = await Promise.all(
            members.map(async (member) => {
                const user = await ctx.db.get(member.userId);
                return {
                    _id: member._id,
                    userId: member.userId,
                    name: user?.name || user?.email || "Unknown",
                    email: user?.email || "",
                    role: member.role,
                    permissions: member.permissions || [],
                    joinedAt: member.joinedAt,
                    isAdmin: member.role === "admin",
                };
            })
        );

        // Sort: admins first, then by join date
        return memberDetails.sort((a, b) => {
            if (a.role === "admin" && b.role !== "admin") return -1;
            if (b.role === "admin" && a.role !== "admin") return 1;
            return a.joinedAt - b.joinedAt;
        });
    },
});

/**
 * Get available permissions and role templates
 */
export const getAvailablePermissions = query({
    args: {},
    handler: async () => {
        return {
            permissions: AVAILABLE_PERMISSIONS,
            roleTemplates: ROLE_TEMPLATES,
        };
    },
});

/**
 * Remove a member from the organization
 */
export const removeMember = mutation({
    args: {
        orgId: v.id("organizations"),
        targetUserId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const currentUserId = await getAuthUserId(ctx);
        if (!currentUserId) throw new Error("Not authenticated");

        // Check if current user is an admin
        const currentMember = await ctx.db
            .query("organizationMembers")
            .withIndex("by_orgId_userId", (q) =>
                q.eq("orgId", args.orgId).eq("userId", currentUserId)
            )
            .first();

        if (!currentMember || currentMember.role !== "admin") {
            throw new Error("Only admins can remove members");
        }

        // Get target member
        const targetMember = await ctx.db
            .query("organizationMembers")
            .withIndex("by_orgId_userId", (q) =>
                q.eq("orgId", args.orgId).eq("userId", args.targetUserId)
            )
            .first();

        if (!targetMember) {
            throw new Error("Member not found");
        }

        // Cannot remove self if last admin
        if (targetMember.userId === currentUserId) {
            const admins = await ctx.db
                .query("organizationMembers")
                .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
                .filter((q) => q.eq(q.field("role"), "admin"))
                .collect();

            if (admins.length <= 1) {
                throw new Error("Cannot remove the last admin");
            }
        }

        // Remove member
        await ctx.db.delete(targetMember._id);

        return { success: true };
    },
});
