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
    XCircle,
    Copy,
    Plus
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
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isRepeatModalOpen, setIsRepeatModalOpen] = useState(false);

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

                <div className="flex gap-3 flex-wrap">
                    <ActionButton
                        onClick={() => setIsCreateModalOpen(true)}
                        label="Create Another Order"
                        icon={<Plus size={16} />}
                        color="purple"
                        loading={false}
                    />
                    <ActionButton
                        onClick={() => setIsRepeatModalOpen(true)}
                        label="Repeat Order"
                        icon={<Copy size={16} />}
                        color="emerald"
                        loading={false}
                    />
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

            {isCreateModalOpen && (
                <CreateOrderModal
                    orgId={order.orgId}
                    onClose={() => setIsCreateModalOpen(false)}
                />
            )}

            {isRepeatModalOpen && (
                <RepeatOrderModal
                    orgId={order.orgId}
                    originalOrder={order}
                    onClose={() => setIsRepeatModalOpen(false)}
                />
            )}
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

function CreateOrderModal({ orgId, onClose }: { orgId: Id<"organizations">, onClose: () => void }) {
    const createOrder = useMutation(api.orders.create);
    const inventory = useQuery(api.inventory.list, { orgId });

    const [lineItems, setLineItems] = useState<Array<{ variantId: string, quantity: number, price: number, name: string }>>([]);
    const [selectedVariantId, setSelectedVariantId] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [customerName, setCustomerName] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");

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
                    name: customerName,
                    email: customerEmail,
                    phone: customerPhone || undefined,
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
                    <h3 className="font-semibold text-lg text-slate-900">Create Manual Order</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XCircle size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
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

                    {/* Customer Info */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-slate-700">Customer Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-slate-500 mb-1">Phone (optional)</label>
                                <input
                                    type="tel"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>
                        </div>
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

function RepeatOrderModal({ orgId, originalOrder, onClose }: { orgId: Id<"organizations">, originalOrder: any, onClose: () => void }) {
    const createOrder = useMutation(api.orders.create);
    const inventory = useQuery(api.inventory.list, { orgId });

    // Pre-fill with original order items
    const [lineItems, setLineItems] = useState<Array<{ variantId: string, quantity: number, price: number, name: string }>>(
        originalOrder.items.map((item: any) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            name: `${item.productName} - ${item.variantName}`
        }))
    );

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const availableVariants = inventory || [];

    const updateQuantity = (index: number, newQuantity: number) => {
        const item = lineItems[index];
        const variant = availableVariants.find(v => v._id === item.variantId);
        if (variant && newQuantity > variant.stock) {
            setError(`Only ${variant.stock} available for ${item.name}`);
            return;
        }
        setError(null);
        const newItems = [...lineItems];
        newItems[index].quantity = Math.max(1, newQuantity);
        setLineItems(newItems);
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
                customerInfo: originalOrder.customerInfo
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
                    <h3 className="font-semibold text-lg text-slate-900">Repeat Order</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XCircle size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {/* Customer Info Display */}
                    <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <h4 className="text-sm font-medium text-purple-900 mb-2">Customer</h4>
                        <div className="text-sm text-purple-700">
                            <div>{originalOrder.customerInfo.name}</div>
                            <div>{originalOrder.customerInfo.email}</div>
                            {originalOrder.customerInfo.phone && <div>{originalOrder.customerInfo.phone}</div>}
                        </div>
                    </div>

                    {/* Cart Table */}
                    <div className="mb-6 border border-slate-200 rounded-lg overflow-hidden">
                        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                            <p className="text-xs text-slate-600">Adjust quantities before confirming</p>
                        </div>
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
                                            <td className="px-4 py-2 text-right">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(idx, parseInt(e.target.value) || 1)}
                                                    className="w-20 px-2 py-1 border border-slate-300 rounded text-right text-sm"
                                                />
                                            </td>
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
