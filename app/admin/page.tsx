"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useOrganization } from "@/components/OrganizationProvider";
import { CreateOrganizationForm } from "@/components/CreateOrganizationForm";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
    DollarSign,
    ShoppingBag,
    Users,
    AlertTriangle,
    TrendingUp,
    Building2,
    Star,
    Package,
    ChevronRight
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
            <div className="p-12 text-center animate-shimmer text-secondary">
                Loading...
            </div>
        );
    }

    // Show organization creation form when no organizations exist
    if (!userOrgs || userOrgs.length === 0) {
        return (
            <div className="p-8 max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-accent-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 className="text-accent-secondary" size={32} />
                    </div>
                    <h1 className="text-display-lg font-bold text-primary mb-2">Welcome to UCCP</h1>
                    <p className="text-body-md text-secondary">
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
                <div className="w-16 h-16 bg-elevated/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="text-secondary" size={32} />
                </div>
                <h2 className="text-heading-xl font-bold text-primary mb-2">Select an Organization</h2>
                <p className="text-body-md text-secondary">
                    Use the organization switcher in the header to select an organization.
                </p>
            </div>
        );
    }

    if (!stats) {
        return <div className="p-12 text-center animate-shimmer">Loading dashboard...</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 lg:space-y-8">
            <h1 className="text-display-lg font-bold text-primary">Dashboard</h1>

            {/* ADM-DASH-001: KPI Cards - 2x2 grid on mobile, 4 columns on desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <KPICard
                    title="Total Revenue"
                    value={formatPrice(stats.totalRevenue)}
                    icon={<DollarSign size={20} className="text-accent-success" />}
                    iconBg="from-accent-success/20 to-accent-success/10"
                    trend="+12.5%"
                    trendUp={true}
                    onClick={() => router.push('/admin/orders')}
                />
                <KPICard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={<ShoppingBag size={20} className="text-accent-secondary" />}
                    iconBg="from-accent-secondary/20 to-accent-secondary/10"
                    trend="+8.2%"
                    trendUp={true}
                    onClick={() => router.push('/admin/orders')}
                />
                <KPICard
                    title="Customers"
                    value={stats.totalCustomers}
                    icon={<Users size={20} className="text-accent-primary" />}
                    iconBg="from-accent-primary/20 to-accent-primary/10"
                    trend="+5.3%"
                    trendUp={true}
                    onClick={() => router.push('/admin/customers')}
                />
                <KPICard
                    title="Products"
                    value={stats.totalProducts}
                    icon={<Package size={20} className="text-accent-warning" />}
                    iconBg="from-accent-warning/20 to-accent-warning/10"
                    trend="-2.1%"
                    trendUp={false}
                    onClick={() => router.push('/admin/products')}
                />
            </div>

            {/* ADM-DASH-002: Chart Section - Mobile h-48, Desktop h-80 */}
            <Card variant="elevated" padding="md" className="w-full">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-heading-lg font-bold text-primary flex items-center gap-2">
                        <TrendingUp size={18} className="text-secondary" />
                        <span className="text-body-md sm:text-heading-lg">Sales Overview (Last 30 Days)</span>
                    </h3>
                </div>
                <div className="h-48 sm:h-80 lg:h-96 w-full">
                    {salesData && salesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(val) => new Date(val).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}
                                    tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tickFormatter={(val) => `$${val}`}
                                    tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'var(--bg-elevated)' }}
                                    contentStyle={{
                                        backgroundColor: 'var(--bg-tertiary)',
                                        borderColor: 'var(--border-subtle)',
                                        color: 'var(--text-primary)',
                                        borderRadius: '12px'
                                    }}
                                    formatter={(value: number | undefined) => [value ? `$${value.toFixed(2)}` : '$0.00', 'Revenue']}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                />
                                <Bar dataKey="revenue" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-secondary italic">
                            No sales data yet.
                        </div>
                    )}
                </div>
            </Card>

            {/* ADM-DASH-003: Recent Orders - Mobile cards, Desktop table */}
            <RecentOrdersSection recentOrders={recentOrders || []} />
        </div>
    );
}

// ADM-DASH-001: KPI Card Component
function KPICard({ title, value, icon, iconBg, trend, trendUp, onClick }: any) {
    return (
        <Card
            variant="gradient"
            padding="md"
            clickable={true}
            onClick={onClick}
            className="group"
        >
            {/* Icon in gradient container */}
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${iconBg} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                {icon}
            </div>

            {/* Label */}
            <p className="text-label-sm text-secondary mb-1 uppercase tracking-wide">{title}</p>

            {/* Value */}
            <h3 className="text-heading-xl font-bold text-primary mb-2">{value}</h3>

            {/* Trend indicator */}
            <div className={`flex items-center gap-1 text-label-sm font-medium ${trendUp ? 'text-accent-success' : 'text-accent-danger'}`}>
                {trendUp ? (
                    <TrendingUp size={14} />
                ) : (
                    <AlertTriangle size={14} />
                )}
                <span>{trend}</span>
            </div>
        </Card>
    );
}

// ADM-DASH-003: Recent Orders Section
function RecentOrdersSection({ recentOrders }: { recentOrders: any[] }) {
    const router = useRouter();

    return (
        <div>
            {/* Header with title and "View all" link */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-heading-lg font-bold text-primary">Recent Orders</h3>
                <button
                    onClick={() => router.push('/admin/orders')}
                    className="text-body-md text-accent-primary hover:underline"
                >
                    View all
                </button>
            </div>

            {recentOrders.length === 0 ? (
                <Card variant="default" padding="lg" className="text-center">
                    <ShoppingBag className="mx-auto text-tertiary mb-4" size={48} />
                    <p className="text-body-md text-secondary">No recent orders.</p>
                    <p className="text-body-sm text-secondary mt-1">Orders will appear here as customers make purchases.</p>
                </Card>
            ) : (
                <>
                    {/* Mobile: Card layout */}
                    <div className="sm:hidden space-y-3">
                        {recentOrders.slice(0, 5).map((order) => (
                            <Card key={order._id} variant="default" padding="md" clickable={true} onClick={() => router.push(`/admin/orders/${order._id}`)}>
                                <div className="flex items-start gap-3">
                                    {/* Icon container */}
                                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <ShoppingBag size={20} className="text-accent-warning" />
                                    </div>

                                    {/* Order info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-body-md font-semibold text-primary truncate">
                                            {order.customerInfo.name}
                                        </p>
                                        <p className="text-body-sm text-secondary">
                                            {order.items?.length ?? 0} {(order.items?.length ?? 0) === 1 ? 'item' : 'items'}
                                        </p>
                                        <p className="text-body-md font-semibold text-primary mt-1">
                                            {formatPrice(order.totalAmount ?? 0)}
                                        </p>
                                    </div>

                                    {/* Status badge */}
                                    <Badge variant="success" size="sm">
                                        Paid
                                    </Badge>
                                </div>

                                {/* Chevron indicator */}
                                <div className="flex justify-end mt-2">
                                    <ChevronRight size={18} className="text-secondary" />
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Desktop: Table layout would go here when Table component is ready */}
                    <div className="hidden sm:block">
                        <Card variant="default" padding="md">
                            <p className="text-body-md text-secondary text-center py-8">
                                Desktop table view coming soon - use mobile cards for now
                            </p>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
