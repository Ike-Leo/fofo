"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { Clock, TrendingUp, TrendingDown, Archive, Edit, Plus, XCircle, ShoppingCart } from "lucide-react";

interface ProductActivityLogProps {
    productId: Id<"products">;
}

export default function ProductActivityLog({ productId }: ProductActivityLogProps) {
    const [filter, setFilter] = useState<string>("all");
    const activities = useQuery(api.productActivities.list, { productId });

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case "created":
                return <Plus className="text-emerald-500" size={18} />;
            case "updated":
                return <Edit className="text-blue-500" size={18} />;
            case "stock_added":
                return <TrendingUp className="text-emerald-500" size={18} />;
            case "stock_removed":
                return <TrendingDown className="text-red-500" size={18} />;
            case "sold":
                return <ShoppingCart className="text-purple-500" size={18} />;
            case "cancelled":
                return <XCircle className="text-red-500" size={18} />;
            case "archived":
                return <Archive className="text-muted-foreground" size={18} />;
            default:
                return <Clock className="text-muted-foreground" size={18} />;
        }
    };

    const filteredActivities = activities?.filter((activity) => {
        if (filter === "all") return true;
        if (filter === "stock") return activity.type === "stock_added" || activity.type === "stock_removed" || activity.type === "sold";
        if (filter === "changes") return activity.type === "created" || activity.type === "updated" || activity.type === "archived";
        return true;
    }) || [];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Clock size={20} className="text-muted-foreground" />
                    Activity Log
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${filter === "all"
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-card text-muted-foreground hover:bg-muted/50 border border-border"
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter("stock")}
                        className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${filter === "stock"
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-card text-muted-foreground hover:bg-muted/50 border border-border"
                            }`}
                    >
                        Stock
                    </button>
                    <button
                        onClick={() => setFilter("changes")}
                        className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${filter === "changes"
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-card text-muted-foreground hover:bg-muted/50 border border-border"
                            }`}
                    >
                        Changes
                    </button>
                </div>
            </div>

            {!activities ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredActivities.length === 0 ? (
                <div className="text-center py-8 bg-card rounded-xl border border-border">
                    <Clock className="mx-auto text-muted-foreground mb-2" size={32} />
                    <p className="text-sm text-muted-foreground">No activity yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredActivities.map((activity) => (
                        <div
                            key={activity._id}
                            className="flex items-start gap-3 p-3 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors"
                        >
                            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-muted/30 flex items-center justify-center">
                                {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground">{activity.description}</p>
                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                    <span>{activity.userName}</span>
                                    <span>•</span>
                                    <span>{formatDate(activity.createdAt)}</span>
                                    {activity.metadata?.variantName && (
                                        <>
                                            <span>•</span>
                                            <span className="font-medium text-foreground">{activity.metadata.variantName}</span>
                                        </>
                                    )}
                                    {activity.metadata?.quantity !== undefined && (
                                        <>
                                            <span>•</span>
                                            <span className={activity.type === "stock_removed" || activity.type === "sold" ? "text-red-500" : "text-emerald-500"}>
                                                {activity.type === "stock_removed" || activity.type === "sold" ? "-" : "+"}
                                                {activity.metadata.quantity}
                                            </span>
                                        </>
                                    )}
                                    {activity.metadata?.orderNumber && (
                                        <>
                                            <span>•</span>
                                            <span className="font-mono text-muted-foreground">#{activity.metadata.orderNumber}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
