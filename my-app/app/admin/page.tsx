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
    Building2
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
