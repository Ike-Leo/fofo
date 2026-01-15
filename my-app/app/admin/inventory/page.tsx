/* eslint-disable */
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useOrganization } from "@/components/OrganizationProvider";
import {
    AlertTriangle,
    ArrowUpDown,
    History,
    Package,
    Search,
    SlidersHorizontal,
    X
} from "lucide-react";
import Image from "next/image";

export default function InventoryPage() {
    const { currentOrg } = useOrganization();
    const [lowStockOnly, setLowStockOnly] = useState(false);
    const [adjustmentItem, setAdjustmentItem] = useState<any | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "low" | "out">("all");

    const inventory = useQuery(
        api.inventory.list,
        currentOrg
            ? { orgId: currentOrg._id, lowStockThreshold: lowStockOnly ? 10 : undefined }
            : "skip"
    );

    // Filter inventory based on search and stock status
    const filteredInventory = inventory?.filter(item => {
        // Stock status filter
        if (stockFilter !== "all") {
            if (stockFilter === "out" && item.stock !== 0) return false;
            if (stockFilter === "low" && (item.stock === 0 || item.stock > 10)) return false;
            if (stockFilter === "in_stock" && item.stock <= 10) return false;
        }

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const matchesProductName = item.productName.toLowerCase().includes(query);
            const matchesSku = item.sku.toLowerCase().includes(query);
            const matchesVariantName = item.variantName.toLowerCase().includes(query);
            return matchesProductName || matchesSku || matchesVariantName;
        }

        return true;
    });

    // Count by status
    const statusCounts = inventory ? {
        all: inventory.length,
        in_stock: inventory.filter(i => i.stock > 10).length,
        low: inventory.filter(i => i.stock > 0 && i.stock <= 10).length,
        out: inventory.filter(i => i.stock === 0).length,
    } : { all: 0, in_stock: 0, low: 0, out: 0 };

    if (!currentOrg) {
        return (
            <div className="p-12 text-center">
                <h2 className="text-xl font-semibold text-foreground mb-2">No Organization Selected</h2>
                <p className="text-muted-foreground">Please select an organization to manage inventory.</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Inventory</h1>
                    <p className="text-muted-foreground mt-1">Real-time stock management for {currentOrg.name}</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setLowStockOnly(!lowStockOnly)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${lowStockOnly
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-card text-muted-foreground border-border hover:bg-muted/30"
                            }`}
                    >
                        <AlertTriangle size={16} className={lowStockOnly ? "fill-amber-700" : ""} />
                        {lowStockOnly ? "Low Stock Only" : "Show Low Stock"}
                    </button>
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by product name, SKU, or variant..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-input"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Stock Status Filter */}
                    <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                        {[
                            { value: "all", label: "All", count: statusCounts.all },
                            { value: "in_stock", label: "In Stock", count: statusCounts.in_stock },
                            { value: "low", label: "Low", count: statusCounts.low },
                            { value: "out", label: "Out", count: statusCounts.out },
                        ].map((filter) => (
                            <button
                                key={filter.value}
                                onClick={() => setStockFilter(filter.value as typeof stockFilter)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${stockFilter === filter.value
                                    ? "bg-card text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {filter.label}
                                <span className={`ml-1 text-xs ${stockFilter === filter.value ? "text-muted-foreground" : "text-muted-foreground"}`}>
                                    ({filter.count})
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results count */}
                {inventory && (
                    <div className="mt-3 text-sm text-muted-foreground">
                        Showing {filteredInventory?.length || 0} of {inventory.length} items
                        {searchQuery && <span className="ml-1">matching &quot;{searchQuery}&quot;</span>}
                    </div>
                )}
            </div>

            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/30 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 font-semibold text-xs text-muted-foreground uppercase tracking-wider">SKU / Variant</th>
                                <th className="px-6 py-4 font-semibold text-xs text-muted-foreground uppercase tracking-wider text-right">Stock Level</th>
                                <th className="px-6 py-4 font-semibold text-xs text-muted-foreground uppercase tracking-wider text-right">Status</th>
                                <th className="px-6 py-4 font-semibold text-xs text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {!inventory ? (
                                // Loading State
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-10 w-40 bg-slate-100 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-6 w-12 bg-slate-100 rounded ml-auto"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-6 w-20 bg-slate-100 rounded ml-auto"></div></td>
                                        <td className="px-6 py-4"></td>
                                    </tr>
                                ))
                            ) : filteredInventory && filteredInventory.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                                        {searchQuery || stockFilter !== "all"
                                            ? "No items match your search criteria."
                                            : "No inventory found."}
                                    </td>
                                </tr>
                            ) : (
                                filteredInventory?.map((item) => (
                                    <tr key={item._id} className="hover:bg-muted/30/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 border border-border overflow-hidden">
                                                    {item.images ? (
                                                        <img src={item.images} alt={item.productName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package size={18} className="text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-foreground">{item.productName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-xs text-muted-foreground bg-slate-100 px-1.5 py-0.5 rounded inline-block mb-1">
                                                {item.sku}
                                            </div>
                                            <div className="text-sm text-muted-foreground">{item.variantName}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`text-lg font-bold font-mono ${item.stock === 0 ? "text-red-600" :
                                                item.stock <= 10 ? "text-amber-600" :
                                                    "text-foreground"
                                                }`}>
                                                {item.stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {item.stock === 0 ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                                                    Out of Stock
                                                </span>
                                            ) : item.stock <= 10 ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                                                    Low Stock
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                    In Stock
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setAdjustmentItem(item)}
                                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium px-2 py-1 hover:bg-blue-50 rounded"
                                                >
                                                    Adjust
                                                </button>
                                                <button
                                                    className="text-muted-foreground hover:text-muted-foreground p-1.5 hover:bg-accent/50 rounded"
                                                    title="View History (Next Sprint)"
                                                >
                                                    <History size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {adjustmentItem && (
                <AdjustmentModal
                    item={adjustmentItem}
                    onClose={() => setAdjustmentItem(null)}
                />
            )}
        </div>
    );
}

function AdjustmentModal({ item, onClose }: { item: any, onClose: () => void }) {
    const adjustStock = useMutation(api.inventory.adjust);
    const [type, setType] = useState<"add" | "remove">("add");
    const [quantity, setQuantity] = useState("1");
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const qty = parseInt(quantity);
            if (isNaN(qty) || qty <= 0) throw new Error("Invalid quantity");

            const delta = type === "add" ? qty : -qty;
            const reasons = {
                add: "received",
                remove: "sold" // or adjusted
            };
            // Map simple adjust UI to backend types
            // If removing, maybe "audit" or "return" or just "adjusted"
            // Let's us "adjusted" for generic corrections unless specific reason given

            await adjustStock({
                variantId: item._id,
                type: "adjusted", // Default to manual adjustment
                quantity: delta,
                reason: reason || `Manual ${type} adjustment`,
            });
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-card rounded-xl shadow-xl max-w-md w-full overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex justify-between items-center">
                    <h3 className="font-semibold text-lg text-foreground">Adjust Stock</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-muted-foreground">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="p-3 bg-muted/30 rounded-xl border border-slate-100">
                        <div className="text-sm font-medium text-foreground">{item.productName}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{item.variantName} • {item.sku}</div>
                        <div className="mt-2 text-sm">
                            Current Stock: <span className="font-bold">{item.stock}</span>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setType("add")}
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${type === "add"
                                ? "bg-card text-emerald-700 shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Add Stock
                        </button>
                        <button
                            type="button"
                            onClick={() => setType("remove")}
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${type === "remove"
                                ? "bg-card text-red-700 shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Remove Stock
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Quantity
                        </label>
                        <input
                            type="number"
                            min="1"
                            required
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full px-4 py-2.5 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Reason (Optional)
                        </label>
                        <input
                            type="text"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g. Stock count correction"
                            className="w-full px-4 py-2.5 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/30 rounded-xl"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors ${type === "add"
                                ? "bg-emerald-600 hover:bg-emerald-700"
                                : "bg-red-600 hover:bg-red-700"
                                } disabled:opacity-50`}
                        >
                            {isSubmitting ? "Saving..." : "Confirm Adjustment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
