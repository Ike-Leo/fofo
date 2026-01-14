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
    MessageSquare,
} from "lucide-react";
import { useState } from "react";
import { useOrganization } from "@/components/OrganizationProvider";
import { useMutation } from "convex/react";

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
    const { currentOrg } = useOrganization();
    const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);

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
            <div className="flex items-center justify-between">
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

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsCreateOrderOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm font-medium"
                    >
                        <ShoppingBag size={18} />
                        Create Order
                    </button>
                    <button
                        onClick={() => alert("Chat feature coming soon!")}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                    >
                        <MessageSquare size={18} />
                        Chat
                    </button>
                    {customer.phone && (
                        <a
                            href={`tel:${customer.phone}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-medium"
                        >
                            <Phone size={18} />
                            Call
                        </a>
                    )}
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

            {isCreateOrderOpen && currentOrg && (
                <CreateOrderModal
                    orgId={currentOrg._id}
                    customer={{ name: customer.name, email: customer.email, phone: customer.phone }}
                    onClose={() => setIsCreateOrderOpen(false)}
                />
            )}
        </div>
    );
}

function CreateOrderModal({
    orgId,
    customer,
    onClose
}: {
    orgId: Id<"organizations">;
    customer: { name: string; email: string; phone?: string };
    onClose: () => void;
}) {
    const createOrder = useMutation(api.orders.create);
    const inventory = useQuery(api.inventory.list, { orgId });

    const [lineItems, setLineItems] = useState<Array<{ variantId: string, quantity: number, price: number, name: string }>>([]);
    const [selectedVariantId, setSelectedVariantId] = useState("");
    const [quantity, setQuantity] = useState("1");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const availableVariants = inventory?.filter(i => i.stock > 0) || [];
    const selectedVariant = availableVariants.find(v => v._id === selectedVariantId);

    const addItem = () => {
        if (!selectedVariant) return;
        const qty = parseInt(quantity);
        if (qty <= 0) return;
        if (qty > selectedVariant.stock) {
            setError(`Only ${selectedVariant.stock} available`);
            return;
        }

        setLineItems(prev => [...prev, {
            variantId: selectedVariant._id,
            quantity: qty,
            price: selectedVariant.price ?? 0,
            name: `${selectedVariant.productName} - ${selectedVariant.variantName}`
        }]);
        setQuantity("1");
        setSelectedVariantId("");
        setError(null);
    };

    const removeItem = (index: number) => {
        setLineItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (lineItems.length === 0) {
            setError("Add at least one item");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await createOrder({
                orgId,
                items: lineItems.map(i => ({ variantId: i.variantId as Id<"productVariants">, quantity: i.quantity })),
                customerInfo: {
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone || undefined,
                }
            });
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const total = lineItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h3 className="font-semibold text-lg text-slate-900">Create Order for {customer.name}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XCircle size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {/* Customer Info Display */}
                    <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <h4 className="text-sm font-medium text-purple-900 mb-2">Customer</h4>
                        <div className="text-sm text-purple-700">
                            <div>{customer.name}</div>
                            <div>{customer.email}</div>
                            {customer.phone && <div>{customer.phone}</div>}
                        </div>
                    </div>

                    {/* Item Selection */}
                    <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <h4 className="text-sm font-medium text-slate-700 mb-3">Add Items</h4>
                        <div className="flex gap-2">
                            <select
                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                value={selectedVariantId}
                                onChange={(e) => {
                                    setSelectedVariantId(e.target.value);
                                    setError(null);
                                }}
                            >
                                <option value="">Select Product...</option>
                                {availableVariants.map(v => (
                                    <option key={v._id} value={v._id}>
                                        {v.productName} - {v.variantName} ({formatPrice(v.price || 0)}) - Stock: {v.stock}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                min="1"
                            />
                            <button
                                type="button"
                                onClick={addItem}
                                disabled={!selectedVariantId}
                                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Cart Table */}
                    <div className="mb-6 border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-2">Item</th>
                                    <th className="px-4 py-2 text-right">Qty</th>
                                    <th className="px-4 py-2 text-right">Price</th>
                                    <th className="px-4 py-2 text-right">Total</th>
                                    <th className="w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {lineItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500 italic">No items added</td>
                                    </tr>
                                ) : (
                                    lineItems.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-2">{item.name}</td>
                                            <td className="px-4 py-2 text-right">{item.quantity}</td>
                                            <td className="px-4 py-2 text-right">{formatPrice(item.price)}</td>
                                            <td className="px-4 py-2 text-right font-medium">{formatPrice(item.price * item.quantity)}</td>
                                            <td className="px-4 py-2 text-right">
                                                <button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700">
                                                    <XCircle size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            <tfoot className="bg-slate-50 font-semibold text-slate-900">
                                <tr>
                                    <td colSpan={3} className="px-4 py-3 text-right">Total:</td>
                                    <td className="px-4 py-3 text-right">{formatPrice(total)}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                            {error}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || lineItems.length === 0}
                        className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm disabled:opacity-50"
                    >
                        {isSubmitting ? "Placing Order..." : "Place Order"}
                    </button>
                </div>
            </div>
        </div>
    );
}
