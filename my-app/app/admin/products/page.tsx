"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useOrganization } from "@/components/OrganizationProvider";
import Link from "next/link";
import { PlusIcon, Upload } from "lucide-react";
import BulkProductImport from "@/components/BulkProductImport";

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
                <h2 className="text-xl font-semibold text-slate-900 mb-2">No Organization Selected</h2>
                <p className="text-slate-500">Please select an organization from the top bar to manage products.</p>
            </div>
        );
    }

    if (products === undefined) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-64 bg-slate-100 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Products</h1>
                    <p className="text-slate-500 mt-1">Manage your catalog for {currentOrg.name}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowBulkImport(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                    >
                        <Upload size={16} />
                        Bulk Import
                    </button>
                    <Link
                        href="/admin/products/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors"
                    >
                        <PlusIcon size={16} />
                        Add Product
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider text-right">Price</th>
                            <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider text-center">Variants</th>
                            <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider text-right">Updated</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                                    No products found. Create your first one!
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <Link href={`/admin/products/${product._id}`} className="block">
                                            <span className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                                                {product.name}
                                            </span>
                                            {product.description && (
                                                <p className="text-sm text-slate-500 truncate max-w-xs mt-0.5">
                                                    {product.description}
                                                </p>
                                            )}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={product.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-sm text-slate-700">
                                        {formatCurrency(product.price)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                            {product.variantCount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm text-slate-500 tabular-nums">
                                        {new Date(product.updatedAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Bulk Import Modal */}
            {showBulkImport && currentOrg && (
                <BulkProductImport orgId={currentOrg._id} onClose={() => setShowBulkImport(false)} />
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: "draft" | "active" | "archived" }) {
    const styles = {
        draft: "bg-amber-100 text-amber-700 border-amber-200",
        active: "bg-emerald-100 text-emerald-700 border-emerald-200",
        archived: "bg-slate-100 text-slate-600 border-slate-200",
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
