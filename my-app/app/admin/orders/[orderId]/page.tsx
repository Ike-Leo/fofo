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

    if (order === undefined) return <div className="p-12 text-center animate-pulse text-muted-foreground">Loading order...</div>;
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
            <Link href="/admin/orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ArrowLeft size={16} className="mr-2" />
                Back to Orders
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-foreground">{order.orderNumber}</h1>
                        <StatusBadge status={displayStatus} size="lg" />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-muted/30 font-medium text-foreground">
                            Order Items
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-card border-b border-border text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-3 font-normal">Product</th>
                                    <th className="px-6 py-3 font-normal text-right">Price</th>
                                    <th className="px-6 py-3 font-normal text-right">Qty</th>
                                    <th className="px-6 py-3 font-normal text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {order.items.map((item: any) => (
                                    <tr key={item._id}>
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/admin/products/${item.productId}`}
                                                className="font-medium text-foreground hover:text-primary hover:underline"
                                            >
                                                {item.productName}
                                            </Link>
                                            <div className="text-muted-foreground text-xs">{item.variantName}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right tabular-nums text-foreground">{formatPrice(item.price)}</td>
                                        <td className="px-6 py-4 text-right tabular-nums text-foreground">{item.quantity}</td>
                                        <td className="px-6 py-4 text-right font-medium tabular-nums text-foreground">
                                            {formatPrice(item.price * item.quantity)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-muted/30 border-t border-border">
                                <tr>
                                    <td colSpan={3} className="px-6 py-4 text-right font-medium text-muted-foreground">Total</td>
                                    <td className="px-6 py-4 text-right font-bold text-foreground text-lg">
                                        {formatPrice(order.totalAmount)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Sidebar: Customer Info */}
                <div className="space-y-6">
                    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                        <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
                            <User size={18} className="text-muted-foreground" />
                            Customer
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Contact</div>
                                <div className="font-medium text-foreground">{order.customerInfo.name}</div>
                                <Link href={`mailto:${order.customerInfo.email}`} className="text-primary hover:underline">
                                    {order.customerInfo.email}
                                </Link>
                                {order.customerInfo.phone && <div className="text-muted-foreground">{order.customerInfo.phone}</div>}
                            </div>
                            {order.customerInfo.address && (
                                <div>
                                    <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1 mt-3">Shipping Address</div>
                                    <div className="text-foreground whitespace-pre-wrap flex items-start gap-2">
                                        <MapPin size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                                        {order.customerInfo.address}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timeline placeholder - could be real logs later */}
                    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                        <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
                            <Clock size={18} className="text-muted-foreground" />
                            Timeline
                        </h3>
                        <div className="relative pl-4 border-l-2 border-muted space-y-6">
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-muted-foreground border-2 border-card ring-1 ring-muted"></div>
                                <div className="text-sm text-foreground font-medium">Order Created</div>
                                <div className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</div>
                            </div>
                            {/* Simple logic for timeline points based on status */}
                            {order.updatedAt > order.createdAt && (
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-500/50 border-2 border-card ring-1 ring-muted"></div>
                                    <div className="text-sm text-foreground font-medium">Last Updated</div>
                                    <div className="text-xs text-muted-foreground">{new Date(order.updatedAt).toLocaleString()}</div>
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
                    prefillCustomer={order.customerInfo}
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
        pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        paid: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        processing: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
        shipped: "bg-purple-500/10 text-purple-500 border-purple-500/20",
        delivered: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        cancelled: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    };
    const sizeClasses = size === "lg" ? "px-3 py-1 text-sm border" : "px-2.5 py-0.5 text-xs border";

    return (
        <span className={`inline-flex items-center rounded-full font-medium capitalize ${sizeClasses} ${styles[status]}`}>
            {status}
        </span>
    );
}

function ActionButton({ onClick, label, icon, color, loading }: any) {
    // Map abstract colors to concrete classes
    const colors: Record<string, string> = {
        // Map everything to the new Two-Tone system (Brand Blue + Neutral)
        blue: "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm", // Primary Action
        emerald: "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm", // Converted to Primary
        indigo: "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm", // Converted to Primary
        purple: "bg-background border border-border hover:bg-muted text-foreground shadow-sm", // Secondary Action
        slate: "bg-background border border-border hover:bg-destructive/10 hover:text-destructive text-muted-foreground shadow-sm", // Destructive/Ghost
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

function CreateOrderModal({ orgId, onClose, prefillCustomer }: {
    orgId: Id<"organizations">,
    onClose: () => void,
    prefillCustomer?: { name: string; email: string; phone?: string; }
}) {
    const createOrder = useMutation(api.orders.create);
    const inventory = useQuery(api.inventory.list, { orgId });

    const [lineItems, setLineItems] = useState<Array<{ variantId: string, quantity: number, price: number, name: string }>>([]);
    const [selectedVariantId, setSelectedVariantId] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [customerName, setCustomerName] = useState(prefillCustomer?.name || "");
    const [customerEmail, setCustomerEmail] = useState(prefillCustomer?.email || "");
    const [customerPhone, setCustomerPhone] = useState(prefillCustomer?.phone || "");

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-card rounded-xl shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] border border-border">
                <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30">
                    <h3 className="font-semibold text-lg text-foreground">Create Manual Order</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <XCircle size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 text-foreground">
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

                    {/* Customer Info */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-foreground">Customer Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Phone (optional)</label>
                                <input
                                    type="tel"
                                    className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>
                        </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-card rounded-xl shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] border border-border">
                <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30">
                    <h3 className="font-semibold text-lg text-foreground">Repeat Order</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <XCircle size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 text-foreground">
                    {/* Customer Info Display */}
                    <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border">
                        <h4 className="text-sm font-medium text-foreground mb-2">Customer</h4>
                        <div className="text-sm text-muted-foreground">
                            <div><span className="font-medium text-foreground">{originalOrder.customerInfo.name}</span></div>
                            <div>{originalOrder.customerInfo.email}</div>
                            {originalOrder.customerInfo.phone && <div>{originalOrder.customerInfo.phone}</div>}
                        </div>
                    </div>

                    {/* Cart Table */}
                    <div className="mb-6 border border-border rounded-lg overflow-hidden">
                        <div className="bg-muted/30 px-4 py-2 border-b border-border">
                            <p className="text-xs text-muted-foreground">Adjust quantities before confirming</p>
                        </div>
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
                                            <td className="px-4 py-2 text-right">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(idx, parseInt(e.target.value) || 1)}
                                                    className="w-20 px-2 py-1 bg-card border border-border rounded text-right text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            </td>
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
