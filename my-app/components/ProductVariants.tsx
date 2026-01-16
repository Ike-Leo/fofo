/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { PlusIcon, Trash2, Star, AlertCircle, Package, Image as ImageIcon, Pencil, Check, X } from "lucide-react";

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

    // Editing state
    const [editingId, setEditingId] = useState<Id<"productVariants"> | null>(null);
    const [editData, setEditData] = useState({ name: "", sku: "", price: "", stock: "" });
    const [isSaving, setIsSaving] = useState(false);

    const startEditing = (variant: Variant) => {
        setEditingId(variant._id);
        setEditData({
            name: variant.name,
            sku: variant.sku,
            price: variant.price ? (variant.price / 100).toString() : "",
            stock: variant.stockQuantity.toString(),
        });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditData({ name: "", sku: "", price: "", stock: "" });
    };

    const handleSaveEdit = async () => {
        if (!editingId) return;

        setIsSaving(true);
        setError(null);
        try {
            await updateVariant({
                variantId: editingId,
                name: editData.name,
                sku: editData.sku,
                price: editData.price ? Math.round(parseFloat(editData.price) * 100) : undefined,
            });
            setEditingId(null);
            setEditData({ name: "", sku: "", price: "", stock: "" });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

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
        if (stock === 0) return { label: "Out of Stock", color: "text-red-500 bg-red-500/10 border-red-500/20" };
        if (stock < 10) return { label: "Low Stock", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" };
        return { label: "In Stock", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" };
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Variants</h2>
                <button
                    onClick={() => setIsAdding(true)}
                    disabled={isAdding}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-full transition-colors font-bold shadow-sm"
                >
                    <PlusIcon size={16} />
                    Add Variant
                </button>
            </div>

            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {isAdding && (
                <div className="p-4 bg-muted/30 border border-border rounded-xl animate-fadeIn">
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Name</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Large / Red"
                                value={newVariant.name}
                                onChange={e => setNewVariant({ ...newVariant, name: e.target.value })}
                                className="w-full px-4 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 text-foreground"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">SKU</label>
                            <input
                                type="text"
                                required
                                placeholder="PROD-L-RED"
                                value={newVariant.sku}
                                onChange={e => setNewVariant({ ...newVariant, sku: e.target.value })}
                                className="w-full px-4 py-2 bg-background border border-border rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary/50 text-foreground"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Stock</label>
                            <input
                                type="number"
                                min="0"
                                value={newVariant.stock}
                                onChange={e => setNewVariant({ ...newVariant, stock: e.target.value })}
                                className="w-full px-4 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 text-foreground"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90"
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 bg-transparent text-muted-foreground hover:bg-muted text-sm font-medium rounded-xl border border-transparent hover:border-border"
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
                    <div className="col-span-full p-8 text-center bg-muted/10 border border-border rounded-xl">
                        <Package className="mx-auto text-muted-foreground mb-3" size={40} />
                        <p className="text-muted-foreground italic">No variants yet. Add one above.</p>
                    </div>
                ) : (
                    variants.map((variant) => {
                        const stockStatus = getStockStatus(variant.stockQuantity);
                        return (
                            <div
                                key={variant._id}
                                className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-md hover:border-primary/30 transition-all"
                            >
                                {/* Card Header with Default Badge */}
                                <div className="relative bg-muted/30 px-4 py-3 border-b border-border">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            {variant.isDefault && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-500 text-xs font-medium rounded-full border border-amber-500/20">
                                                    <Star size={10} fill="currentColor" />
                                                    Default
                                                </span>
                                            )}
                                            <h3 className="font-semibold text-foreground">{variant.name}</h3>
                                        </div>
                                        <button
                                            onClick={() => handleSetDefault(variant._id)}
                                            disabled={variant.isDefault}
                                            className={`p-1 rounded-full transition-colors ${variant.isDefault
                                                ? "text-yellow-500 cursor-default"
                                                : "text-muted-foreground hover:text-yellow-400 hover:bg-yellow-500/10"
                                                }`}
                                            title={variant.isDefault ? "Default Variant" : "Set as Default"}
                                        >
                                            <Star size={16} fill={variant.isDefault ? "currentColor" : "none"} />
                                        </button>
                                    </div>
                                    <p className="text-xs font-mono text-muted-foreground mt-1">{variant.sku}</p>
                                </div>

                                {/* Card Body */}
                                <div className="p-4 space-y-3">
                                    {/* Image Placeholder */}
                                    <div className="aspect-video bg-muted/10 border-2 border-dashed border-border rounded-xl flex items-center justify-center">
                                        <div className="text-center">
                                            <ImageIcon className="mx-auto text-muted-foreground/50 mb-2" size={32} />
                                            <p className="text-xs text-muted-foreground">No image</p>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    {variant.price && (
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-sm text-muted-foreground">Price</span>
                                            <span className="text-lg font-bold text-foreground">
                                                ${(variant.price / 100).toFixed(2)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Stock Status - Prominently Visible */}
                                    <div className="flex items-center justify-between p-3 bg-muted/10 rounded-xl border border-border">
                                        <div className="flex items-center gap-2">
                                            <Package size={16} className="text-muted-foreground" />
                                            <span className="text-sm font-medium text-foreground">Stock</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-2xl font-bold ${stockStatus.color.split(' ')[0]}`}>
                                                {variant.stockQuantity}
                                            </span>
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full border whitespace-nowrap ${stockStatus.color}`}>
                                                {stockStatus.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer with Actions */}
                                <div className="px-4 py-3 bg-muted/30 border-t border-border flex justify-between">
                                    <button
                                        onClick={() => startEditing(variant)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-colors"
                                        title="Edit Variant"
                                    >
                                        <Pencil size={16} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(variant._id)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
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

            {/* Edit Modal */}
            {editingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-card rounded-xl shadow-xl w-[95vw] md:max-w-md overflow-hidden border border-border">
                        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30">
                            <h3 className="font-semibold text-lg text-foreground">Edit Variant</h3>
                            <button onClick={cancelEditing} className="text-muted-foreground hover:text-foreground">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                                <input
                                    type="text"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                    placeholder="Variant name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">SKU</label>
                                <input
                                    type="text"
                                    value={editData.sku}
                                    onChange={(e) => setEditData({ ...editData, sku: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                    placeholder="PROD-SKU"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Price ($)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={editData.price}
                                        onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                                        className="w-full pl-7 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="bg-muted/30 rounded-xl p-3 text-sm text-foreground flex items-center gap-2 border border-border">
                                <span className="text-lg">💡</span>
                                <p>To adjust stock, use the <span className="font-semibold text-primary">Inventory page</span>.</p>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
                            <button
                                onClick={cancelEditing}
                                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={isSaving}
                                className="px-4 py-2 text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSaving ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Check size={16} />
                                )}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
