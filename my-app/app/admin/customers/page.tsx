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
    Star,
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
            <div className="p-12 text-center text-muted-foreground">
                Select an organization to view customers.
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <Users className="text-purple-500" size={32} />
                        Customers
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        View and manage your customer relationships
                    </p>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-80">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        size={18}
                    />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
                    />
                </div>
            </div>

            {/* Top Customers Widget */}
            {customers && customers.length > 0 && (
                <div className="bg-card rounded-xl shadow-sm border border-amber-500/20 p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50"></div>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <Crown className="text-amber-500" size={20} />
                            Top {topCount} Customers
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Show:</span>
                            {[5, 10, 20].map((count) => (
                                <button
                                    key={count}
                                    onClick={() => setTopCount(count as 5 | 10 | 20)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${topCount === count
                                            ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                                        }`}
                                >
                                    {count}
                                </button>
                            ))}
                        </div>
                    </div>

                    {topCustomers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Crown className="mx-auto text-amber-500/20 mb-2" size={32} />
                            <p>No customers yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            {topCustomers.map((customer, index) => (
                                <Link
                                    key={customer._id}
                                    href={`/admin/customers/${customer._id}`}
                                    className="bg-muted/30 rounded-xl p-4 border border-border hover:border-amber-500/50 hover:bg-muted/50 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${index === 0
                                                    ? "bg-amber-500/20 text-amber-500"
                                                    : index === 1
                                                        ? "bg-slate-500/20 text-slate-400"
                                                        : index === 2
                                                            ? "bg-orange-500/20 text-orange-500"
                                                            : "bg-purple-500/20 text-purple-500"
                                                }`}
                                        >
                                            {index < 3 ? (
                                                <Crown size={18} />
                                            ) : (
                                                `#${index + 1}`
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">{customer.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Total Spend:</span>
                                            <span className="font-semibold text-emerald-500">
                                                {formatPrice(customer.totalSpend)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Orders:</span>
                                            <span className="font-medium text-foreground">{customer.totalOrders}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Avg. Order:</span>
                                            <span className="font-medium text-foreground">
                                                {formatPrice(customer.totalSpend / customer.totalOrders)}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Stats Summary */}
            {customers && customers.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-card rounded-xl p-4 border border-purple-500/20 relative overflow-hidden group hover:border-purple-500/40 transition-colors">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users size={64} className="text-purple-500" />
                        </div>
                        <p className="text-sm font-medium text-purple-500">Total Customers</p>
                        <p className="text-3xl font-bold text-foreground mt-1">{customers.length}</p>
                    </div>
                    <div className="bg-card rounded-xl p-4 border border-emerald-500/20 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp size={64} className="text-emerald-500" />
                        </div>
                        <p className="text-sm font-medium text-emerald-500">Total Revenue</p>
                        <p className="text-3xl font-bold text-foreground mt-1">
                            {formatPrice(customers.reduce((sum, c) => sum + c.totalSpend, 0))}
                        </p>
                    </div>
                    <div className="bg-card rounded-xl p-4 border border-blue-500/20 relative overflow-hidden group hover:border-blue-500/40 transition-colors">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <ShoppingBag size={64} className="text-blue-500" />
                        </div>
                        <p className="text-sm font-medium text-blue-500">Avg. Lifetime Value</p>
                        <p className="text-3xl font-bold text-foreground mt-1">
                            {formatPrice(
                                customers.reduce((sum, c) => sum + c.totalSpend, 0) / customers.length
                            )}
                        </p>
                    </div>
                </div>
            )}

            {/* Customer Table */}
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                {!customers ? (
                    <div className="p-12 text-center animate-pulse text-muted-foreground">
                        Loading customers...
                    </div>
                ) : customers.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users className="mx-auto text-slate-700 mb-4" size={48} />
                        <h3 className="text-lg font-semibold text-foreground">No customers yet</h3>
                        <p className="text-muted-foreground mt-1">
                            Customers will appear here after they place orders.
                        </p>
                    </div>
                ) : (
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
                )}
            </div>
        </div>
    );
}
