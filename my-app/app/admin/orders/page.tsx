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
    Filter
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
        return <div className="p-12 text-center text-slate-500">Select an organization first.</div>;
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Orders</h1>
                    <p className="text-slate-500 mt-1">Manage customer orders and fulfillment</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm font-medium"
                    >
                        <Plus size={18} />
                        Create Manual Order
                    </button>
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by order #, customer name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 bg-white"
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
                </div>

                {/* Results count */}
                {orders && (
                    <div className="mt-3 text-sm text-slate-500">
                        Showing {filteredOrders?.length || 0} of {orders.length} orders
                        {searchQuery && <span className="ml-1">matching &quot;{searchQuery}&quot;</span>}
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Order #</th>
                                <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider text-right">Total</th>
                                <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {!orders ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredOrders && filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                                        {searchQuery || statusFilter !== "all"
                                            ? "No orders match your search criteria."
                                            : "No orders found."}
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders?.map((order) => (
                                    <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-sm">
                                            <Link
                                                href={`/admin/orders/${order._id}`}
                                                className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                                            >
                                                {order.orderNumber}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/admin/customers?email=${encodeURIComponent(order.customerInfo.email)}`}
                                                className="text-sm font-medium text-slate-900 hover:text-blue-600 hover:underline"
                                            >
                                                {order.customerInfo.name}
                                            </Link>
                                            <div className="text-xs text-slate-500">{order.customerInfo.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <OrderStatusBadge status={order.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-slate-900">
                                            {formatPrice(order.totalAmount)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/admin/orders/${order._id}`}
                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
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
        pending: "bg-amber-100 text-amber-700 border-amber-200",
        paid: "bg-blue-100 text-blue-700 border-blue-200",
        processing: "bg-indigo-100 text-indigo-700 border-indigo-200",
        shipped: "bg-purple-100 text-purple-700 border-purple-200",
        delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
        cancelled: "bg-slate-100 text-slate-600 border-slate-200",
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h3 className="font-semibold text-lg text-slate-900">Create Manual Order</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
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
                                                    <X size={16} />
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
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-slate-700">Customer Details</h4>
                            {(customerName || customerEmail) && (
                                <button
                                    type="button"
                                    onClick={clearCustomer}
                                    className="text-xs text-purple-600 hover:text-purple-800"
                                >
                                    Clear customer
                                </button>
                            )}
                        </div>

                        {/* Customer Search */}
                        <div className="relative">
                            <label className="block text-xs font-medium text-slate-500 mb-1">
                                Search Existing Customers
                            </label>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                                    {filteredCustomers.length === 0 ? (
                                        <div className="p-3 text-sm text-slate-500 text-center">
                                            No customers found. Create a new customer below.
                                        </div>
                                    ) : (
                                        filteredCustomers.map((customer) => (
                                            <button
                                                key={customer._id}
                                                type="button"
                                                onClick={() => selectCustomer(customer)}
                                                className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors border-b border-slate-100 last:border-b-0"
                                            >
                                                <div className="font-medium text-slate-900">{customer.name}</div>
                                                <div className="text-sm text-slate-500">{customer.email}</div>
                                                {customer.phone && (
                                                    <div className="text-xs text-slate-400">{customer.phone}</div>
                                                )}
                                                <div className="text-xs text-purple-600 mt-1">
                                                    {customer.totalOrders} order{customer.totalOrders !== 1 ? 's' : ''} • {formatPrice(customer.totalSpend)}
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="text-center text-xs text-slate-400">- OR -</div>

                        {/* New Customer Form */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                    value={customerName}
                                    onChange={(e) => {
                                        setCustomerName(e.target.value);
                                        setShowCustomerDropdown(false);
                                    }}
                                    placeholder="Enter customer name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                    value={customerEmail}
                                    onChange={(e) => {
                                        setCustomerEmail(e.target.value);
                                        setShowCustomerDropdown(false);
                                    }}
                                    placeholder="customer@email.com"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-slate-500 mb-1">Phone (optional)</label>
                                <input
                                    type="tel"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
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
