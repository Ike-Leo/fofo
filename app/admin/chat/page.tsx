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
    Search,
    X,
    Hash,
    Headphones,
    MoreVertical,
    UserPlus,
    Check,
    CheckCheck,
    Smile,
    Paperclip,
    Phone,
    Video,
    Info,
    Archive,
    Circle,
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
    const [showSidebar, setShowSidebar] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const conversations = useQuery(
        api.chat.list,
        currentOrg ? { orgId: currentOrg._id } : "skip"
    );

    if (!currentOrg) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="text-muted-foreground" size={32} />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">No Organization Selected</h2>
                    <p className="text-muted-foreground">Please select an organization to access chat.</p>
                </div>
            </div>
        );
    }

    // Filter conversations based on search
    const filteredConversations = conversations?.filter((conv) => {
        const title = conv.title?.toLowerCase() || "";
        const preview = conv.lastMessagePreview?.toLowerCase() || "";
        const query = searchQuery.toLowerCase();
        return title.includes(query) || preview.includes(query);
    }) || [];

    return (
        <div className="h-[calc(100vh-80px)] flex bg-background">
            {/* Sidebar - Conversation List */}
            <div className={`${showSidebar ? "w-80 lg:w-96" : "w-0"} transition-all duration-300 bg-card border-r border-border flex flex-col`}>
                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-border">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                            <MessageSquare className="text-primary" size={24} />
                            Messages
                        </h1>
                        <button
                            onClick={() => setShowNewChat(true)}
                            className="p-2.5 sm:p-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl transition-all shadow-lg hover:shadow-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search messages..."
                            className="w-full pl-10 pr-4 py-2.5 bg-muted/30 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground text-sm min-h-[44px]"
                        />
                    </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto">
                    {!conversations ? (
                        <div className="p-4 text-center text-muted-foreground">
                            <div className="animate-pulse space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-20 bg-muted/30 rounded-xl" />
                                ))}
                            </div>
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-muted/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="text-muted-foreground" size={28} />
                            </div>
                            <p className="text-muted-foreground mb-4">
                                {searchQuery ? "No conversations found" : "No conversations yet"}
                            </p>
                            {!searchQuery && (
                                <button
                                    onClick={() => setShowNewChat(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-colors min-h-[44px]"
                                >
                                    <Plus size={18} />
                                    Start a conversation
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {filteredConversations.map((conv) => (
                                <ConversationItem
                                    key={conv._id}
                                    conversation={conv}
                                    isSelected={selectedConversationId === conv._id}
                                    onClick={() => {
                                        setSelectedConversationId(conv._id);
                                        // Close sidebar on mobile after selection
                                        if (window.innerWidth < 1024) {
                                            setShowSidebar(false);
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-muted/5">
                {selectedConversationId ? (
                    <ChatWindow
                        conversationId={selectedConversationId}
                        orgId={currentOrg._id}
                        onBack={() => {
                            setShowSidebar(true);
                            setSelectedConversationId(null);
                        }}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center p-8 max-w-lg">
                            <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                                <MessageSquare className="text-primary" size={48} />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                                Welcome to Messages
                            </h2>
                            <p className="text-muted-foreground text-base sm:text-lg mb-6">
                                Select a conversation from the sidebar or start a new one to begin messaging with your team or customers.
                            </p>
                            <button
                                onClick={() => setShowNewChat(true)}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl min-h-[48px]"
                            >
                                <Plus size={20} />
                                New Conversation
                            </button>
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
                        setShowSidebar(true);
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
    const hasUnread = conversation.unreadCount > 0;

    return (
        <button
            onClick={onClick}
            className={`w-full p-4 text-left transition-all duration-200 hover:bg-muted/30 ${
                isSelected ? "bg-primary/10 border-l-4 border-primary" : ""
            }`}
        >
            <div className="flex items-start gap-3">
                {/* Avatar with online indicator */}
                <div className="relative flex-shrink-0">
                    <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                            conversation.type === "internal"
                                ? "bg-gradient-to-br from-primary/20 to-primary/5 text-primary"
                                : "bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 text-emerald-500"
                        }`}
                    >
                        {conversation.type === "internal" ? (
                            <Hash size={20} />
                        ) : (
                            <Headphones size={20} />
                        )}
                    </div>
                    {/* Online indicator */}
                    {conversation.status === "active" && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-card" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-foreground truncate text-sm">
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
                    <p className={`text-sm truncate mb-2 ${
                        hasUnread ? "font-medium text-foreground" : "text-muted-foreground"
                    }`}>
                        {conversation.lastMessagePreview || "No messages yet"}
                    </p>
                    <div className="flex items-center gap-2">
                        <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                                conversation.status === "active"
                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                    : conversation.status === "resolved"
                                    ? "bg-primary/10 text-primary border-primary/20"
                                    : "bg-muted/50 text-muted-foreground border-border"
                            }`}
                        >
                            {conversation.status}
                        </span>
                        {hasUnread && (
                            <span className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                                <Circle size={8} fill="currentColor" />
                                {conversation.unreadCount}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </button>
    );
}

function ChatWindow({
    conversationId,
    orgId,
    onBack,
}: {
    conversationId: Id<"conversations">;
    orgId: Id<"organizations">;
    onBack: () => void;
}) {
    const [message, setMessage] = useState("");
    const [showMenu, setShowMenu] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const conversation = useQuery(api.chat.get, { conversationId });
    const messages = useQuery(api.chat.getMessages, { conversationId });
    const sendMessage = useMutation(api.chat.sendMessage);
    const markAsRead = useMutation(api.chat.markAsRead);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

    // Simulate typing indicator
    useEffect(() => {
        if (message.length > 0) {
            setIsTyping(true);
            const timeout = setTimeout(() => setIsTyping(false), 1000);
            return () => clearTimeout(timeout);
        }
    }, [message]);

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
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground">Loading conversation...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Chat Header */}
            <div className="bg-card/80 backdrop-blur-xl border-b border-border px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    {/* Mobile back button */}
                    <button
                        onClick={onBack}
                        className="lg:hidden p-2 -ml-2 hover:bg-muted/50 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                        <X size={20} />
                    </button>

                    <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                            conversation.type === "internal"
                                ? "bg-gradient-to-br from-primary/20 to-primary/5 text-primary"
                                : "bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 text-emerald-500"
                        }`}
                    >
                        {conversation.type === "internal" ? (
                            <Hash size={20} />
                        ) : (
                            <Headphones size={20} />
                        )}
                    </div>
                    <div>
                        <h2 className="font-semibold text-foreground text-sm sm:text-base">
                            {conversation.title ||
                                (conversation.type === "support"
                                    ? conversation.customerInfo?.name || "Support Chat"
                                    : "Team Chat")}
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            {conversation.participantIds.length} participants · {conversation.status}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                    <button
                        onClick={() => setShowInfo(!showInfo)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center hidden sm:flex"
                    >
                        <Info size={18} />
                    </button>
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                        >
                            <MoreVertical size={18} />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-card rounded-2xl shadow-2xl border border-border py-2 z-20 animate-fade-in">
                                <button className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-muted/50 flex items-center gap-3 transition-colors">
                                    <Phone size={16} className="text-primary" />
                                    Voice Call
                                </button>
                                <button className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-muted/50 flex items-center gap-3 transition-colors">
                                    <Video size={16} className="text-primary" />
                                    Video Call
                                </button>
                                <div className="h-px bg-border my-1" />
                                <button className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-muted/50 flex items-center gap-3 transition-colors">
                                    <Archive size={16} />
                                    Archive Chat
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-1 bg-gradient-to-b from-background to-muted/5">
                {messages.map((msg, index) => {
                    const showDate =
                        index === 0 ||
                        formatDate(messages[index - 1].createdAt) !== formatDate(msg.createdAt);

                    return (
                        <div key={msg._id}>
                            {showDate && (
                                <div className="text-center my-6">
                                    <span className="text-xs text-muted-foreground font-medium bg-muted/50 px-3 py-1.5 rounded-full">
                                        {formatDate(msg.createdAt)}
                                    </span>
                                </div>
                            )}

                            {msg.type === "system" ? (
                                <div className="text-center my-4">
                                    <span className="text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
                                        <Circle size={6} fill="currentColor" />
                                        {msg.senderName} {msg.content}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex gap-3 sm:gap-4 mb-6">
                                    {/* Avatar */}
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary text-sm font-bold border-2 border-card shadow-lg">
                                            {msg.senderName.charAt(0).toUpperCase()}
                                        </div>
                                    </div>

                                    {/* Message Content */}
                                    <div className="flex-1 min-w-0 max-w-[85%] sm:max-w-[75%]">
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className="font-bold text-foreground text-sm">
                                                {msg.senderName}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {formatTime(msg.createdAt)}
                                            </span>
                                        </div>

                                        {/* Message Bubble - Twitter Style */}
                                        <div className="bg-muted/30 hover:bg-muted/40 text-foreground text-[15px] leading-relaxed px-4 py-3 rounded-2xl rounded-tl-none shadow-sm transition-colors">
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex gap-3 sm:gap-4 mb-6">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary text-sm font-bold border-2 border-card shadow-lg">
                            You
                        </div>
                        <div className="bg-muted/30 px-4 py-3 rounded-2xl rounded-tl-none">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Message Input - Twitter Style */}
            <div className="bg-card/80 backdrop-blur-xl border-t border-border p-3 sm:p-4">
                <div className="flex items-end gap-2 sm:gap-3 max-w-4xl mx-auto">
                    {/* Attachment Button */}
                    <button className="p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                        <Paperclip size={20} />
                    </button>

                    {/* Input Area */}
                    <div className="flex-1 bg-muted/30 rounded-2xl border-2 border-transparent focus-within:border-primary/50 transition-colors">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Message..."
                            rows={1}
                            className="w-full px-4 py-3 bg-transparent border-0 rounded-2xl focus:outline-none text-foreground placeholder:text-muted-foreground resize-none min-h-[44px] max-h-32"
                            style={{ fieldSizing: "content" }}
                        />
                    </div>

                    {/* Emoji Button */}
                    <button className="p-2.5 text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                        <Smile size={20} />
                    </button>

                    {/* Send Button */}
                    <button
                        onClick={handleSend}
                        disabled={!message.trim()}
                        className="p-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-card w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-hidden flex flex-col slide-up-sheet shadow-2xl">
                {/* Mobile swipe handle */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="w-12 h-1.5 bg-muted rounded-full" />
                </div>

                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-foreground">New Conversation</h2>
                        <p className="text-sm text-muted-foreground mt-1">Start chatting with your team or customers</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
                    {/* Type Selection - Cards */}
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-3">
                            Conversation Type
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setType("internal")}
                                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                                    type === "internal"
                                        ? "border-primary bg-primary/10 shadow-lg"
                                        : "border-border hover:border-primary/50 bg-muted/30"
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                    type === "internal"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground"
                                }`}>
                                    <Hash size={24} />
                                </div>
                                <span className="font-semibold">Team Chat</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setType("support")}
                                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                                    type === "support"
                                        ? "border-primary bg-primary/10 shadow-lg"
                                        : "border-border hover:border-primary/50 bg-muted/30"
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                    type === "support"
                                        ? "bg-emerald-500 text-white"
                                        : "bg-muted text-muted-foreground"
                                }`}>
                                    <Headphones size={24} />
                                </div>
                                <span className="font-semibold">Support</span>
                            </button>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                            Title <span className="text-muted-foreground font-normal">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Project Discussion, Sales Team"
                            className="w-full px-4 py-3 bg-muted/30 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all min-h-[48px]"
                        />
                    </div>

                    {/* Type-specific fields */}
                    {type === "internal" ? (
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">
                                Add Team Members
                            </label>
                            <div className="max-h-48 overflow-y-auto border border-border rounded-xl divide-y divide-border">
                                {!members ? (
                                    <div className="p-4 text-center text-muted-foreground">
                                        <div className="animate-pulse space-y-2">
                                            {[...Array(3)].map((_, i) => (
                                                <div key={i} className="h-12 bg-muted/30 rounded-lg" />
                                            ))}
                                        </div>
                                    </div>
                                ) : members.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">
                                        <UserPlus size={32} className="mx-auto mb-2 opacity-50" />
                                        No team members found
                                    </div>
                                ) : (
                                    members.map((member) => (
                                        <button
                                            key={member.userId}
                                            type="button"
                                            onClick={() => toggleMember(member.userId)}
                                            className={`w-full p-3 sm:p-4 text-left flex items-center justify-between hover:bg-muted/30 transition-colors ${
                                                selectedMembers.includes(member.userId)
                                                    ? "bg-primary/10"
                                                    : ""
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary text-sm font-bold border-2 border-card">
                                                    {member.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground text-sm">
                                                        {member.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {member.role}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                                selectedMembers.includes(member.userId)
                                                    ? "border-primary bg-primary"
                                                    : "border-muted-foreground/30"
                                            }`}>
                                                {selectedMembers.includes(member.userId) && (
                                                    <Check size={14} className="text-white" />
                                                )}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                    Customer Name
                                </label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="John Doe"
                                    required
                                    className="w-full px-4 py-3 bg-muted/30 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all min-h-[48px]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                    Customer Email
                                </label>
                                <input
                                    type="email"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    placeholder="john@example.com"
                                    required
                                    className="w-full px-4 py-3 bg-muted/30 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all min-h-[48px]"
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
                        className="w-full py-3.5 sm:py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl min-h-[52px] flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <MessageSquare size={20} />
                                Start Conversation
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
