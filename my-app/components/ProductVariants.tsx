/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { PlusIcon, Trash2, Star, AlertCircle } from "lucide-react";

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

            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3 font-medium">Default</th>
                            <th className="px-4 py-3 font-medium">Name</th>
                            <th className="px-4 py-3 font-medium">SKU</th>
                            <th className="px-4 py-3 font-medium text-right">Price</th>
                            <th className="px-4 py-3 font-medium text-right">Stock</th>
                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {variants.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-slate-500 italic">
                                    No variants yet. Add one above.
                                </td>
                            </tr>
                        ) : (
                            variants.map((variant) => (
                                <tr key={variant._id} className="group hover:bg-slate-50/50">
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handleSetDefault(variant._id)}
                                            disabled={variant.isDefault}
                                            className={`p-1 rounded-full transition-colors ${variant.isDefault
                                                ? "text-yellow-500 cursor-default"
                                                : "text-slate-300 hover:text-yellow-400"
                                                }`}
                                            title={variant.isDefault ? "Default Variant" : "Set as Default"}
                                        >
                                            <Star size={16} fill={variant.isDefault ? "currentColor" : "none"} />
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-slate-900">{variant.name}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{variant.sku}</td>
                                    <td className="px-4 py-3 text-right text-slate-600">
                                        {variant.price ? `$${(variant.price / 100).toFixed(2)}` : "-"}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium text-slate-900">{variant.stockQuantity}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => handleDelete(variant._id)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                                            title="Delete Variant"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
