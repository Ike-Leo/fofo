/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { PlusIcon, Trash2, Star, AlertCircle, Package, Image as ImageIcon } from "lucide-react";

interface Variant {
    _id: Id<"productVariants">;
    sku: string;
    name: string;
    price?: number;
    stockQuantity: number;
    isDefault: boolean;
}

interface ProductVariantsProps {
    productId: Id<"products">;
    variants: Variant[];
}

export default function ProductVariants({ productId, variants }: ProductVariantsProps) {
    const createVariant = useMutation(api.productVariants.create);
    const updateVariant = useMutation(api.productVariants.update);
    const removeVariant = useMutation(api.productVariants.remove);

    const [isAdding, setIsAdding] = useState(false);
    const [newVariant, setNewVariant] = useState({ sku: "", name: "", stock: "0", price: "" });
    const [error, setError] = useState<string | null>(null);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await createVariant({
                productId,
                sku: newVariant.sku,
                name: newVariant.name,
                stockQuantity: parseInt(newVariant.stock) || 0,
                price: newVariant.price ? Math.round(parseFloat(newVariant.price) * 100) : undefined,
            });
            setIsAdding(false);
            setNewVariant({ sku: "", name: "", stock: "0", price: "" });
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDelete = async (variantId: Id<"productVariants">) => {
        if (!confirm("Are you sure you want to delete this variant?")) return;
        try {
            await removeVariant({ variantId });
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleSetDefault = async (variantId: Id<"productVariants">) => {
        try {
            await updateVariant({ variantId, isDefault: true });
        } catch (err: any) {
            alert(err.message);
        }
    };

    const getStockStatus = (stock: number) => {
        if (stock === 0) return { label: "Out of Stock", color: "text-red-700 bg-red-50 border-red-200" };
        if (stock < 10) return { label: "Low Stock", color: "text-amber-700 bg-amber-50 border-amber-200" };
        return { label: "In Stock", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Variants</h2>
                <button
                    onClick={() => setIsAdding(true)}
                    disabled={isAdding}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                    <PlusIcon size={16} />
                    Add Variant
                </button>
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {isAdding && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg animate-fadeIn">
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Name</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Large / Red"
                                value={newVariant.name}
                                onChange={e => setNewVariant({ ...newVariant, name: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">SKU</label>
                            <input
                                type="text"
                                required
                                placeholder="PROD-L-RED"
                                value={newVariant.sku}
                                onChange={e => setNewVariant({ ...newVariant, sku: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Stock</label>
                            <input
                                type="number"
                                min="0"
                                value={newVariant.stock}
                                onChange={e => setNewVariant({ ...newVariant, stock: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 px-3 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800"
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-3 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Responsive Grid Layout for Variant Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {variants.length === 0 ? (
                    <div className="col-span-full p-8 text-center bg-slate-50 border border-slate-200 rounded-lg">
                        <Package className="mx-auto text-slate-300 mb-3" size={40} />
                        <p className="text-slate-500 italic">No variants yet. Add one above.</p>
                    </div>
                ) : (
                    variants.map((variant) => {
                        const stockStatus = getStockStatus(variant.stockQuantity);
                        return (
                            <div
                                key={variant._id}
                                className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-slate-300 transition-all"
                            >
                                {/* Card Header with Default Badge */}
                                <div className="relative bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            {variant.isDefault && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full border border-amber-200">
                                                    <Star size={10} fill="currentColor" />
                                                    Default
                                                </span>
                                            )}
                                            <h3 className="font-semibold text-slate-900">{variant.name}</h3>
                                        </div>
                                        <button
                                            onClick={() => handleSetDefault(variant._id)}
                                            disabled={variant.isDefault}
                                            className={`p-1 rounded-full transition-colors ${
                                                variant.isDefault
                                                    ? "text-yellow-500 cursor-default"
                                                    : "text-slate-300 hover:text-yellow-400 hover:bg-yellow-50"
                                            }`}
                                            title={variant.isDefault ? "Default Variant" : "Set as Default"}
                                        >
                                            <Star size={16} fill={variant.isDefault ? "currentColor" : "none"} />
                                        </button>
                                    </div>
                                    <p className="text-xs font-mono text-slate-500 mt-1">{variant.sku}</p>
                                </div>

                                {/* Card Body */}
                                <div className="p-4 space-y-3">
                                    {/* Image Placeholder */}
                                    <div className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center">
                                        <div className="text-center">
                                            <ImageIcon className="mx-auto text-slate-300 mb-2" size={32} />
                                            <p className="text-xs text-slate-400">No image</p>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    {variant.price && (
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-sm text-slate-500">Price</span>
                                            <span className="text-lg font-bold text-slate-900">
                                                ${(variant.price / 100).toFixed(2)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Stock Status - Prominently Visible */}
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <Package size={16} className="text-slate-400" />
                                            <span className="text-sm font-medium text-slate-700">Stock</span>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-2xl font-bold ${stockStatus.color.split(' ')[0]}`}>
                                                {variant.stockQuantity}
                                            </span>
                                            <span className={`ml-2 inline-block px-2 py-0.5 text-xs font-medium rounded-full border ${stockStatus.color}`}>
                                                {stockStatus.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer with Actions */}
                                <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
                                    <button
                                        onClick={() => handleDelete(variant._id)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete Variant"
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
