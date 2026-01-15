import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

/**
 * List conversations for an organization
 * Returns conversations where current user is a participant
 */
export const list = query({
    args: {
        orgId: v.id("organizations"),
        type: v.optional(v.union(v.literal("internal"), v.literal("support"))),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        let conversationsQuery = ctx.db
            .query("conversations")
            .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId));

        const conversations = await conversationsQuery.collect();

        // Filter to only conversations where user is a participant
        const userConversations = conversations.filter(
            (conv) =>
                conv.participantIds.includes(userId) &&
                (!args.type || conv.type === args.type)
        );

        // Sort by last message (most recent first)
        return userConversations.sort(
            (a, b) => (b.lastMessageAt || b.createdAt) - (a.lastMessageAt || a.createdAt)
        );
    },
});

/**
 * Get a single conversation with its messages
 */
export const get = query({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) throw new Error("Conversation not found");

        // Verify user is a participant
        if (!conversation.participantIds.includes(userId)) {
            throw new Error("Not authorized to view this conversation");
        }

        return conversation;
    },
});

/**
 * Get messages for a conversation (with pagination)
 */
export const getMessages = query({
    args: {
        conversationId: v.id("conversations"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) throw new Error("Conversation not found");

        // Verify user is a participant
        if (!conversation.participantIds.includes(userId)) {
            throw new Error("Not authorized to view this conversation");
        }

        const limit = args.limit || 50;

        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversationId_createdAt", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .order("desc")
            .take(limit);

        // Return in chronological order for display
        return messages.reverse();
    },
});

/**
 * Create a new conversation
 */
export const create = mutation({
    args: {
        orgId: v.id("organizations"),
        type: v.union(v.literal("internal"), v.literal("support")),
        title: v.optional(v.string()),
        participantIds: v.array(v.id("users")),
        customerInfo: v.optional(
            v.object({
                name: v.string(),
                email: v.string(),
                customerId: v.optional(v.id("customers")),
            })
        ),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Ensure creator is in participants
        const participantIds = args.participantIds.includes(userId)
            ? args.participantIds
            : [...args.participantIds, userId];

        const now = Date.now();

        const conversationId = await ctx.db.insert("conversations", {
            orgId: args.orgId,
            type: args.type,
            title: args.title,
            participantIds,
            customerInfo: args.customerInfo,
            status: "active",
            createdAt: now,
            updatedAt: now,
        });

        // Create system message
        const user = await ctx.db.get(userId);
        if (user) {
            await ctx.db.insert("messages", {
                conversationId,
                orgId: args.orgId,
                senderId: userId,
                senderName: user.name || user.email || "User",
                content: "started the conversation",
                type: "system",
                isRead: false,
                readBy: [userId],
                createdAt: now,
            });
        }

        return conversationId;
    },
});

/**
 * Send a message in a conversation
 */
export const sendMessage = mutation({
    args: {
        conversationId: v.id("conversations"),
        content: v.string(),
        type: v.optional(v.union(v.literal("text"), v.literal("attachment"))),
        attachmentUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) throw new Error("Conversation not found");

        // Verify user is a participant
        if (!conversation.participantIds.includes(userId)) {
            throw new Error("Not authorized to send messages in this conversation");
        }

        const user = await ctx.db.get(userId);
        if (!user) throw new Error("User not found");

        const now = Date.now();
        const senderName = user.name || user.email || "User";

        // Create message
        const messageId = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            orgId: conversation.orgId,
            senderId: userId,
            senderName,
            content: args.content,
            type: args.type || "text",
            attachmentUrl: args.attachmentUrl,
            isRead: false,
            readBy: [userId],
            createdAt: now,
        });

        // Update conversation with last message info
        await ctx.db.patch(args.conversationId, {
            lastMessageAt: now,
            lastMessagePreview:
                args.content.length > 50
                    ? args.content.substring(0, 50) + "..."
                    : args.content,
            updatedAt: now,
        });

        return messageId;
    },
});

/**
 * Mark messages as read
 */
export const markAsRead = mutation({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) throw new Error("Conversation not found");

        if (!conversation.participantIds.includes(userId)) {
            throw new Error("Not authorized");
        }

        // Get unread messages
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .collect();

        // Mark all as read by this user
        for (const message of messages) {
            if (!message.readBy.includes(userId)) {
                await ctx.db.patch(message._id, {
                    readBy: [...message.readBy, userId],
                    isRead: true,
                });
            }
        }

        return { success: true };
    },
});

/**
 * Add participant to conversation (internal chats only)
 */
export const addParticipant = mutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const currentUserId = await getAuthUserId(ctx);
        if (!currentUserId) throw new Error("Not authenticated");

        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) throw new Error("Conversation not found");

        if (!conversation.participantIds.includes(currentUserId)) {
            throw new Error("Not authorized");
        }

        if (conversation.participantIds.includes(args.userId)) {
            return { success: true, message: "User already in conversation" };
        }

        const newUser = await ctx.db.get(args.userId);
        if (!newUser) throw new Error("User not found");

        const now = Date.now();

        // Add participant
        await ctx.db.patch(args.conversationId, {
            participantIds: [...conversation.participantIds, args.userId],
            updatedAt: now,
        });

        // Add system message
        await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            orgId: conversation.orgId,
            senderId: currentUserId,
            senderName: "System",
            content: `${newUser.name || newUser.email || "User"} was added to the conversation`,
            type: "system",
            isRead: false,
            readBy: [currentUserId],
            createdAt: now,
        });

        return { success: true };
    },
});

/**
 * Update conversation status (archive, resolve)
 */
export const updateStatus = mutation({
    args: {
        conversationId: v.id("conversations"),
        status: v.union(
            v.literal("active"),
            v.literal("archived"),
            v.literal("resolved")
        ),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) throw new Error("Conversation not found");

        if (!conversation.participantIds.includes(userId)) {
            throw new Error("Not authorized");
        }

        await ctx.db.patch(args.conversationId, {
            status: args.status,
            updatedAt: Date.now(),
        });

        return { success: true };
    },
});

/**
 * Get organization members for starting new conversations
 */
export const getOrgMembers = query({
    args: {
        orgId: v.id("organizations"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const members = await ctx.db
            .query("organizationMembers")
            .withIndex("by_orgId_userId", (q) => q.eq("orgId", args.orgId))
            .collect();

        // Get user details for each member
        const memberDetails = await Promise.all(
            members.map(async (member) => {
                const user = await ctx.db.get(member.userId);
                return user
                    ? {
                        userId: member.userId,
                        name: user.name || user.email || "User",
                        email: user.email,
                        role: member.role,
                    }
                    : null;
            })
        );

        return memberDetails.filter((m): m is NonNullable<typeof m> => m !== null);
    },
});

/**
 * Get unread message count for badge display
 */
export const getUnreadCount = query({
    args: {
        orgId: v.id("organizations"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return 0;

        const conversations = await ctx.db
            .query("conversations")
            .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
            .collect();

        const userConversations = conversations.filter((conv) =>
            conv.participantIds.includes(userId)
        );

        let unreadCount = 0;

        for (const conv of userConversations) {
            const messages = await ctx.db
                .query("messages")
                .withIndex("by_conversationId", (q) =>
                    q.eq("conversationId", conv._id)
                )
                .collect();

            for (const msg of messages) {
                if (!msg.readBy.includes(userId)) {
                    unreadCount++;
                }
            }
        }

        return unreadCount;
    },
});
