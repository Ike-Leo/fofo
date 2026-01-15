"use client";

import { use } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import ProductForm from "@/components/ProductForm";
import ProductVariants from "@/components/ProductVariants";
import ProductActivityLog from "@/components/ProductActivityLog";
import { Archive, PlayCircle, EyeOff } from "lucide-react";

export default function ProductDetailPage({
    params
}: {
    params: Promise<{ productId: string }>
}) {
    const { productId } = use(params);
    const normalizedProductId = productId as Id<"products">;

    const product = useQuery(api.products.get, { productId: normalizedProductId });
    const setStatus = useMutation(api.products.setStatus);

    if (product === undefined) {
        return (
            <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
                <div className="h-40 bg-muted rounded-xl"></div>
                <div className="h-96 bg-muted rounded-xl"></div>
            </div>
        );
    }

    if (product === null) {
        return (
            <div className="p-12 text-center">
                <h2 className="text-xl font-bold text-foreground">Product Not Found</h2>
                <p className="text-muted-foreground">The product you are looking for does not exist.</p>
            </div>
        );
    }

    const handleStatusChange = async (newStatus: "active" | "archived" | "draft") => {
        await setStatus({ productId: normalizedProductId, status: newStatus });
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10">
            {/* Header Actions */}
            <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${product.status === 'active' ? 'bg-emerald-500' :
                        product.status === 'draft' ? 'bg-amber-500' : 'bg-slate-500'
                        }`} />
                    <span className="font-semibold text-foreground capitalize">
                        Status: {product.status}
                    </span>
                </div>
                <div className="flex gap-2">
                    {product.status !== 'active' && (
                        <button
                            onClick={() => handleStatusChange('active')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors border border-emerald-500/20"
                        >
                            <PlayCircle size={16} />
                            Publish
                        </button>
                    )}
                    {product.status !== 'draft' && (
                        <button
                            onClick={() => handleStatusChange('draft')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors border border-amber-500/20"
                        >
                            <EyeOff size={16} />
                            Unpublish
                        </button>
                    )}
                    {product.status !== 'archived' && (
                        <button
                            onClick={() => handleStatusChange('archived')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-400 bg-slate-500/10 hover:bg-slate-500/20 rounded-lg transition-colors border border-slate-500/20"
                        >
                            <Archive size={16} />
                            Archive
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    <ProductForm mode="edit" initialData={product} />
                </div>

                <div className="space-y-6">
                    <div className="sticky top-8 space-y-6">
                        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                            <ProductVariants productId={normalizedProductId} variants={product.variants} />
                        </div>
                        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                            <ProductActivityLog productId={normalizedProductId} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
