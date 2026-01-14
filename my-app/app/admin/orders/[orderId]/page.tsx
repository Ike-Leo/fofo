/* eslint-disable */
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    CreditCard,
    MapPin,
    Package,
    User,
    Truck,
    XCircle
} from "lucide-react";
import { useState } from "react";

const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(cents / 100);
};

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.orderId as Id<"orders">;

    const order = useQuery(api.orders.get, { orderId });
    const updateStatus = useMutation(api.orders.updateStatus);
    const [isUpdating, setIsUpdating] = useState(false);
    const [optimisticStatus, setOptimisticStatus] = useState<string | null>(null);
    const [optimisticPaymentStatus, setOptimisticPaymentStatus] = useState<string | null>(null);

    if (order === undefined) return <div className="p-12 text-center animate-pulse">Loading order...</div>;
    if (order === null) return <div className="p-12 text-center text-red-500">Order not found or unauthorized.</div>;

    const displayStatus = optimisticStatus || order.status;
    const displayPaymentStatus = optimisticPaymentStatus || order.paymentStatus;

    const handleStatusUpdate = async (newStatus: string) => {
        if (!confirm(`Change order status to ${newStatus}?`)) return;

        // Optimistic update for status
        setOptimisticStatus(newStatus);

        // Update payment status optimistically if marking as paid
        if (newStatus === "paid") {
            setOptimisticPaymentStatus("paid");
        }

        setIsUpdating(true);
        try {
            await updateStatus({ orderId, status: newStatus as any });
            // Clear optimistic state after successful update
            setOptimisticStatus(null);
            setOptimisticPaymentStatus(null);
        } catch (err) {
            alert("Failed to update status");
            // Revert optimistic state on error
            setOptimisticStatus(null);
            setOptimisticPaymentStatus(null);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <Link href="/admin/orders" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors">
                <ArrowLeft size={16} className="mr-2" />
                Back to Orders
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-slate-900">{order.orderNumber}</h1>
                        <StatusBadge status={displayStatus} size="lg" />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(order.createdAt).toLocaleString()}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <CreditCard size={14} />
                            Payment: <span className="capitalize">{displayPaymentStatus}</span>
                        </span>
                    </div>
                </div>

                <div className="flex gap-3">
                    {displayStatus === "pending" && (
                        <ActionButton
                            onClick={() => handleStatusUpdate("paid")}
                            label="Mark Paid"
                            icon={<CreditCard size={16} />}
                            color="blue"
                            loading={isUpdating}
                        />
                    )}
                    {displayStatus === "paid" && (
                        <ActionButton
                            onClick={() => handleStatusUpdate("processing")}
                            label="Start Processing"
                            icon={<Package size={16} />}
                            color="indigo"
                            loading={isUpdating}
                        />
                    )}
                    {displayStatus === "processing" && (
                        <ActionButton
                            onClick={() => handleStatusUpdate("shipped")}
                            label="Ship Order"
                            icon={<Truck size={16} />}
                            color="purple"
                            loading={isUpdating}
                        />
                    )}
                    {(displayStatus === "shipped") && (
                        <ActionButton
                            onClick={() => handleStatusUpdate("delivered")}
                            label="Mark Delivered"
                            icon={<CheckCircle size={16} />}
                            color="emerald"
                            loading={isUpdating}
                        />
                    )}
                    {displayStatus !== "cancelled" && displayStatus !== "delivered" && displayStatus !== "refunded" && (
                        <ActionButton
                            onClick={() => handleStatusUpdate("cancelled")}
                            label="Cancel Order"
                            icon={<XCircle size={16} />}
                            color="slate"
                            loading={isUpdating}
                        />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Content: Items */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 font-medium text-slate-700">
                            Order Items
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white border-b border-slate-100 text-slate-500">
                                <tr>
                                    <th className="px-6 py-3 font-normal">Product</th>
                                    <th className="px-6 py-3 font-normal text-right">Price</th>
                                    <th className="px-6 py-3 font-normal text-right">Qty</th>
                                    <th className="px-6 py-3 font-normal text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {order.items.map((item: any) => (
                                    <tr key={item._id}>
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/admin/products/${item.productId}`}
                                                className="font-medium text-slate-900 hover:text-blue-600 hover:underline"
                                            >
                                                {item.productName}
                                            </Link>
                                            <div className="text-slate-500 text-xs">{item.variantName}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right tabular-nums">{formatPrice(item.price)}</td>
                                        <td className="px-6 py-4 text-right tabular-nums">{item.quantity}</td>
                                        <td className="px-6 py-4 text-right font-medium tabular-nums">
                                            {formatPrice(item.price * item.quantity)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-slate-50 border-t border-slate-200">
                                <tr>
                                    <td colSpan={3} className="px-6 py-4 text-right font-medium text-slate-600">Total</td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-900 text-lg">
                                        {formatPrice(order.totalAmount)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Sidebar: Customer Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                            <User size={18} className="text-slate-400" />
                            Customer
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Contact</div>
                                <div className="font-medium text-slate-900">{order.customerInfo.name}</div>
                                <Link href={`mailto:${order.customerInfo.email}`} className="text-blue-600 hover:underline">
                                    {order.customerInfo.email}
                                </Link>
                                {order.customerInfo.phone && <div className="text-slate-600">{order.customerInfo.phone}</div>}
                            </div>
                            {order.customerInfo.address && (
                                <div>
                                    <div className="text-slate-500 text-xs uppercase tracking-wider mb-1 mt-3">Shipping Address</div>
                                    <div className="text-slate-700 whitespace-pre-wrap flex items-start gap-2">
                                        <MapPin size={14} className="mt-0.5 shrink-0 text-slate-400" />
                                        {order.customerInfo.address}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timeline placeholder - could be real logs later */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                            <Clock size={18} className="text-slate-400" />
                            Timeline
                        </h3>
                        <div className="relative pl-4 border-l-2 border-slate-100 space-y-6">
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-200 border-2 border-white ring-1 ring-slate-100"></div>
                                <div className="text-sm text-slate-900 font-medium">Order Created</div>
                                <div className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</div>
                            </div>
                            {/* Simple logic for timeline points based on status */}
                            {order.updatedAt > order.createdAt && (
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-200 border-2 border-white ring-1 ring-slate-100"></div>
                                    <div className="text-sm text-slate-900 font-medium">Last Updated</div>
                                    <div className="text-xs text-slate-500">{new Date(order.updatedAt).toLocaleString()}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status, size = "md" }: { status: string, size?: "md" | "lg" }) {
    const styles: Record<string, string> = {
        pending: "bg-amber-100 text-amber-700",
        paid: "bg-blue-100 text-blue-700",
        processing: "bg-indigo-100 text-indigo-700",
        shipped: "bg-purple-100 text-purple-700",
        delivered: "bg-emerald-100 text-emerald-700",
        cancelled: "bg-slate-100 text-slate-600",
    };
    const sizeClasses = size === "lg" ? "px-3 py-1 text-sm" : "px-2.5 py-0.5 text-xs";

    return (
        <span className={`inline-flex items-center rounded-full font-medium capitalize ${sizeClasses} ${styles[status]}`}>
            {status}
        </span>
    );
}

function ActionButton({ onClick, label, icon, color, loading }: any) {
    const colors: Record<string, string> = {
        blue: "bg-blue-600 hover:bg-blue-700 text-white",
        indigo: "bg-indigo-600 hover:bg-indigo-700 text-white",
        purple: "bg-purple-600 hover:bg-purple-700 text-white",
        emerald: "bg-emerald-600 hover:bg-emerald-700 text-white",
        slate: "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50",
    };

    return (
        <button
            onClick={onClick}
            disabled={loading}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 ${colors[color]}`}
        >
            {icon}
            {loading ? "..." : label}
        </button>
    );
}
