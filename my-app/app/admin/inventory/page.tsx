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
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Inventory</h1>
                    <p className="text-muted-foreground mt-1">Real-time stock management for <span className="capitalize">{currentOrg.name}</span></p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setLowStockOnly(!lowStockOnly)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all min-h-[44px] ${lowStockOnly
                            ? "bg-amber-100 text-amber-700 shadow-inner"
                            : "bg-card text-muted-foreground border border-border hover:bg-muted/50 hover:text-foreground shadow-sm"
                            }`}
                    >
                        <AlertTriangle size={18} className={lowStockOnly ? "fill-amber-700 stroke-amber-700" : ""} />
                        {lowStockOnly ? "Low Stock Only" : "Show Low Stock"}
                    </button>
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-6">
                <div className="flex flex-col gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            inputMode="search"
                            placeholder="Search by product name, SKU, or variant..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 min-h-[48px] bg-background border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Stock Status Filter - Horizontally scrollable on mobile */}
                    <div className="flex items-center gap-1 bg-muted rounded-xl p-1 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                        {[
                            { value: "all", label: "All", count: statusCounts.all },
                            { value: "in_stock", label: "In Stock", count: statusCounts.in_stock },
                            { value: "low", label: "Low", count: statusCounts.low },
                            { value: "out", label: "Out", count: statusCounts.out },
                        ].map((filter) => (
                            <button
                                key={filter.value}
                                onClick={() => setStockFilter(filter.value as typeof stockFilter)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap min-h-[44px] ${stockFilter === filter.value
                                    ? "bg-card text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {filter.label}
                                <span className={`ml-1 text-xs text-muted-foreground`}>
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

            {/* Mobile: Card Layout */}
            <div className="sm:hidden space-y-4">
                {!inventory ? (
                    // Loading State
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="bg-card rounded-xl p-4 border border-border animate-pulse">
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-12 h-12 bg-muted rounded-xl"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-muted rounded w-1/2"></div>
                                </div>
                            </div>
                            <div className="h-2 bg-muted rounded w-full mb-3"></div>
                            <div className="h-8 bg-muted rounded w-full"></div>
                        </div>
                    ))
                ) : filteredInventory && filteredInventory.length === 0 ? (
                    <div className="bg-card rounded-xl p-12 text-center text-muted-foreground italic border border-border">
                        {searchQuery || stockFilter !== "all"
                            ? "No items match your search criteria."
                            : "No inventory found."}
                    </div>
                ) : (
                    filteredInventory?.map((item) => (
                        <div key={item._id} className="bg-card rounded-xl p-4 border border-border">
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center shrink-0 border border-border overflow-hidden">
                                    {item.images ? (
                                        <img src={item.images} alt={item.productName} className="w-full h-full object-cover" />
                                    ) : (
                                        <Package size={20} className="text-muted-foreground" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-foreground truncate">{item.productName}</h3>
                                    <p className="text-sm text-muted-foreground">{item.variantName}</p>
                                </div>
                            </div>

                            {/* SKU Badge */}
                            <div className="mb-3">
                                <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded inline-block border border-border">
                                    {item.sku}
                                </span>
                            </div>

                            {/* Stock Level Progress Bar */}
                            <div className="mb-3">
                                <div className="flex justify-between text-sm mb-1.5">
                                    <span className="text-muted-foreground">Stock Level</span>
                                    <span className={`font-bold font-mono ${item.stock === 0 ? "text-red-500" :
                                        item.stock <= 10 ? "text-amber-500" :
                                            "text-foreground"
                                        }`}>
                                        {item.stock}
                                    </span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${
                                            item.stock === 0 ? 'bg-red-500' :
                                            item.stock <= 10 ? 'bg-amber-500' :
                                            'bg-emerald-500'
                                        }`}
                                        style={{ width: `${Math.min((item.stock / 50) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="mb-3">
                                {item.stock === 0 ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                                        Out of Stock
                                    </span>
                                ) : item.stock <= 10 ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                        Low Stock
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                        In Stock
                                    </span>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setAdjustmentItem(item)}
                                    className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground font-medium rounded-xl text-sm min-h-[44px] flex items-center justify-center"
                                >
                                    Adjust Stock
                                </button>
                                <button
                                    className="px-3 py-2.5 text-muted-foreground hover:text-foreground bg-muted/50 rounded-xl min-h-[44px] min-w-[48px] flex items-center justify-center"
                                    title="View History (Next Sprint)"
                                >
                                    <History size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop: Table Layout */}
            <div className="hidden sm:block bg-card rounded-xl shadow-sm border border-border overflow-hidden">
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
                        <tbody className="divide-y divide-border">
                            {!inventory ? (
                                // Loading State
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-10 w-40 bg-muted rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-muted rounded"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-6 w-12 bg-muted rounded ml-auto"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-6 w-20 bg-muted rounded ml-auto"></div></td>
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
                                    <tr key={item._id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center shrink-0 border border-border overflow-hidden">
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
                                            <div className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded inline-block mb-1 border border-border">
                                                {item.sku}
                                            </div>
                                            <div className="text-sm text-foreground/80">{item.variantName}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`text-lg font-bold font-mono ${item.stock === 0 ? "text-red-500" :
                                                item.stock <= 10 ? "text-amber-500" :
                                                    "text-foreground"
                                                }`}>
                                                {item.stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {item.stock === 0 ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                                                    Out of Stock
                                                </span>
                                            ) : item.stock <= 10 ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                    Low Stock
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                    In Stock
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setAdjustmentItem(item)}
                                                    className="text-sm text-primary hover:text-primary/80 font-medium px-2 py-1 hover:bg-primary/10 rounded"
                                                >
                                                    Adjust
                                                </button>
                                                <button
                                                    className="text-muted-foreground hover:text-foreground p-1.5 hover:bg-muted/50 rounded"
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
            {/* Swipe handle for mobile */}
            <div className="relative bg-card w-full sm:max-w-md rounded-t-2xl sm:rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto slide-up-sheet border border-border">
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="w-12 h-1.5 bg-muted rounded-full" />
                </div>

                <div className="px-6 py-4 border-b border-border flex justify-between items-center">
                    <h3 className="font-semibold text-lg text-foreground">Adjust Stock</h3>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground p-2 -mr-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="p-3 bg-muted/30 rounded-xl border border-border">
                        <div className="text-sm font-medium text-foreground">{item.productName}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{item.variantName} • {item.sku}</div>
                        <div className="mt-2 text-sm text-foreground">
                            Current Stock: <span className="font-bold">{item.stock}</span>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-2 p-1 bg-muted rounded-xl">
                        <button
                            type="button"
                            onClick={() => setType("add")}
                            className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all min-h-[44px] ${type === "add"
                                ? "bg-card text-emerald-500 shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Add Stock
                        </button>
                        <button
                            type="button"
                            onClick={() => setType("remove")}
                            className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all min-h-[44px] ${type === "remove"
                                ? "bg-card text-red-500 shadow-sm"
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
                            inputMode="decimal"
                            min="1"
                            required
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full px-4 py-3 min-h-[48px] bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
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
                            className="w-full px-4 py-3 min-h-[48px] bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                        />
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 rounded-xl min-h-[44px]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-4 py-3 text-sm font-medium text-white rounded-xl transition-colors min-h-[44px] ${type === "add"
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
