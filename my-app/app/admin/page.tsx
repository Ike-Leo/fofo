/* eslint-disable */
"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useOrganization } from "@/components/OrganizationProvider";
import { CreateOrganizationForm } from "@/components/CreateOrganizationForm";
import {
    DollarSign,
    ShoppingBag,
    Users,
    AlertTriangle,
    TrendingUp,
    Building2,
    MessageSquare,
    Star
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(cents / 100);
};

export default function AdminDashboard() {
    const { currentOrg, userOrgs, isLoading } = useOrganization();
    const router = useRouter();

    // We conditionally fetch only if org is present
    const stats = useQuery(api.analytics.getDashboardStats,
        currentOrg ? { orgId: currentOrg._id } : "skip"
    );

    const salesData = useQuery(api.analytics.getSalesChart,
        currentOrg ? { orgId: currentOrg._id } : "skip"
    );

    const recentOrders = useQuery(api.orders.list,
        currentOrg ? { orgId: currentOrg._id } : "skip"
    );

    // Show loading state
    if (isLoading) {
        return (
            <div className="p-12 text-center animate-pulse text-slate-400">
                Loading...
            </div>
        );
    }

    // Show organization creation form when no organizations exist
    if (!userOrgs || userOrgs.length === 0) {
        return (
            <div className="p-8 max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 className="text-purple-600" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome to UCCP</h1>
                    <p className="text-slate-500">
                        Create your first organization to get started with the platform.
                    </p>
                </div>
                <CreateOrganizationForm onSuccess={() => window.location.reload()} />
            </div>
        );
    }

    // Show org selector when org exists but not selected
    if (!currentOrg) {
        return (
            <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="text-slate-400" size={32} />
                </div>
                <h2 className="text-xl font-semibold text-slate-700 mb-2">Select an Organization</h2>
                <p className="text-slate-500">
                    Use the organization switcher in the header to select an organization.
                </p>
            </div>
        );
    }

    if (!stats) {
        return <div className="p-12 text-center animate-pulse">Loading dashboard...</div>;
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total Revenue"
                    value={formatPrice(stats.totalRevenue)}
                    icon={<DollarSign className="text-emerald-600" />}
                    bg="bg-emerald-50"
                    onClick={() => router.push('/admin/orders')}
                />
                <KPICard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={<ShoppingBag className="text-blue-600" />}
                    bg="bg-blue-50"
                    onClick={() => router.push('/admin/orders')}
                />
                <KPICard
                    title="Customers"
                    value={stats.totalCustomers}
                    icon={<Users className="text-purple-600" />}
                    bg="bg-purple-50"
                    onClick={() => router.push('/admin/customers')}
                />
                <KPICard
                    title="Products"
                    value={stats.totalProducts}
                    icon={<ShoppingBag className="text-orange-600" />}
                    bg="bg-orange-50"
                    onClick={() => router.push('/admin/products')}
                />
            </div>

            {/* Sales Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                    <TrendingUp size={20} className="text-slate-400" />
                    Sales Overview (Last 30 Days)
                </h3>
                <div className="h-80 w-full">
                    {salesData && salesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(val) => new Date(val).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tickFormatter={(val) => `$${val}`}
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    formatter={(value: number | undefined) => [value ? `$${value.toFixed(2)}` : '$0.00', 'Revenue']}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                />
                                <Bar dataKey="revenue" fill="#0f172a" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 italic">
                            No sales data yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Customer Reviews Widget */}
            <CustomerReviewsWidget recentOrders={recentOrders || []} />
        </div>
    );
}

function KPICard({ title, value, icon, bg, textColor = "text-slate-900", onClick }: any) {
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-start justify-between cursor-pointer transition-all hover:shadow-md hover:border-slate-300 active:scale-[0.98]"
        >
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                <h2 className={`text-2xl font-bold ${textColor}`}>{value}</h2>
            </div>
            <div className={`p-3 rounded-lg ${bg}`}>
                {icon}
            </div>
        </div>
    );
}

function CustomerReviewsWidget({ recentOrders }: { recentOrders: any[] }) {
    // Get the 5 most recent orders as placeholder for "reviews"
    const recentReviews = recentOrders.slice(0, 5);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <MessageSquare size={20} className="text-purple-600" />
                    Customer Reviews
                </h3>
                <span className="text-sm text-slate-500 italic">
                    Showing recent orders (placeholder)
                </span>
            </div>

            {recentReviews.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                    <MessageSquare className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-slate-500">No recent customer activity.</p>
                    <p className="text-sm text-slate-400 mt-1">Reviews will appear here as customers engage.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {recentReviews.map((order) => (
                        <div
                            key={order._id}
                            className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-amber-500">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={14}
                                                fill={star <= 4 ? "currentColor" : "none"}
                                                className={star <= 4 ? "text-amber-500" : "text-amber-200"}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm font-medium text-slate-900">
                                        {order.customerInfo.name}
                                    </span>
                                </div>
                                <span className="text-xs text-slate-500">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-sm text-slate-700">
                                Ordered {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • {formatPrice(order.totalAmount)}
                            </p>
                            <p className="text-xs text-slate-500 mt-1 italic">
                                "Great service! Fast delivery and quality products."
                            </p>
                            <p className="text-xs text-purple-600 mt-2 hover:underline cursor-pointer">
                                View Order →
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
