"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useOrganization } from "@/components/OrganizationProvider";
import Link from "next/link";
import { PlusIcon, Upload, ChevronRight, Package } from "lucide-react";
import BulkProductImport from "@/components/BulkProductImport";
import { Table, TableColumn } from "@/components/ui";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

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
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 lg:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-display-lg font-bold text-primary">Products</h1>
                    <p className="text-body-md text-secondary mt-1">Manage your catalog for {currentOrg.name}</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => setShowBulkImport(true)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-br from-accent-success to-emerald-600 text-white font-semibold rounded-xl transition-fast shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active-scale min-h-[48px]"
                    >
                        <Upload size={18} />
                        <span>Bulk Import</span>
                    </button>
                    <Link
                        href="/admin/products/new"
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-br from-accent-primary to-amber-600 text-white font-semibold rounded-xl transition-fast shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active-scale min-h-[48px]"
                    >
                        <PlusIcon size={18} />
                        <span>Add Product</span>
                    </Link>
                </div>
            </div>

            {/* Products List - Mobile Cards, Desktop Table */}
            {products && products.length > 0 ? (
                <>
                    {/* Mobile: Card Layout */}
                    <div className="sm:hidden space-y-3">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>

                    {/* Desktop: Table Layout */}
                    <div className="hidden sm:block">
                        <Table
                            stickyHeader
                            columns={[
                                {
                                    key: "name",
                                    header: "Product",
                                    priority: "primary",
                                    render: (value, row) => (
                                        <div>
                                            <span className="font-semibold text-primary">{value}</span>
                                            {row.description && (
                                                <p className="text-body-sm text-secondary truncate max-w-xs mt-0.5 line-clamp-1">
                                                    {row.description}
                                                </p>
                                            )}
                                        </div>
                                    ),
                                },
                                {
                                    key: "status",
                                    header: "Status",
                                    priority: "secondary",
                                    render: (value) => <ProductStatusBadge status={value} />,
                                },
                                {
                                    key: "price",
                                    header: "Price",
                                    className: "text-right font-mono text-body-sm",
                                    priority: "tertiary",
                                    render: (value) => formatCurrency(value),
                                },
                                {
                                    key: "variantCount",
                                    header: "Variants",
                                    className: "text-center",
                                    priority: "tertiary",
                                    render: (value) => (
                                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-body-sm font-semibold bg-tertiary text-secondary border border-subtle">
                                            {value}
                                        </span>
                                    ),
                                },
                                {
                                    key: "updatedAt",
                                    header: "Updated",
                                    className: "text-right text-body-sm tabular-nums text-tertiary",
                                    priority: "tertiary",
                                    render: (value) => new Date(value).toLocaleDateString(),
                                },
                            ]}
                            data={products}
                            onRowClick={(row) => (window.location.href = `/admin/products/${row._id}`)}
                        />
                    </div>
                </>
            ) : (
                /* Empty State */
                <Card variant="default" padding="lg" className="text-center">
                    <Package className="mx-auto text-tertiary mb-4" size={48} />
                    <p className="text-body-md text-secondary">No products found.</p>
                    <p className="text-body-sm text-tertiary mt-1">Create your first product to get started.</p>
                    <Link
                        href="/admin/products/new"
                        className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-gradient-to-br from-accent-primary to-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active-scale min-h-[48px]"
                    >
                        <PlusIcon size={18} />
                        Create Product
                    </Link>
                </Card>
            )}

            {/* Bulk Import Modal */}
            {showBulkImport && currentOrg && (
                <BulkProductImport orgId={currentOrg._id} onClose={() => setShowBulkImport(false)} />
            )}
        </div>
    );
}

// PRD-001: Mobile Product Card Component
function ProductCard({ product }: { product: any }) {
    return (
        <Card
            variant="elevated"
            padding="md"
            clickable={true}
            onClick={() => (window.location.href = `/admin/products/${product._id}`)}
            className="group"
        >
            <div className="flex gap-3">
                {/* Product Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-tertiary to-elevated flex items-center justify-center flex-shrink-0">
                    {product.image ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Package size={32} className="text-tertiary" />
                    )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                    {/* Name and Status */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-heading-md font-semibold text-primary truncate flex-1">
                            {product.name}
                        </h3>
                        <ProductStatusBadge status={product.status} size="sm" />
                    </div>

                    {/* Description */}
                    {product.description && (
                        <p className="text-body-sm text-secondary line-clamp-2 mb-3">
                            {product.description}
                        </p>
                    )}

                    {/* Metrics Grid - 3 Columns */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                        {/* Price */}
                        <div className="bg-tertiary/50 rounded-lg p-2.5">
                            <p className="text-label-sm text-tertiary mb-0.5">Price</p>
                            <p className="text-body-sm font-semibold text-primary truncate">
                                {formatCurrency(product.price)}
                            </p>
                        </div>
                        {/* Variants */}
                        <div className="bg-tertiary/50 rounded-lg p-2.5">
                            <p className="text-label-sm text-tertiary mb-0.5">Variants</p>
                            <p className="text-body-sm font-semibold text-primary">
                                {product.variantCount || 0}
                            </p>
                        </div>
                        {/* Stock */}
                        <div className="bg-tertiary/50 rounded-lg p-2.5">
                            <p className="text-label-sm text-tertiary mb-0.5">Stock</p>
                            <p className="text-body-sm font-semibold text-primary">
                                {product.stock ?? '—'}
                            </p>
                        </div>
                    </div>

                    {/* Updated Date */}
                    <p className="text-label-sm text-tertiary">
                        Updated {new Date(product.updatedAt).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* Chevron Action Indicator */}
            <div className="flex justify-end mt-2">
                <ChevronRight size={18} className="text-secondary group-hover:text-primary transition-fast" />
            </div>
        </Card>
    );
}

// Product Status Badge - Uses new Badge component with gradient
function ProductStatusBadge({
    status,
    size = "md"
}: {
    status: "draft" | "active" | "archived";
    size?: "sm" | "md";
}) {
    const variantMap = {
        draft: "warning" as const,
        active: "success" as const,
        archived: "default" as const,
    };

    return (
        <Badge variant={variantMap[status]} size={size}>
            {status === 'draft' ? 'Draft' : status === 'active' ? 'Active' : 'Archived'}
        </Badge>
    );
}

function formatCurrency(cents: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(cents / 100);
}
