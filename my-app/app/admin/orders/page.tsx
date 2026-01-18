/* eslint-disable */
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useOrganization } from "@/components/OrganizationProvider";
import {
    Plus,
    Search,
    ShoppingBag,
    X,
    Filter,
    ChevronRight
} from "lucide-react";
import Link from "next/link";
import { Id } from "../../../convex/_generated/dataModel";

const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(cents / 100);
};

export default function OrdersPage() {
    const { currentOrg } = useOrganization();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    const orders = useQuery(
        api.orders.list,
        currentOrg ? { orgId: currentOrg._id } : "skip"
    );

    // Filter orders based on search and status
    const filteredOrders = orders?.filter(order => {
        // Status filter
        if (statusFilter !== "all" && order.status !== statusFilter) {
            return false;
        }

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const matchesOrderNumber = order.orderNumber.toLowerCase().includes(query);
            const matchesCustomerName = order.customerInfo.name.toLowerCase().includes(query);
            const matchesCustomerEmail = order.customerInfo.email.toLowerCase().includes(query);
            return matchesOrderNumber || matchesCustomerName || matchesCustomerEmail;
        }

        return true;
    });

    if (!currentOrg) {
        return <div className="p-12 text-center text-muted-foreground">Select an organization first.</div>;
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Orders</h1>
                    <p className="text-muted-foreground mt-1">Manage customer orders and fulfillment</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-foreground text-card rounded-xl hover:bg-foreground/90 transition-colors shadow-sm font-medium min-h-[44px]"
                    >
                        <Plus size={18} />
                        Create Manual Order
                    </button>
                </div>
            </div>

            {/* Search and Filter Section - Mobile Stacked */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-4 space-y-3">
                {/* Search Input - Full Width on Mobile */}
                <div className="relative">
                    <Search size={18} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        inputMode="search"
                        placeholder="Search by order #, customer name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 sm:pl-12 pr-10 sm:pr-4 py-3 sm:py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-input text-foreground placeholder:text-muted-foreground min-h-[48px] sm:min-h-0"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Status Filter - Full Width on Mobile */}
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-muted-foreground shrink-0" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="flex-1 px-4 py-3 sm:py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-input bg-card text-foreground min-h-[48px] sm:min-h-0"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {/* Results count */}
                {orders && (
                    <div className="pt-1 text-sm text-muted-foreground">
                        Showing {filteredOrders?.length || 0} of {orders.length} orders
                        {searchQuery && <span className="ml-1">matching "{searchQuery}"</span>}
                    </div>
                )}
            </div>

            {/* Mobile: Card Layout */}
            <div className="sm:hidden space-y-4">
                {!orders ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="bg-card rounded-xl p-4 border border-border animate-pulse">
                            <div className="h-4 bg-muted rounded w-1/3 mb-3"></div>
                            <div className="h-3 bg-muted rounded w-full mb-2"></div>
                            <div className="h-3 bg-muted rounded w-2/3"></div>
                        </div>
                    ))
                ) : filteredOrders && filteredOrders.length === 0 ? (
                    <div className="bg-card rounded-xl p-8 text-center text-muted-foreground border border-border">
                        {searchQuery || statusFilter !== "all"
                            ? "No orders match your search criteria."
                            : "No orders found."}
                    </div>
                ) : (
                    filteredOrders?.map((order) => (
                        <div key={order._id} className="bg-card rounded-xl p-4 border border-border">
                            {/* Header - Order # and Status */}
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1 min-w-0">
                                    <Link
                                        href={`/admin/orders/${order._id}`}
                                        className="text-base font-bold text-foreground hover:text-primary truncate block"
                                    >
                                        {order.orderNumber}
                                    </Link>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <OrderStatusBadge status={order.status} />
                            </div>

                            {/* Customer Info */}
                            <div className="mb-3 pb-3 border-b border-border">
                                <p className="text-sm font-medium text-foreground truncate">{order.customerInfo.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{order.customerInfo.email}</p>
                            </div>

                            {/* Total and View Action */}
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-foreground">{formatPrice(order.totalAmount)}</span>
                                <Link
                                    href={`/admin/orders/${order._id}`}
                                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 min-h-[40px] px-3"
                                >
                                    View <ChevronRight size={16} />
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop: Table Layout */}
            <div className="hidden sm:block bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-muted/30 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Order #</th>
                                <th className="px-6 py-4 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 font-semibold text-xs text-muted-foreground uppercase tracking-wider text-right">Total</th>
                                <th className="px-6 py-4 font-semibold text-xs text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {!orders ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-4"><div className="h-4 bg-muted rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredOrders && filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                                        {searchQuery || statusFilter !== "all"
                                            ? "No orders match your search criteria."
                                            : "No orders found."}
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders?.map((order) => (
                                    <tr key={order._id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-mono text-sm">
                                            <Link
                                                href={`/admin/orders/${order._id}`}
                                                className="text-primary hover:text-primary/80 hover:underline font-medium"
                                            >
                                                {order.orderNumber}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/admin/customers?email=${encodeURIComponent(order.customerInfo.email)}`}
                                                className="text-sm font-medium text-foreground hover:text-primary hover:underline"
                                            >
                                                {order.customerInfo.name}
                                            </Link>
                                            <div className="text-xs text-muted-foreground">{order.customerInfo.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <OrderStatusBadge status={order.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-foreground">
                                            {formatPrice(order.totalAmount)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/admin/orders/${order._id}`}
                                                className="text-primary hover:text-primary/80 text-sm font-medium"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isCreateOpen && (
                <CreateOrderModal
                    orgId={currentOrg._id}
                    onClose={() => setIsCreateOpen(false)}
                />
            )}
        </div>
    );
}

function OrderStatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        paid: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        processing: "bg-purple-500/10 text-purple-500 border-purple-500/20",
        shipped: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
        delivered: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        cancelled: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${styles[status] || styles.pending}`}>
            {status}
        </span>
    );
}

function CreateOrderModal({ orgId, onClose }: { orgId: Id<"organizations">, onClose: () => void }) {
    const createOrder = useMutation(api.orders.create);
    const inventory = useQuery(api.inventory.list, { orgId });
    const allCustomers = useQuery(api.customers.list, { orgId });

    const [lineItems, setLineItems] = useState<Array<{ variantId: string, quantity: number, price: number, name: string }>>([]);
    const [selectedVariantId, setSelectedVariantId] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [customerName, setCustomerName] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerSearch, setCustomerSearch] = useState("");
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const availableVariants = inventory?.filter(i => i.stock > 0) || [];
    const selectedVariant = availableVariants.find(v => v._id === selectedVariantId);

    // Filter customers based on search
    const filteredCustomers = allCustomers?.filter(customer =>
        customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        customer.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
        customer.phone?.includes(customerSearch)
    ).slice(0, 10) || [];

    const selectCustomer = (customer: any) => {
        setCustomerName(customer.name);
        setCustomerEmail(customer.email);
        setCustomerPhone(customer.phone || "");
        setCustomerSearch("");
        setShowCustomerDropdown(false);
    };

    const clearCustomer = () => {
        setCustomerName("");
        setCustomerEmail("");
        setCustomerPhone("");
        setCustomerSearch("");
    };

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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-card w-full sm:max-w-2xl rounded-t-2xl sm:rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-full border border-border slide-up-sheet">
                {/* Mobile Swipe Handle */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="w-12 h-1.5 bg-muted rounded-full" />
                </div>

                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border flex justify-between items-center bg-muted/30">
                    <h3 className="font-semibold text-base sm:text-lg text-foreground">Create Manual Order</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-2 -mr-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 sm:p-6 overflow-y-auto flex-1 font-sans space-y-4 sm:space-y-6">
                    {/* Item Selection */}
                    <div className="p-3 sm:p-4 bg-muted/30 rounded-xl border border-border space-y-2 sm:space-y-3">
                        <h4 className="text-sm font-medium text-foreground">Add Items</h4>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <select
                                className="flex-1 px-4 py-3 sm:py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[48px] sm:min-h-0"
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
                                inputMode="decimal"
                                className="w-full sm:w-20 px-4 py-3 sm:py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[48px] sm:min-h-0"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                min="1"
                            />
                            <button
                                type="button"
                                onClick={addItem}
                                disabled={!selectedVariantId}
                                className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-foreground text-background rounded-xl text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity min-h-[48px] sm:min-h-0"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Cart Table */}
                    <div className="border border-border rounded-xl overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/30 text-muted-foreground border-b border-border">
                                <tr>
                                    <th className="px-3 sm:px-4 py-2">Item</th>
                                    <th className="px-3 sm:px-4 py-2 text-right">Qty</th>
                                    <th className="px-3 sm:px-4 py-2 text-right">Price</th>
                                    <th className="px-3 sm:px-4 py-2 text-right">Total</th>
                                    <th className="w-8 sm:w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {lineItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-3 sm:px-4 py-6 sm:py-8 text-center text-muted-foreground italic">No items added</td>
                                    </tr>
                                ) : (
                                    lineItems.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="px-3 sm:px-4 py-2 text-foreground text-xs sm:text-sm">{item.name}</td>
                                            <td className="px-3 sm:px-4 py-2 text-right text-foreground">{item.quantity}</td>
                                            <td className="px-3 sm:px-4 py-2 text-right text-foreground">{formatPrice(item.price)}</td>
                                            <td className="px-3 sm:px-4 py-2 text-right font-medium text-foreground">{formatPrice(item.price * item.quantity)}</td>
                                            <td className="px-3 sm:px-4 py-2 text-right">
                                                <button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-400 p-1">
                                                    <X size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            <tfoot className="bg-muted/30 font-semibold text-foreground border-t border-border">
                                <tr>
                                    <td colSpan={3} className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm">Total:</td>
                                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm">{formatPrice(total)}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-foreground">Customer Details</h4>
                            {(customerName || customerEmail) && (
                                <button
                                    type="button"
                                    onClick={clearCustomer}
                                    className="text-xs text-primary hover:text-primary/80"
                                >
                                    Clear customer
                                </button>
                            )}
                        </div>

                        {/* Customer Search */}
                        <div className="relative">
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                Search Existing Customers
                            </label>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    inputMode="text"
                                    className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground min-h-[48px] sm:min-h-0"
                                    placeholder="Search by name, email, or phone..."
                                    value={customerSearch}
                                    onChange={(e) => {
                                        setCustomerSearch(e.target.value);
                                        setShowCustomerDropdown(true);
                                    }}
                                    onFocus={() => setShowCustomerDropdown(true)}
                                />
                            </div>

                            {/* Customer Dropdown */}
                            {showCustomerDropdown && customerSearch && (
                                <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-60 overflow-auto">
                                    {filteredCustomers.length === 0 ? (
                                        <div className="p-3 text-sm text-muted-foreground text-center">
                                            No customers found. Create a new customer below.
                                        </div>
                                    ) : (
                                        filteredCustomers.map((customer) => (
                                            <button
                                                key={customer._id}
                                                type="button"
                                                onClick={() => selectCustomer(customer)}
                                                className="w-full px-4 py-3 text-left hover:bg-muted/30 transition-colors border-b border-border last:border-b-0"
                                            >
                                                <div className="font-medium text-foreground">{customer.name}</div>
                                                <div className="text-sm text-muted-foreground">{customer.email}</div>
                                                {customer.phone && (
                                                    <div className="text-xs text-muted-foreground">{customer.phone}</div>
                                                )}
                                                <div className="text-xs text-primary mt-1">
                                                    {customer.totalOrders} order{customer.totalOrders !== 1 ? 's' : ''} • {formatPrice(customer.totalSpend)}
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="text-center text-xs text-muted-foreground">- OR -</div>

                        {/* New Customer Form - Stacked on mobile */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Name</label>
                                <input
                                    type="text"
                                    inputMode="text"
                                    required
                                    className="w-full px-4 py-3 sm:py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[48px] sm:min-h-0"
                                    value={customerName}
                                    onChange={(e) => {
                                        setCustomerName(e.target.value);
                                        setShowCustomerDropdown(false);
                                    }}
                                    placeholder="Enter customer name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
                                <input
                                    type="email"
                                    inputMode="email"
                                    required
                                    className="w-full px-4 py-3 sm:py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[48px] sm:min-h-0"
                                    value={customerEmail}
                                    onChange={(e) => {
                                        setCustomerEmail(e.target.value);
                                        setShowCustomerDropdown(false);
                                    }}
                                    placeholder="customer@email.com"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Phone (optional)</label>
                                <input
                                    type="tel"
                                    inputMode="tel"
                                    className="w-full px-4 py-3 sm:py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[48px] sm:min-h-0"
                                    value={customerPhone}
                                    onChange={(e) => {
                                        setCustomerPhone(e.target.value);
                                        setShowCustomerDropdown(false);
                                    }}
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl">
                            {error}
                        </div>
                    )}
                </div>

                <div className="p-4 sm:p-4 border-t border-border bg-muted/30 flex flex-col-reverse sm:flex-row justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-3 sm:py-2 text-sm font-medium text-muted-foreground hover:bg-muted/50 rounded-xl min-h-[48px] sm:min-h-0">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || lineItems.length === 0}
                        className="px-6 py-3 sm:py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm disabled:opacity-50 min-h-[48px] sm:min-h-0"
                    >
                        {isSubmitting ? "Placing Order..." : "Place Order"}
                    </button>
                </div>
            </div>
        </div>
    );
}
