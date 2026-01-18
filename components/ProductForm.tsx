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
        <div className="max-w-3xl mx-auto px-4 sm:px-0">
            <div className="mb-4 sm:mb-6">
                <Link
                    href="/admin/products"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 button-hover min-h-[44px] py-2"
                >
                    <ArrowLeft size={16} className="mr-1" />
                    Back to Products
                </Link>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {mode === "create" ? "Create Product" : "Edit Product"}
                </h1>
            </div>

            {error && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl flex items-start gap-3 card-hover">
                    <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold text-sm">Error</h3>
                        <p className="text-sm opacity-90">{error}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-8">
                {/* Basic Info Card */}
                <div className="bg-card rounded-xl shadow-sm border border-border p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <div>
                        <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Basic Information</h2>
                        <div className="grid gap-4 sm:gap-6">
                            <div>
                                <label htmlFor="productName" className="block text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                                    Product Name
                                </label>
                                <input
                                    id="productName"
                                    type="text"
                                    inputMode="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3.5 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-base sm:text-sm min-h-[48px]"
                                    placeholder="e.g. Vintage Leather Jacket"
                                />
                            </div>

                            <div>
                                <label htmlFor="slug" className="block text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                                    Slug
                                </label>
                                <input
                                    id="slug"
                                    type="text"
                                    inputMode="text"
                                    required
                                    value={formData.slug}
                                    onChange={(e) => {
                                        setFormData({ ...formData, slug: e.target.value });
                                        setIsSlugTouched(true);
                                    }}
                                    className="w-full px-4 py-3.5 bg-muted/30 border border-input rounded-xl font-mono text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all min-h-[48px]"
                                    placeholder="vintage-leather-jacket"
                                />
                                <p className="mt-1 text-xs text-muted-foreground">URL-friendly ID</p>
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3.5 bg-card border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-y min-h-[48px] text-base"
                                    placeholder="Describe your product..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Images Card - Responsive Grid */}
                <div className="bg-card rounded-xl shadow-sm border border-border p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <div>
                        <h2 className="text-base sm:text-lg font-semibold text-foreground mb-2">Product Images</h2>
                        <p className="text-sm text-muted-foreground mb-4">Add up to 6 image URLs. The first image will be the main product image.</p>

                        {/* Hidden file input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />

                        {/* Image Preview Grid - 2 cols mobile, 3 sm, 6 lg */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-4 sm:mb-6">
                            {images.map((imageUrl, index) => (
                                <div key={index} className="relative group">
                                    <div
                                        className="aspect-square bg-muted/30 border-2 border-dashed border-border rounded-xl overflow-hidden hover:border-input transition-colors relative min-h-[80px] sm:min-h-[100px]"
                                    >
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
                                            <button
                                                type="button"
                                                onClick={() => triggerUpload(index)}
                                                className="w-full h-full flex flex-col items-center justify-center gap-1.5 sm:gap-2 group-hover:bg-muted transition-colors cursor-pointer min-h-[80px] sm:min-h-[100px]"
                                            >
                                                {uploadingIndex === index ? (
                                                    <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-input border-t-slate-600 rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <ImageIcon className="text-slate-300 group-hover:text-muted-foreground w-5 h-5 sm:w-8 sm:h-8" size={24} />
                                                        <span className="text-[10px] sm:text-xs font-medium text-muted-foreground group-hover:text-muted-foreground hidden sm:inline">
                                                            Upload
                                                        </span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newImages = [...images];
                                            newImages[index] = "";
                                            setImages(newImages);
                                        }}
                                        className={`absolute top-2 right-2 p-1 bg-red-500 text-white rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity min-h-[28px] min-w-[28px] ${!imageUrl ? 'hidden' : ''}`}
                                    >
                                        <X size={14} />
                                    </button>
                                    <div className="absolute bottom-2 left-2 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-black/50 text-white text-[10px] sm:text-xs rounded-md">
                                        {index === 0 ? "Main" : `#${index + 1}`}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Image URL Inputs - Hidden on mobile, shown on desktop */}
                        <div className="hidden sm:block space-y-3">
                            {images.map((imageUrl, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <span className="text-xs font-medium text-muted-foreground w-16">
                                        Image {index + 1}
                                    </span>
                                    <input
                                        type="url"
                                        inputMode="url"
                                        value={imageUrl}
                                        onChange={(e) => {
                                            const newImages = [...images];
                                            newImages[index] = e.target.value;
                                            setImages(newImages);
                                        }}
                                        className="flex-1 px-4 py-2.5 bg-card border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[44px]"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newImages = [...images];
                                            newImages[index] = "";
                                            setImages(newImages);
                                        }}
                                        className={`p-2 text-muted-foreground hover:text-red-500 transition-colors min-h-[40px] min-w-[40px] ${!imageUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={!imageUrl}
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pricing & Organization Card - Stacked on mobile */}
                <div className="bg-card rounded-xl shadow-sm border border-border p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <div>
                        <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Pricing & Organization</h2>
                        <div className="grid grid-cols-1 gap-4 sm:gap-6">
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                                    Price ($)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                    <input
                                        id="price"
                                        type="number"
                                        inputMode="decimal"
                                        min="0"
                                        step="0.01"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full pl-7 sm:pl-8 pr-3 sm:pr-4 py-3 sm:py-2.5 bg-card border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[48px]"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="comparePrice" className="block text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                                    Compare at Price ($)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                    <input
                                        id="comparePrice"
                                        type="number"
                                        inputMode="decimal"
                                        min="0"
                                        step="0.01"
                                        value={formData.compareAtPrice}
                                        onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                                        className="w-full pl-7 sm:pl-8 pr-3 sm:pr-4 py-3 sm:py-2.5 bg-card border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[48px]"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                                    Category
                                </label>
                                {showNewCategory ? (
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input
                                            type="text"
                                            inputMode="text"
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            placeholder="New category name..."
                                            className="flex-1 px-4 py-3.5 sm:py-2.5 bg-card border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[48px]"
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
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={handleCreateCategory}
                                                disabled={isCreatingCategory || !newCategoryName.trim()}
                                                className="flex-1 sm:flex-none px-4 py-3.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 min-h-[48px] sm:min-h-0"
                                            >
                                                {isCreatingCategory ? "..." : "Add"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowNewCategory(false);
                                                    setNewCategoryName("");
                                                }}
                                                className="p-2.5 sm:p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors min-h-[44px] min-w-[44px] sm:min-w-0 sm:min-h-0"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <select
                                            id="category"
                                            value={formData.categoryId}
                                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                            className="flex-1 px-4 py-3.5 sm:py-2.5 bg-card border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[48px] sm:min-h-0"
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
                                            className="px-3 sm:px-4 py-3.5 sm:py-2.5 bg-muted hover:bg-accent/50 text-foreground rounded-xl transition-colors flex items-center justify-center gap-1 min-h-[48px] min-w-[48px] sm:min-w-0 sm:min-h-0"
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
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-6 py-3.5 sm:py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg button-hover min-h-[48px] sm:min-h-0"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        ) : (
                            <Save size={18} />
                        )}
                        <span>{mode === "create" ? "Create Product" : "Save Changes"}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
