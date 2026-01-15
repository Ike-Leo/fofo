/* eslint-disable */
"use client";

import { useParams, useRouter } from "next/navigation";
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
    Pencil,
    Check,
    X,
} from "lucide-react";
import { useState } from "react";
import { useOrganization } from "@/components/OrganizationProvider";
import { useMutation } from "convex/react";
import { useToast } from "@/components/Toast";

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

const formatPhone = (s?: string) => {
    if (!s) return "";
    const cleaned = s.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return s;
};

const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
    pending: {
        icon: <Clock size={14} />,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
    },
    paid: {
        icon: <CheckCircle2 size={14} />,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
    },
    processing: {
        icon: <Package size={14} />,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
    },
    shipped: {
        icon: <Truck size={14} />,
        color: "text-indigo-500",
        bg: "bg-indigo-500/10",
        border: "border-indigo-500/20",
    },
    delivered: {
        icon: <CheckCircle2 size={14} />,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
    },
    cancelled: {
        icon: <XCircle size={14} />,
        color: "text-red-500",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
    },
    refunded: {
        icon: <XCircle size={14} />,
        color: "text-slate-400",
        bg: "bg-slate-500/10",
        border: "border-slate-500/20",
    },
};

export default function CustomerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const customerId = params.customerId as Id<"customers">;
    const { currentOrg } = useOrganization();
    const toast = useToast();
    const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);

    // Edit mode state
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Chat state
    const [isCreatingChat, setIsCreatingChat] = useState(false);

    const updateCustomer = useMutation(api.customers.update);
    const createChat = useMutation(api.chat.create);
    const customerData = useQuery(api.customers.get, { customerId });

    // Initialize edit fields when customer data loads
    const handleStartChat = async () => {
        if (!currentOrg || !customerData) return;

        setIsCreatingChat(true);
        try {
            const conversationId = await createChat({
                orgId: currentOrg._id,
                type: "support",
                title: `Support: ${customerData.name}`,
                participantIds: [], // Initially no internal participants assigned
                customerInfo: {
                    name: customerData.name,
                    email: customerData.email,
                    customerId: customerData._id,
                },
            });

            router.push(`/admin/chat?conversationId=${conversationId}`);
        } catch (error) {
            console.error("Failed to start chat:", error);
            toast.error("Error", "Failed to start chat conversation");
        } finally {
            setIsCreatingChat(false);
        }
    };

    const startEditing = () => {
        if (customerData) {
            setEditName(customerData.name);
            setEditPhone(customerData.phone || "");
            setIsEditing(true);
        }
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setEditName("");
        setEditPhone("");
    };

    const saveChanges = async () => {
        setIsSaving(true);
        try {
            await updateCustomer({
                customerId,
                name: editName,
                phone: editPhone || undefined,
            });
            toast.success("Customer Updated", "Profile changes saved successfully");
            setIsEditing(false);
        } catch (error) {
            toast.error("Update Failed", String(error));
        } finally {
            setIsSaving(false);
        }
    };

    if (customerData === undefined) {
        return (
            <div className="p-12 text-center animate-pulse text-muted-foreground">
                Loading customer details...
            </div>
        );
    }

    if (customerData === null) {
        return (
            <div className="p-12 text-center">
                <h2 className="text-xl font-semibold text-foreground">Customer not found</h2>
                <Link
                    href="/admin/customers"
                    className="text-purple-500 hover:underline mt-2 inline-block"
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
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} className="text-muted-foreground" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{customer.name}</h1>
                        <p className="text-muted-foreground">Customer since {formatDate(customer.firstSeenAt)}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsCreateOrderOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors shadow-sm font-bold"
                    >
                        <ShoppingBag size={18} />
                        Create Order
                    </button>
                    <button
                        onClick={handleStartChat}
                        disabled={isCreatingChat}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-background border border-border text-foreground rounded-full hover:bg-muted transition-colors shadow-sm font-medium disabled:opacity-75"
                    >
                        {isCreatingChat ? (
                            <div className="h-4.5 w-4.5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                        ) : (
                            <MessageSquare size={18} />
                        )}
                        Chat
                    </button>
                    {customer.phone && (
                        <a
                            href={`tel:${customer.phone}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-background border border-border text-foreground rounded-full hover:bg-muted transition-colors shadow-sm font-medium"
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
                <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                            <User size={18} className="text-purple-500" />
                            Contact Information
                        </h3>
                        {!isEditing ? (
                            <button
                                onClick={startEditing}
                                className="p-2 text-muted-foreground hover:text-purple-500 hover:bg-purple-500/10 rounded-lg transition-colors"
                                title="Edit customer"
                            >
                                <Pencil size={16} />
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={saveChanges}
                                    disabled={isSaving}
                                    className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors disabled:opacity-50"
                                    title="Save"
                                >
                                    <Check size={16} />
                                </button>
                                <button
                                    onClick={cancelEditing}
                                    disabled={isSaving}
                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                    title="Cancel"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Name</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                                    placeholder="Customer name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Email (read-only)</label>
                                <div className="flex items-center gap-3 px-3 py-2 bg-muted rounded-lg text-muted-foreground text-sm border border-border">
                                    <Mail size={14} />
                                    {customer.email}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={editPhone}
                                    onChange={(e) => setEditPhone(e.target.value)}
                                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-foreground">
                                <User size={16} className="text-muted-foreground" />
                                <span className="font-medium">{customer.name}</span>
                            </div>
                            <div className="flex items-center gap-3 text-foreground">
                                <Mail size={16} className="text-muted-foreground" />
                                <a
                                    href={`mailto:${customer.email}`}
                                    className="text-purple-500 hover:underline"
                                >
                                    {customer.email}
                                </a>
                            </div>
                            {customer.phone && (
                                <div className="flex items-center gap-3 text-foreground">
                                    <Phone size={16} className="text-muted-foreground" />
                                    {formatPhone(customer.phone)}
                                </div>
                            )}
                            {customer.address && (
                                <div className="flex items-start gap-3 text-foreground">
                                    <MapPin size={16} className="text-muted-foreground mt-0.5" />
                                    <span className="whitespace-pre-wrap">{customer.address}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Lifetime Value Card */}
                <div className="bg-card rounded-xl shadow-sm border border-emerald-500/20 p-6 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp size={64} className="text-emerald-500" />
                    </div>
                    <h3 className="font-medium text-emerald-500 mb-2 flex items-center gap-2">
                        <TrendingUp size={18} />
                        Lifetime Value
                    </h3>
                    <p className="text-4xl font-bold text-foreground">{formatPrice(customer.totalSpend)}</p>
                    <p className="text-muted-foreground mt-2 text-sm">
                        {customer.totalOrders > 0
                            ? `Avg. ${formatPrice(customer.totalSpend / customer.totalOrders)} per order`
                            : "No orders yet"}
                    </p>
                </div>

                {/* Orders Card */}
                <div className="bg-card rounded-xl shadow-sm border border-purple-500/20 p-6 relative overflow-hidden group hover:border-purple-500/40 transition-colors">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShoppingBag size={64} className="text-purple-500" />
                    </div>
                    <h3 className="font-medium text-purple-500 mb-2 flex items-center gap-2">
                        <ShoppingBag size={18} />
                        Total Orders
                    </h3>
                    <p className="text-4xl font-bold text-foreground">{customer.totalOrders}</p>
                    <p className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
                        <Calendar size={14} />
                        Last order: {formatDate(customer.lastSeenAt)}
                    </p>
                </div>
            </div>

            {/* Order History */}
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Package size={18} className="text-muted-foreground" />
                        Order History
                    </h3>
                </div>

                {orders.length === 0 ? (
                    <div className="p-12 text-center">
                        <ShoppingBag className="mx-auto text-slate-700 mb-4" size={48} />
                        <p className="text-muted-foreground">No orders from this customer yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {orders.map((order) => {
                            const status = statusConfig[order.status] || statusConfig.pending;
                            return (
                                <Link
                                    key={order._id}
                                    href={`/admin/orders/${order._id}`}
                                    className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center ${status.bg}`}
                                        >
                                            <span className={status.color}>{status.icon}</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">
                                                Order #{order.orderNumber}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDateTime(order.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-foreground">
                                            {formatPrice(order.totalAmount)}
                                        </p>
                                        <span
                                            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${status.bg} ${status.color} ${status.border}`}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-card rounded-xl shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] border border-border">
                <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30">
                    <h3 className="font-semibold text-lg text-foreground">Create Order for {customer.name}</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <XCircle size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 text-foreground">
                    {/* Customer Info Display */}
                    <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border">
                        <h4 className="text-sm font-medium text-foreground mb-2">Customer</h4>
                        <div className="text-sm text-muted-foreground">
                            <div>{customer.name}</div>
                            <div>{customer.email}</div>
                            {customer.phone && <div>{formatPhone(customer.phone)}</div>}
                        </div>
                    </div>

                    {/* Item Selection */}
                    <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border">
                        <h4 className="text-sm font-medium text-foreground mb-3">Add Items</h4>
                        <div className="flex gap-2">
                            <select
                                className="flex-1 px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                                className="w-20 px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                min="1"
                            />
                            <button
                                type="button"
                                onClick={addItem}
                                disabled={!selectedVariantId}
                                className="px-4 py-2 bg-foreground text-card rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-foreground/90 transition-colors"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Cart Table */}
                    <div className="mb-6 border border-border rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                                <tr>
                                    <th className="px-4 py-2">Item</th>
                                    <th className="px-4 py-2 text-right">Qty</th>
                                    <th className="px-4 py-2 text-right">Price</th>
                                    <th className="px-4 py-2 text-right">Total</th>
                                    <th className="w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {lineItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground italic">No items added</td>
                                    </tr>
                                ) : (
                                    lineItems.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-2 text-foreground">{item.name}</td>
                                            <td className="px-4 py-2 text-right text-foreground">{item.quantity}</td>
                                            <td className="px-4 py-2 text-right text-foreground">{formatPrice(item.price)}</td>
                                            <td className="px-4 py-2 text-right font-medium text-foreground">{formatPrice(item.price * item.quantity)}</td>
                                            <td className="px-4 py-2 text-right">
                                                <button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-400">
                                                    <XCircle size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            <tfoot className="bg-muted/30 font-semibold text-foreground border-t border-border">
                                <tr>
                                    <td colSpan={3} className="px-4 py-3 text-right">Total:</td>
                                    <td className="px-4 py-3 text-right">{formatPrice(total)}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">
                            {error}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-border bg-muted/30 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/50 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || lineItems.length === 0}
                        className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm disabled:opacity-50 transition-colors"
                    >
                        {isSubmitting ? "Placing Order..." : "Place Order"}
                    </button>
                </div>
            </div>
        </div>
    );
}
