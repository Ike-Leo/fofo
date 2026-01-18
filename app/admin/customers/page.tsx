"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useOrganization } from "@/components/OrganizationProvider";
import Link from "next/link";
import {
    Users,
    Search,
    TrendingUp,
    ShoppingBag,
    Mail,
    ChevronRight,
    Crown,
} from "lucide-react";

const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(cents / 100);
};

const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

export default function CustomersPage() {
    const { currentOrg } = useOrganization();
    const [search, setSearch] = useState("");
    const [topCount, setTopCount] = useState<5 | 10 | 20>(5);

    const customers = useQuery(
        api.customers.list,
        currentOrg ? { orgId: currentOrg._id, search: search || undefined } : "skip"
    );

    // Get top customers by total spend
    const topCustomers = customers?.sort((a, b) => b.totalSpend - a.totalSpend).slice(0, topCount) || [];

    if (!currentOrg) {
        return (
            <div className="p-8 sm:p-12 text-center text-muted-foreground">
                Select an organization to view customers.
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
            {/* Header - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2 sm:gap-3">
                        <Users className="text-purple-500" size={24} />
                        Customers
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        View and manage your customer relationships
                    </p>
                </div>

                {/* Search - Full Width on Mobile */}
                <div className="relative w-full sm:w-80">
                    <Search
                        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                        size={18}
                    />
                    <input
                        type="text"
                        inputMode="search"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground min-h-[48px] sm:min-h-0"
                    />
                </div>
            </div>

            {/* Stats Summary - Compact Responsive Grid */}
            {customers && customers.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    <div className="bg-card rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-purple-500/20 relative overflow-hidden group hover:border-purple-500/40 transition-colors">
                        <div className="absolute right-0 top-0 p-1.5 sm:p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users size={28} className="text-purple-500" />
                        </div>
                        <p className="text-[10px] sm:text-xs font-medium text-purple-500">Total Customers</p>
                        <p className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">{customers.length}</p>
                    </div>
                    <div className="bg-card rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-emerald-500/20 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
                        <div className="absolute right-0 top-0 p-1.5 sm:p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp size={28} className="text-emerald-500" />
                        </div>
                        <p className="text-[10px] sm:text-xs font-medium text-emerald-500">Total Revenue</p>
                        <p className="text-xl sm:text-2xl font-bold text-foreground mt-0.5 text-sm sm:text-base">
                            {formatPrice(customers.reduce((sum, c) => sum + c.totalSpend, 0))}
                        </p>
                    </div>
                    <div className="bg-card rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-blue-500/20 relative overflow-hidden group hover:border-blue-500/40 transition-colors">
                        <div className="absolute right-0 top-0 p-1.5 sm:p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <ShoppingBag size={28} className="text-blue-500" />
                        </div>
                        <p className="text-[10px] sm:text-xs font-medium text-blue-500">Avg. Lifetime Value</p>
                        <p className="text-xl sm:text-2xl font-bold text-foreground mt-0.5 text-sm sm:text-base">
                            {formatPrice(
                                customers.reduce((sum, c) => sum + c.totalSpend, 0) / customers.length
                            )}
                        </p>
                    </div>
                </div>
            )}

            {/* Top Customers Widget - Responsive */}
            {customers && customers.length > 0 && (
                <div className="bg-card rounded-xl shadow-sm border border-amber-500/20 p-4 sm:p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <h3 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                            <Crown className="text-amber-500" size={18} />
                            Top {topCount} Customers
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm text-muted-foreground">Show:</span>
                            <div className="flex gap-1 sm:gap-2">
                                {[5, 10, 20].map((count) => (
                                    <button
                                        key={count}
                                        onClick={() => setTopCount(count as 5 | 10 | 20)}
                                        className={`px-2.5 sm:px-3 py-1.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium transition-colors min-h-[36px] sm:min-h-0 ${topCount === count
                                                ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                            }`}
                                    >
                                        {count}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {topCustomers.length === 0 ? (
                        <div className="text-center py-6 sm:py-8 text-muted-foreground">
                            <Crown className="mx-auto text-amber-500/20 mb-2" size={32} />
                            <p>No customers yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3">
                            {topCustomers.map((customer, index) => (
                                <Link
                                    key={customer._id}
                                    href={`/admin/customers/${customer._id}`}
                                    className="bg-muted/20 hover:bg-muted/30 rounded-lg p-3 sm:p-3 border border-border hover:border-amber-500/30 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center gap-2 sm:gap-2.5">
                                        <div
                                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                                                index === 0
                                                    ? "bg-gradient-to-br from-amber-400/20 to-amber-500/10 text-amber-500 border border-amber-500/20"
                                                    : index === 1
                                                    ? "bg-gradient-to-br from-slate-400/20 to-slate-500/10 text-slate-400 border border-slate-500/20"
                                                    : index === 2
                                                        ? "bg-gradient-to-br from-orange-400/20 to-orange-500/10 text-orange-500 border border-orange-500/20"
                                                        : "bg-gradient-to-br from-purple-500/20 to-purple-500/5 text-purple-500 border border-purple-500/10"
                                            }`}
                                        >
                                            {index < 3 ? (
                                                <Crown size={12} />
                                            ) : (
                                                `#${index + 1}`
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{customer.name}</p>
                                            <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">{customer.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                                        <div className="text-[10px] sm:text-xs text-muted-foreground">
                                            <span className="font-medium text-emerald-500">{formatPrice(customer.totalSpend)}</span>
                                        </div>
                                        <div className="text-[10px] sm:text-xs text-foreground">
                                            <span className="font-medium">{customer.totalOrders}</span> orders
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Customer List - Mobile Cards, Desktop Table */}
            {!customers ? (
                <div className="bg-card rounded-xl shadow-sm border border-border p-8 sm:p-12 text-center animate-pulse text-muted-foreground">
                    Loading customers...
                </div>
            ) : customers.length === 0 ? (
                <div className="bg-card rounded-xl shadow-sm border border-border p-8 sm:p-12 text-center">
                    <Users className="mx-auto text-slate-700 mb-4" size={48} />
                    <h3 className="text-lg font-semibold text-foreground">No customers yet</h3>
                    <p className="text-muted-foreground mt-1">
                        Customers will appear here after they place orders.
                    </p>
                </div>
            ) : (
                <>
                    {/* Mobile: Compact Card Layout */}
                    <div className="sm:hidden space-y-2">
                        {customers.map((customer, index) => (
                            <Link
                                key={customer._id}
                                href={`/admin/customers/${customer._id}`}
                                className="bg-card rounded-lg p-3 border border-border hover:border-primary/50 hover:bg-muted/20 transition-all block"
                            >
                                <div className="flex items-center gap-3">
                                    {/* Compact Avatar with VIP indicator */}
                                    <div className="relative flex-shrink-0">
                                        {index < 3 ? (
                                            <div
                                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                    index === 0
                                                        ? "bg-gradient-to-br from-amber-400/20 to-amber-500/10 text-amber-500"
                                                        : index === 1
                                                        ? "bg-gradient-to-br from-slate-400/20 to-slate-500/10 text-slate-400"
                                                        : "bg-gradient-to-br from-orange-400/20 to-orange-500/10 text-orange-500"
                                                }`}
                                            >
                                                <Crown size={16} />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center text-purple-500 font-bold text-sm border border-purple-500/10">
                                                {customer.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        {/* VIP badge dot */}
                                        {index < 3 && (
                                            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full border-2 border-card" />
                                        )}
                                    </div>

                                    {/* Compact Customer Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <h3 className="text-sm font-semibold text-foreground truncate pr-1">{customer.name}</h3>
                                            <ChevronRight size={16} className="text-muted-foreground/50 flex-shrink-0" />
                                        </div>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 truncate mb-1.5">
                                            <Mail size={10} />
                                            {customer.email}
                                        </p>

                                        {/* Inline Stats */}
                                        <div className="flex items-center gap-3 text-xs">
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <ShoppingBag size={11} />
                                                <span className="font-medium text-foreground">{customer.totalOrders}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <TrendingUp
                                                    size={11}
                                                    className={customer.totalSpend > 10000 ? "text-emerald-500" : "text-muted-foreground"}
                                                />
                                                <span className={`font-medium ${customer.totalSpend > 10000 ? "text-emerald-500" : "text-foreground"}`}>
                                                    {formatPrice(customer.totalSpend)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Desktop: Table Layout */}
                    <div className="hidden sm:block bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-muted/30 border-b border-border">
                                <tr>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">
                                        Customer
                                    </th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground hidden md:table-cell">
                                        Orders
                                    </th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">
                                        Lifetime Value
                                    </th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground hidden lg:table-cell">
                                        Last Seen
                                    </th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {customers.map((customer, index) => (
                                    <tr
                                        key={customer._id}
                                        className="hover:bg-muted/30 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {/* VIP Badge for top 3 */}
                                                {index < 3 && (
                                                    <div
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center ${index === 0
                                                            ? "bg-amber-500/20 text-amber-500"
                                                            : index === 1
                                                                ? "bg-slate-500/20 text-slate-400"
                                                                : "bg-orange-500/20 text-orange-500"
                                                            }`}
                                                    >
                                                        <Crown size={14} />
                                                    </div>
                                                )}
                                                {index >= 3 && (
                                                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 font-medium text-sm">
                                                        {customer.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-foreground">
                                                        {customer.name}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <Mail size={12} />
                                                        {customer.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <div className="flex items-center gap-2 text-foreground">
                                                <ShoppingBag size={16} className="text-muted-foreground" />
                                                {customer.totalOrders}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp
                                                    size={16}
                                                    className={
                                                        customer.totalSpend > 10000
                                                            ? "text-emerald-500"
                                                            : "text-muted-foreground"
                                                    }
                                                />
                                                <span
                                                    className={`font-semibold ${customer.totalSpend > 10000
                                                        ? "text-emerald-500"
                                                        : "text-foreground"
                                                        }`}
                                                >
                                                    {formatPrice(customer.totalSpend)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground text-sm hidden lg:table-cell">
                                            {formatDate(customer.lastSeenAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/admin/customers/${customer._id}`}
                                                className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm font-medium transition-colors"
                                            >
                                                View
                                                <ChevronRight size={16} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
