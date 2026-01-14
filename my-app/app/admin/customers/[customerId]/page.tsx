/* eslint-disable */
"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import Link from "next/link";
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    TrendingUp,
    ShoppingBag,
    Package,
    Clock,
    CheckCircle2,
    Truck,
    XCircle,
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
        month: "long",
        day: "numeric",
    });
};

const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    pending: {
        icon: <Clock size={14} />,
        color: "text-amber-700",
        bg: "bg-amber-100",
    },
    paid: {
        icon: <CheckCircle2 size={14} />,
        color: "text-blue-700",
        bg: "bg-blue-100",
    },
    processing: {
        icon: <Package size={14} />,
        color: "text-purple-700",
        bg: "bg-purple-100",
    },
    shipped: {
        icon: <Truck size={14} />,
        color: "text-indigo-700",
        bg: "bg-indigo-100",
    },
    delivered: {
        icon: <CheckCircle2 size={14} />,
        color: "text-emerald-700",
        bg: "bg-emerald-100",
    },
    cancelled: {
        icon: <XCircle size={14} />,
        color: "text-red-700",
        bg: "bg-red-100",
    },
    refunded: {
        icon: <XCircle size={14} />,
        color: "text-slate-700",
        bg: "bg-slate-100",
    },
};

export default function CustomerDetailPage() {
    const params = useParams();
    const customerId = params.customerId as Id<"customers">;

    const customerData = useQuery(api.customers.get, { customerId });

    if (customerData === undefined) {
        return (
            <div className="p-12 text-center animate-pulse text-slate-400">
                Loading customer details...
            </div>
        );
    }

    if (customerData === null) {
        return (
            <div className="p-12 text-center">
                <h2 className="text-xl font-semibold text-slate-700">Customer not found</h2>
                <Link
                    href="/admin/customers"
                    className="text-purple-600 hover:underline mt-2 inline-block"
                >
                    ← Back to Customers
                </Link>
            </div>
        );
    }

    const { orders, ...customer } = customerData;

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/customers"
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} className="text-slate-500" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{customer.name}</h1>
                    <p className="text-slate-500">Customer since {formatDate(customer.firstSeenAt)}</p>
                </div>
            </div>

            {/* Customer Info + Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Contact Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <User size={18} className="text-purple-600" />
                        Contact Information
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-slate-600">
                            <Mail size={16} className="text-slate-400" />
                            <a
                                href={`mailto:${customer.email}`}
                                className="text-purple-600 hover:underline"
                            >
                                {customer.email}
                            </a>
                        </div>
                        {customer.phone && (
                            <div className="flex items-center gap-3 text-slate-600">
                                <Phone size={16} className="text-slate-400" />
                                {customer.phone}
                            </div>
                        )}
                        {customer.address && (
                            <div className="flex items-start gap-3 text-slate-600">
                                <MapPin size={16} className="text-slate-400 mt-0.5" />
                                <span className="whitespace-pre-wrap">{customer.address}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lifetime Value Card */}
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-sm p-6 text-white">
                    <h3 className="font-medium text-emerald-100 mb-2 flex items-center gap-2">
                        <TrendingUp size={18} />
                        Lifetime Value
                    </h3>
                    <p className="text-4xl font-bold">{formatPrice(customer.totalSpend)}</p>
                    <p className="text-emerald-200 mt-2">
                        {customer.totalOrders > 0
                            ? `Avg. ${formatPrice(customer.totalSpend / customer.totalOrders)} per order`
                            : "No orders yet"}
                    </p>
                </div>

                {/* Orders Card */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
                    <h3 className="font-medium text-purple-100 mb-2 flex items-center gap-2">
                        <ShoppingBag size={18} />
                        Total Orders
                    </h3>
                    <p className="text-4xl font-bold">{customer.totalOrders}</p>
                    <p className="text-purple-200 mt-2 flex items-center gap-2">
                        <Calendar size={14} />
                        Last order: {formatDate(customer.lastSeenAt)}
                    </p>
                </div>
            </div>

            {/* Order History */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        <Package size={18} className="text-slate-400" />
                        Order History
                    </h3>
                </div>

                {orders.length === 0 ? (
                    <div className="p-12 text-center">
                        <ShoppingBag className="mx-auto text-slate-300 mb-4" size={48} />
                        <p className="text-slate-500">No orders from this customer yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {orders.map((order) => {
                            const status = statusConfig[order.status] || statusConfig.pending;
                            return (
                                <Link
                                    key={order._id}
                                    href={`/admin/orders/${order._id}`}
                                    className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center ${status.bg}`}
                                        >
                                            <span className={status.color}>{status.icon}</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">
                                                Order #{order.orderNumber}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {formatDateTime(order.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-slate-900">
                                            {formatPrice(order.totalAmount)}
                                        </p>
                                        <span
                                            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}
                                        >
                                            {status.icon}
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
