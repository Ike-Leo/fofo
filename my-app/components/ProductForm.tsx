/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { useOrganization } from "./OrganizationProvider";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import Link from "next/link";

interface ProductFormProps {
    initialData?: {
        _id: Id<"products">;
        name: string;
        slug: string;
        description?: string;
        price: number;
        compareAtPrice?: number;
        categoryId?: Id<"categories">;
        images: string[];
    };
    mode: "create" | "edit";
}

export default function ProductForm({ initialData, mode }: ProductFormProps) {
    const router = useRouter();
    const { currentOrg } = useOrganization();
    const createProduct = useMutation(api.products.create);
    const updateProduct = useMutation(api.products.update);
    const categories = useQuery(api.categories.list, currentOrg ? { orgId: currentOrg._id } : "skip");

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        slug: initialData?.slug || "",
        description: initialData?.description || "",
        price: initialData?.price ? (initialData.price / 100).toString() : "0",
        compareAtPrice: initialData?.compareAtPrice ? (initialData.compareAtPrice / 100).toString() : "",
        categoryId: initialData?.categoryId?.toString() || "",
    });

    // Auto-generate slug from name if in create mode and slug is untouched
    const [isSlugTouched, setIsSlugTouched] = useState(false);

    useEffect(() => {
        if (mode === "create" && !isSlugTouched) {
            const slug = formData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
            setFormData(prev => ({ ...prev, slug }));
        }
    }, [formData.name, mode, isSlugTouched]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentOrg) return;

        setIsLoading(true);
        setError(null);

        try {
            const priceCents = Math.round(parseFloat(formData.price) * 100);
            const compareAtPriceCents = formData.compareAtPrice ? Math.round(parseFloat(formData.compareAtPrice) * 100) : undefined;

            const categoryId = formData.categoryId ? (formData.categoryId as Id<"categories">) : undefined;

            if (mode === "create") {
                await createProduct({
                    orgId: currentOrg._id,
                    name: formData.name,
                    slug: formData.slug,
                    description: formData.description,
                    price: priceCents,
                    compareAtPrice: compareAtPriceCents,
                    categoryId,
                    images: [], // TODO: Image upload
                });
            } else if (initialData) {
                await updateProduct({
                    productId: initialData._id,
                    name: formData.name,
                    slug: formData.slug,
                    description: formData.description,
                    price: priceCents,
                    compareAtPrice: compareAtPriceCents,
                    categoryId,
                });
            }

            router.push("/admin/products");
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <Link
                    href="/admin/products"
                    className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors mb-2"
                >
                    <ArrowLeft size={16} className="mr-1" />
                    Back to Products
                </Link>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    {mode === "create" ? "Create Product" : "Edit Product"}
                </h1>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3">
                    <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold text-sm">Error</h3>
                        <p className="text-sm opacity-90">{error}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h2>
                        <div className="grid gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Product Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                    placeholder="e.g. Vintage Leather Jacket"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Slug
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.slug}
                                    onChange={(e) => {
                                        setFormData({ ...formData, slug: e.target.value });
                                        setIsSlugTouched(true);
                                    }}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                    placeholder="vintage-leather-jacket"
                                />
                                <p className="mt-1 text-xs text-slate-500">URL-friendly ID</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all resize-y"
                                    placeholder="Describe your product..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing & Organization Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Pricing & Organization</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Price ($)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-slate-500">$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Compare at Price ($)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-slate-500">$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.compareAtPrice}
                                        onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                                        className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Category
                                </label>
                                <select
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                >
                                    <option value="">Uncategorized</option>
                                    {categories?.map((category) => (
                                        <option key={category._id} value={category._id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-900/10"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save size={18} />
                        )}
                        {mode === "create" ? "Create Product" : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
