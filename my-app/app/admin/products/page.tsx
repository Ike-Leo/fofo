"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useOrganization } from "@/components/OrganizationProvider";
import Link from "next/link";
import { PlusIcon, Upload } from "lucide-react";
import BulkProductImport from "@/components/BulkProductImport";
import { Table, TableColumn } from "@/components/ui";

export default function ProductsPage() {
    const { currentOrg } = useOrganization();
    const [showBulkImport, setShowBulkImport] = useState(false);

    // We skip the query if no org is selected to avoid errors/unnecessary calls
    const products = useQuery(
        api.products.list,
        currentOrg ? { orgId: currentOrg._id } : "skip"
    );

    if (!currentOrg) {
        return (
            <div className="p-12 text-center">
                <h2 className="text-xl font-semibold text-foreground mb-2">No Organization Selected</h2>
                <p className="text-muted-foreground">Please select an organization from the top bar to manage products.</p>
            </div>
        );
    }

    if (products === undefined) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-1/4"></div>
                    <div className="h-64 bg-card rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Products</h1>
                    <p className="text-muted-foreground mt-1">Manage your catalog for {currentOrg.name}</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setShowBulkImport(true)}
                        className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-sm button-hover min-h-[44px]"
                    >
                        <Upload size={16} />
                        Bulk Import
                    </button>
                    <Link
                        href="/admin/products/new"
                        className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-colors shadow-sm button-hover min-h-[44px]"
                    >
                        <PlusIcon size={16} />
                        Add Product
                    </Link>
                </div>
            </div>

            <Table
                stickyHeader
                columns={[
                    {
                        key: "name",
                        header: "Product",
                        render: (value, row) => (
                            <div>
                                <span className="font-medium text-foreground">{value}</span>
                                {row.description && (
                                    <p className="text-sm text-muted-foreground truncate max-w-xs mt-0.5">
                                        {row.description}
                                    </p>
                                )}
                            </div>
                        ),
                    },
                    {
                        key: "status",
                        header: "Status",
                        render: (value) => <StatusBadge status={value} />,
                    },
                    {
                        key: "price",
                        header: "Price",
                        className: "text-right font-mono text-sm",
                        render: (value) => formatCurrency(value),
                    },
                    {
                        key: "variantCount",
                        header: "Variants",
                        className: "text-center",
                        render: (value) => (
                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                                {value}
                            </span>
                        ),
                    },
                    {
                        key: "updatedAt",
                        header: "Updated",
                        className: "text-right text-sm tabular-nums text-muted-foreground",
                        render: (value) => new Date(value).toLocaleDateString(),
                    },
                ]}
                data={products}
                onRowClick={(row) => (window.location.href = `/admin/products/${row._id}`)}
                empty={
                    <div className="text-center py-12">
                        <p className="text-muted-foreground italic mb-2">No products found.</p>
                        <Link href="/admin/products/new" className="text-primary hover:underline font-medium">
                            Create your first one →
                        </Link>
                    </div>
                }
            />

            {/* Bulk Import Modal */}
            {showBulkImport && currentOrg && (
                <BulkProductImport orgId={currentOrg._id} onClose={() => setShowBulkImport(false)} />
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: "draft" | "active" | "archived" }) {
    const styles = {
        draft: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        archived: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    };

    const labels = {
        draft: "Draft",
        active: "Active",
        archived: "Archived",
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'active' ? 'bg-emerald-500' :
                status === 'draft' ? 'bg-amber-500' : 'bg-slate-500'
                }`}></span>
            {labels[status]}
        </span>
    );
}

function formatCurrency(cents: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(cents / 100);
}
