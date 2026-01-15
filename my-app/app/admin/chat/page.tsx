/* eslint-disable */
"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useOrganization } from "@/components/OrganizationProvider";
import {
    MessageSquare,
    Send,
    Plus,
    Users,
    Search,
    Check,
    CheckCheck,
    X,
    Headphones,
    Hash,
    MoreVertical,
    UserPlus,
    Archive,
    CheckCircle2,
} from "lucide-react";

const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
    } else {
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
        });
    }
};

export default function ChatPage() {
    const { currentOrg } = useOrganization();
    const [selectedConversationId, setSelectedConversationId] = useState<Id<"conversations"> | null>(null);
    const [showNewChat, setShowNewChat] = useState(false);
    const [filterType, setFilterType] = useState<"all" | "internal" | "support">("all");

    const conversations = useQuery(
        api.chat.list,
        currentOrg
            ? { orgId: currentOrg._id, type: filterType === "all" ? undefined : filterType }
            : "skip"
    );

    if (!currentOrg) {
        return (
            <div className="p-12 text-center text-muted-foreground">
                Select an organization to access chat.
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-80px)] flex bg-accent/50">
            {/* Sidebar - Conversation List */}
            <div className="w-80 bg-white border-r border-border flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <MessageSquare className="text-primary" size={24} />
                            Messages
                        </h1>
                        <button
                            onClick={() => setShowNewChat(true)}
                            className="p-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    {/* Type Filter */}
                    <div className="flex gap-1 bg-muted rounded-xl p-1">
                        {[
                            { value: "all", label: "All" },
                            { value: "internal", label: "Team", icon: Hash },
                            { value: "support", label: "Support", icon: Headphones },
                        ].map((filter) => (
                            <button
                                key={filter.value}
                                onClick={() => setFilterType(filter.value as typeof filterType)}
                                className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1 ${filterType === filter.value
                                        ? "bg-white text-primary shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {filter.icon && <filter.icon size={14} />}
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto">
                    {!conversations ? (
                        <div className="p-4 text-center text-muted-foreground animate-pulse">
                            Loading conversations...
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="p-8 text-center">
                            <MessageSquare className="mx-auto text-muted-foreground mb-3" size={40} />
                            <p className="text-muted-foreground">No conversations yet</p>
                            <button
                                onClick={() => setShowNewChat(true)}
                                className="mt-3 text-primary hover:text-primary text-sm font-medium"
                            >
                                Start a new conversation
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {conversations.map((conv) => (
                                <ConversationItem
                                    key={conv._id}
                                    conversation={conv}
                                    isSelected={selectedConversationId === conv._id}
                                    onClick={() => setSelectedConversationId(conv._id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedConversationId ? (
                    <ChatWindow
                        conversationId={selectedConversationId}
                        orgId={currentOrg._id}
                        onClose={() => setSelectedConversationId(null)}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-accent/50">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="text-primary" size={40} />
                            </div>
                            <h2 className="text-xl font-semibold text-foreground mb-2">
                                Select a conversation
                            </h2>
                            <p className="text-muted-foreground max-w-sm">
                                Choose a conversation from the sidebar or start a new one to begin messaging.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* New Chat Modal */}
            {showNewChat && (
                <NewChatModal
                    orgId={currentOrg._id}
                    onClose={() => setShowNewChat(false)}
                    onCreated={(id) => {
                        setSelectedConversationId(id);
                        setShowNewChat(false);
                    }}
                />
            )}
        </div>
    );
}

function ConversationItem({
    conversation,
    isSelected,
    onClick,
}: {
    conversation: any;
    isSelected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full p-4 text-left hover:bg-accent/50 transition-colors ${isSelected ? "bg-primary/10 border-l-4 border-primary" : ""
                }`}
        >
            <div className="flex items-start gap-3">
                <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${conversation.type === "internal"
                            ? "bg-primary/10 text-primary"
                            : "bg-emerald-100/dark:bg-emerald-900/30 text-emerald-600"
                        }`}
                >
                    {conversation.type === "internal" ? (
                        <Hash size={18} />
                    ) : (
                        <Headphones size={18} />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-foreground truncate">
                            {conversation.title ||
                                (conversation.type === "support"
                                    ? conversation.customerInfo?.name || "Support Chat"
                                    : "Team Chat")}
                        </h3>
                        {conversation.lastMessageAt && (
                            <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                                {formatDate(conversation.lastMessageAt)}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessagePreview || "No messages yet"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        <span
                            className={`text-xs px-2 py-0.5 rounded-full ${conversation.status === "active"
                                    ? "bg-emerald-100/dark:bg-emerald-900/30 text-emerald-700"
                                    : conversation.status === "resolved"
                                        ? "bg-primary/10 text-primary"
                                        : "bg-muted text-muted-foreground"
                                }`}
                        >
                            {conversation.status}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users size={12} />
                            {conversation.participantIds.length}
                        </span>
                    </div>
                </div>
            </div>
        </button>
    );
}

function ChatWindow({
    conversationId,
    orgId,
    onClose,
}: {
    conversationId: Id<"conversations">;
    orgId: Id<"organizations">;
    onClose: () => void;
}) {
    const [message, setMessage] = useState("");
    const [showMenu, setShowMenu] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const conversation = useQuery(api.chat.get, { conversationId });
    const messages = useQuery(api.chat.getMessages, { conversationId });
    const sendMessage = useMutation(api.chat.sendMessage);
    const markAsRead = useMutation(api.chat.markAsRead);
    const updateStatus = useMutation(api.chat.updateStatus);

    // Mark as read when viewing
    useEffect(() => {
        if (conversationId) {
            markAsRead({ conversationId });
        }
    }, [conversationId, markAsRead]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!message.trim()) return;

        try {
            await sendMessage({
                conversationId,
                content: message.trim(),
            });
            setMessage("");
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!conversation || !messages) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <>
            {/* Chat Header */}
            <div className="bg-white border-b border-border px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${conversation.type === "internal"
                                ? "bg-primary/10 text-primary"
                                : "bg-emerald-100/dark:bg-emerald-900/30 text-emerald-600"
                            }`}
                    >
                        {conversation.type === "internal" ? (
                            <Hash size={20} />
                        ) : (
                            <Headphones size={20} />
                        )}
                    </div>
                    <div>
                        <h2 className="font-semibold text-foreground">
                            {conversation.title ||
                                (conversation.type === "support"
                                    ? conversation.customerInfo?.name || "Support Chat"
                                    : "Team Chat")}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {conversation.participantIds.length} participants
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2 text-muted-foreground hover:text-muted-foreground hover:bg-muted rounded-xl transition-colors"
                        >
                            <MoreVertical size={20} />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-border py-1 z-10">
                                <button
                                    onClick={() => {
                                        updateStatus({ conversationId, status: "resolved" });
                                        setShowMenu(false);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-accent/50 flex items-center gap-2"
                                >
                                    <CheckCircle2 size={16} className="text-emerald-600" />
                                    Mark Resolved
                                </button>
                                <button
                                    onClick={() => {
                                        updateStatus({ conversationId, status: "archived" });
                                        setShowMenu(false);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-accent/50 flex items-center gap-2"
                                >
                                    <Archive size={16} className="text-muted-foreground" />
                                    Archive
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-accent/50">
                {messages.map((msg, index) => {
                    const showDate =
                        index === 0 ||
                        formatDate(messages[index - 1].createdAt) !== formatDate(msg.createdAt);

                    return (
                        <div key={msg._id}>
                            {showDate && (
                                <div className="text-center my-4">
                                    <span className="text-xs text-muted-foreground bg-white px-3 py-1 rounded-full">
                                        {formatDate(msg.createdAt)}
                                    </span>
                                </div>
                            )}

                            {msg.type === "system" ? (
                                <div className="text-center">
                                    <span className="text-xs text-muted-foreground italic">
                                        {msg.senderName} {msg.content}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium flex-shrink-0">
                                        {msg.senderName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 max-w-[70%]">
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className="font-medium text-foreground text-sm">
                                                {msg.senderName}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {formatTime(msg.createdAt)}
                                            </span>
                                        </div>
                                        <div className="bg-white rounded-xl rounded-tl-none px-4 py-2.5 shadow-sm">
                                            <p className="text-foreground">{msg.content}</p>
                                        </div>
                                        <div className="flex justify-end mt-1">
                                            {msg.readBy.length > 1 ? (
                                                <CheckCheck size={14} className="text-primary" />
                                            ) : (
                                                <Check size={14} className="text-muted-foreground" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-border p-4">
                <div className="flex items-center gap-3">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        rows={1}
                        className="flex-1 resize-none border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!message.trim()}
                        className="p-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </>
    );
}

function NewChatModal({
    orgId,
    onClose,
    onCreated,
}: {
    orgId: Id<"organizations">;
    onClose: () => void;
    onCreated: (id: Id<"conversations">) => void;
}) {
    const [type, setType] = useState<"internal" | "support">("internal");
    const [title, setTitle] = useState("");
    const [selectedMembers, setSelectedMembers] = useState<Id<"users">[]>([]);
    const [customerName, setCustomerName] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const members = useQuery(api.chat.getOrgMembers, { orgId });
    const createConversation = useMutation(api.chat.create);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const conversationId = await createConversation({
                orgId,
                type,
                title: title || undefined,
                participantIds: type === "internal" ? selectedMembers : [],
                customerInfo:
                    type === "support"
                        ? {
                            name: customerName,
                            email: customerEmail,
                        }
                        : undefined,
            });
            onCreated(conversationId);
        } catch (error) {
            console.error("Failed to create conversation:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleMember = (userId: Id<"users">) => {
        setSelectedMembers((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">New Conversation</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-muted-foreground hover:text-muted-foreground hover:bg-muted rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Conversation Type
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setType("internal")}
                                className={`flex-1 py-3 px-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-colors ${type === "internal"
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border text-muted-foreground hover:border-input"
                                    }`}
                            >
                                <Hash size={24} />
                                <span className="font-medium">Team Chat</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setType("support")}
                                className={`flex-1 py-3 px-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-colors ${type === "support"
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border text-muted-foreground hover:border-input"
                                    }`}
                            >
                                <Headphones size={24} />
                                <span className="font-medium">Support</span>
                            </button>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Title (optional)
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Project Discussion"
                            className="w-full border border-border rounded-xl px-4 py-2.5.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    {/* Type-specific fields */}
                    {type === "internal" ? (
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Add Team Members
                            </label>
                            <div className="max-h-40 overflow-y-auto border border-border rounded-xl divide-y divide-slate-100">
                                {!members ? (
                                    <div className="p-4 text-center text-muted-foreground animate-pulse">
                                        Loading members...
                                    </div>
                                ) : members.length === 0 ? (
                                    <div className="p-4 text-center text-muted-foreground">
                                        No team members found
                                    </div>
                                ) : (
                                    members.map((member) => (
                                        <button
                                            key={member.userId}
                                            type="button"
                                            onClick={() => toggleMember(member.userId)}
                                            className={`w-full p-3 text-left flex items-center justify-between hover:bg-accent/50 transition-colors ${selectedMembers.includes(member.userId)
                                                    ? "bg-primary/10"
                                                    : ""
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                                                    {member.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground text-sm">
                                                        {member.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {member.role}
                                                    </p>
                                                </div>
                                            </div>
                                            {selectedMembers.includes(member.userId) && (
                                                <Check size={18} className="text-primary" />
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Customer Name
                                </label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="John Doe"
                                    required
                                    className="w-full border border-border rounded-xl px-4 py-2.5.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Customer Email
                                </label>
                                <input
                                    type="email"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    placeholder="john@example.com"
                                    required
                                    className="w-full border border-border rounded-xl px-4 py-2.5.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={
                            isSubmitting ||
                            (type === "support" && (!customerName || !customerEmail))
                        }
                        className="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Creating..." : "Start Conversation"}
                    </button>
                </form>
            </div>
        </div>
    );
}
