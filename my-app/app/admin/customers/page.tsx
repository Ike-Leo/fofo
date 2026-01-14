/* eslint-disable */
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

    const customers = useQuery(
        api.customers.list,
        currentOrg ? { orgId: currentOrg._id, search: search || undefined } : "skip"
    );

    if (!currentOrg) {
        return (
            <div className="p-12 text-center text-slate-500">
                Select an organization to view customers.
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Users className="text-purple-600" size={32} />
                        Customers
                    </h1>
                    <p className="text-slate-500 mt-1">
                        View and manage your customer relationships
                    </p>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-80">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                    />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Stats Summary */}
            {customers && customers.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                        <p className="text-sm font-medium text-purple-600">Total Customers</p>
                        <p className="text-2xl font-bold text-purple-900">{customers.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
                        <p className="text-sm font-medium text-emerald-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-emerald-900">
                            {formatPrice(customers.reduce((sum, c) => sum + c.totalSpend, 0))}
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                        <p className="text-sm font-medium text-blue-600">Avg. Lifetime Value</p>
                        <p className="text-2xl font-bold text-blue-900">
                            {formatPrice(
                                customers.reduce((sum, c) => sum + c.totalSpend, 0) / customers.length
                            )}
                        </p>
                    </div>
                </div>
            )}

            {/* Customer Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {!customers ? (
                    <div className="p-12 text-center animate-pulse text-slate-400">
                        Loading customers...
                    </div>
                ) : customers.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users className="mx-auto text-slate-300 mb-4" size={48} />
                        <h3 className="text-lg font-semibold text-slate-700">No customers yet</h3>
                        <p className="text-slate-500 mt-1">
                            Customers will appear here after they place orders.
                        </p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                    Customer
                                </th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 hidden md:table-cell">
                                    Orders
                                </th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                    Lifetime Value
                                </th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 hidden lg:table-cell">
                                    Last Seen
                                </th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {customers.map((customer, index) => (
                                <tr
                                    key={customer._id}
                                    className="hover:bg-slate-50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {/* VIP Badge for top 3 */}
                                            {index < 3 && (
                                                <div
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${index === 0
                                                        ? "bg-amber-100 text-amber-600"
                                                        : index === 1
                                                            ? "bg-slate-200 text-slate-600"
                                                            : "bg-orange-100 text-orange-600"
                                                        }`}
                                                >
                                                    <Crown size={14} />
                                                </div>
                                            )}
                                            {index >= 3 && (
                                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium text-sm">
                                                    {customer.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-slate-900">
                                                    {customer.name}
                                                </p>
                                                <p className="text-sm text-slate-500 flex items-center gap-1">
                                                    <Mail size={12} />
                                                    {customer.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        <div className="flex items-center gap-2 text-slate-700">
                                            <ShoppingBag size={16} className="text-slate-400" />
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
                                                        : "text-slate-400"
                                                }
                                            />
                                            <span
                                                className={`font-semibold ${customer.totalSpend > 10000
                                                    ? "text-emerald-700"
                                                    : "text-slate-900"
                                                    }`}
                                            >
                                                {formatPrice(customer.totalSpend)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-sm hidden lg:table-cell">
                                        {formatDate(customer.lastSeenAt)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link
                                            href={`/admin/customers/${customer._id}`}
                                            className="text-purple-600 hover:text-purple-800 flex items-center gap-1 text-sm font-medium"
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
