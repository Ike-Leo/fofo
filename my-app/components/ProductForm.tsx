/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { useOrganization } from "./OrganizationProvider";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, AlertCircle, X, Image as ImageIcon, Plus, Upload } from "lucide-react";
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
    const createCategory = useMutation(api.categories.create);
    const categories = useQuery(api.categories.list, currentOrg ? { orgId: currentOrg._id } : "skip");

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Inline category creation state
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);

    // Image upload state
    const generateUploadUrl = useMutation(api.upload.generateUploadUrl);
    const getStorageUrl = useMutation(api.upload.getImageUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || uploadingIndex === null) return;

        try {
            // 1. Get upload URL
            const postUrl = await generateUploadUrl();

            // 2. Upload file
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });

            if (!result.ok) throw new Error("Upload failed");

            const { storageId } = await result.json();

            // 3. Get public URL
            const url = await getStorageUrl({ storageId });

            if (url) {
                const newImages = [...images];
                newImages[uploadingIndex] = url;
                setImages(newImages);
            }
        } catch (err) {
            console.error(err);
            setError("Failed to upload image");
        } finally {
            setUploadingIndex(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const triggerUpload = (index: number) => {
        setUploadingIndex(index);
        fileInputRef.current?.click();
    };

    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        slug: initialData?.slug || "",
        description: initialData?.description || "",
        price: initialData?.price ? (initialData.price / 100).toString() : "0",
        compareAtPrice: initialData?.compareAtPrice ? (initialData.compareAtPrice / 100).toString() : "",
        categoryId: initialData?.categoryId?.toString() || "",
    });

    const [images, setImages] = useState<string[]>(initialData?.images || ["", "", "", "", "", ""]);

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

            // Filter out empty image URLs
            const validImages = images.filter(img => img.trim() !== "");

            if (mode === "create") {
                await createProduct({
                    orgId: currentOrg._id,
                    name: formData.name,
                    slug: formData.slug,
                    description: formData.description,
                    price: priceCents,
                    compareAtPrice: compareAtPriceCents,
                    categoryId,
                    images: validImages,
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

    const handleCreateCategory = async () => {
        if (!currentOrg || !newCategoryName.trim()) return;

        setIsCreatingCategory(true);
        try {
            const slug = newCategoryName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");

            const newCategoryId = await createCategory({
                orgId: currentOrg._id,
                name: newCategoryName.trim(),
                slug,
            });

            // Select the new category
            setFormData(prev => ({ ...prev, categoryId: newCategoryId }));
            setNewCategoryName("");
            setShowNewCategory(false);
        } catch (err: any) {
            setError(err.message || "Failed to create category");
        } finally {
            setIsCreatingCategory(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <Link
                    href="/admin/products"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 button-hover"
                >
                    <ArrowLeft size={16} className="mr-1" />
                    Back to Products
                </Link>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {mode === "create" ? "Create Product" : "Edit Product"}
                </h1>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl flex items-start gap-3 card-hover">
                    <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold text-sm">Error</h3>
                        <p className="text-sm opacity-90">{error}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info Card */}
                <div className="bg-card rounded-xl shadow-sm border border-border p-6 space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground mb-4">Basic Information</h2>
                        <div className="grid gap-6">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">
                                    Product Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                    placeholder="e.g. Vintage Leather Jacket"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">
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
                                    className="w-full px-4 py-2.5 bg-muted/30 border border-input rounded-xl font-mono text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                    placeholder="vintage-leather-jacket"
                                />
                                <p className="mt-1 text-xs text-muted-foreground">URL-friendly ID</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">
                                    Description
                                </label>
                                <textarea
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-card border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-y"
                                    placeholder="Describe your product..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Images Card */}
                <div className="bg-card rounded-xl shadow-sm border border-border p-6 space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground mb-2">Product Images</h2>
                        <p className="text-sm text-muted-foreground mb-4">Add up to 6 image URLs. The first image will be the main product image.</p>

                        {/* Hidden file input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />

                        {/* Image Preview Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                            {images.map((imageUrl, index) => (
                                <div key={index} className="relative group">
                                    <div className="aspect-square bg-muted/30 border-2 border-dashed border-border rounded-xl overflow-hidden hover:border-input transition-colors relative">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={`Product image ${index + 1}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%2394a3b8' font-size='12'%3EInvalid%3C/text%3E%3C/svg%3E";
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 group-hover:bg-muted transition-colors cursor-pointer" onClick={() => triggerUpload(index)}>
                                                {uploadingIndex === index ? (
                                                    <div className="w-8 h-8 border-2 border-input border-t-slate-600 rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <ImageIcon className="text-slate-300 group-hover:text-muted-foreground" size={32} />
                                                        <span className="text-xs font-medium text-muted-foreground group-hover:text-muted-foreground">Upload</span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newImages = [...images];
                                            newImages[index] = "";
                                            setImages(newImages);
                                        }}
                                        className={`absolute top-2 right-2 p-1 bg-red-500 text-white rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity ${!imageUrl ? 'hidden' : ''}`}
                                    >
                                        <X size={14} />
                                    </button>
                                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded-md">
                                        {index === 0 ? "Main" : `#${index + 1}`}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Image URL Inputs */}
                        <div className="space-y-3">
                            {images.map((imageUrl, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <span className="text-xs font-medium text-muted-foreground w-16">
                                        Image {index + 1}
                                    </span>
                                    <input
                                        type="url"
                                        value={imageUrl}
                                        onChange={(e) => {
                                            const newImages = [...images];
                                            newImages[index] = e.target.value;
                                            setImages(newImages);
                                        }}
                                        className="flex-1 px-4 py-2.5 bg-card border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newImages = [...images];
                                            newImages[index] = "";
                                            setImages(newImages);
                                        }}
                                        className={`p-2 text-muted-foreground hover:text-red-500 transition-colors ${!imageUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={!imageUrl}
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pricing & Organization Card */}
                <div className="bg-card rounded-xl shadow-sm border border-border p-6 space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground mb-4">Pricing & Organization</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">
                                    Price ($)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-muted-foreground">$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full pl-7 pr-3 py-2 bg-card border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">
                                    Compare at Price ($)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-muted-foreground">$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.compareAtPrice}
                                        onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                                        className="w-full pl-7 pr-3 py-2 bg-card border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-foreground mb-1">
                                    Category
                                </label>
                                {showNewCategory ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            placeholder="New category name..."
                                            className="flex-1 px-4 py-2.5 bg-card border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleCreateCategory();
                                                } else if (e.key === "Escape") {
                                                    setShowNewCategory(false);
                                                    setNewCategoryName("");
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleCreateCategory}
                                            disabled={isCreatingCategory || !newCategoryName.trim()}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                                        >
                                            {isCreatingCategory ? "..." : "Add"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowNewCategory(false);
                                                setNewCategoryName("");
                                            }}
                                            className="px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <select
                                            value={formData.categoryId}
                                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                            className="flex-1 px-4 py-2.5 bg-card border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        >
                                            <option value="">Uncategorized</option>
                                            {categories?.map((category) => (
                                                <option key={category._id} value={category._id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setShowNewCategory(true)}
                                            className="px-4 py-2.5 bg-muted hover:bg-accent/50 text-foreground rounded-xl transition-colors flex items-center gap-1"
                                            title="Create new category"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg button-hover"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
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
