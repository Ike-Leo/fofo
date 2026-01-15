/* eslint-disable */
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useOrganization } from "@/components/OrganizationProvider";
import { FolderOpen, Plus, Edit, Trash2, ChevronRight, MoreHorizontal } from "lucide-react";

export default function CategoriesPage() {
    const { currentOrg } = useOrganization();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<{
        _id: Id<"categories">;
        name: string;
        slug: string;
        parentId?: Id<"categories">;
        position: number;
    } | null>(null);

    const categories = useQuery(
        api.categories.list,
        currentOrg ? { orgId: currentOrg._id } : "skip"
    );

    const deleteCategory = useMutation(api.categories.remove);

    // Build category tree
    const buildTree = (parentId?: Id<"categories">) => {
        return categories
            ?.filter((c) =>
                parentId === undefined
                    ? !c.parentId
                    : c.parentId === parentId
            )
            .sort((a, b) => a.position - b.position) || [];
    };

    const renderCategoryRow = (
        category: any,
        level: number = 0,
        keyPrefix: string = ""
    ) => {
        const children = buildTree(category._id);
        const hasChildren = children.length > 0;

        return (
            <div key={`${keyPrefix}${category._id}`}>
                <div
                    className="flex items-center gap-3 py-3 px-4 hover:bg-accent/50 transition-colors border-b border-border"
                    style={{ paddingLeft: `${16 + level * 24}px` }}
                >
                    {/* Expand/Collapse Icon */}
                    {hasChildren ? (
                        <ChevronRight size={16} className="text-muted-foreground" />
                    ) : (
                        <div style={{ width: 16 }} />
                    )}

                    {/* Category Icon */}
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FolderOpen size={18} className="text-primary" />
                    </div>

                    {/* Category Info */}
                    <div className="flex-1">
                        <p className="font-medium text-foreground">{category.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{category.slug}</p>
                    </div>

                    {/* Position Badge */}
                    <div className="text-sm text-muted-foreground">
                        Position: <span className="font-medium">{category.position}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() =>
                                setEditingCategory({
                                    _id: category._id,
                                    name: category.name,
                                    slug: category.slug,
                                    parentId: category.parentId,
                                    position: category.position,
                                })
                            }
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                            title="Edit"
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            onClick={async () => {
                                if (!confirm(`Delete category "${category.name}"?`)) return;
                                try {
                                    await deleteCategory({ categoryId: category._id });
                                } catch (err: any) {
                                    alert(err.message);
                                }
                            }}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                {/* Render Children */}
                {hasChildren && children.map((child) => renderCategoryRow(child, level + 1, `${category._id}-`))}
            </div>
        );
    };

    if (!currentOrg) {
        return (
            <div className="p-12 text-center text-muted-foreground">
                Select an organization to view categories.
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <FolderOpen className="text-primary" size={32} />
                        Categories
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Organize your products into categories
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors shadow-sm font-medium"
                >
                    <Plus size={18} />
                    New Category
                </button>
            </div>

            {/* Categories List */}
            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
                {!categories ? (
                    <div className="p-12 text-center animate-pulse text-muted-foreground">
                        Loading categories...
                    </div>
                ) : categories.length === 0 ? (
                    <div className="p-12 text-center">
                        <FolderOpen className="mx-auto text-muted-foreground mb-4" size={48} />
                        <h3 className="text-lg font-semibold text-foreground">No categories yet</h3>
                        <p className="text-muted-foreground mt-1">
                            Create your first category to organize your products.
                        </p>
                    </div>
                ) : (
                    <div>
                        {/* Header Row */}
                        <div className="flex items-center gap-3 py-3 px-4 bg-accent/50 border-b border-border text-sm font-semibold text-muted-foreground">
                            <div style={{ width: 16, marginLeft: 24 }} />
                            <div style={{ width: 32 }} />
                            <div className="flex-1">Category</div>
                            <div>Position</div>
                            <div style={{ width: 80 }}>Actions</div>
                        </div>

                        {/* Categories */}
                        {buildTree().map((category) => renderCategoryRow(category))}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && currentOrg && (
                <CategoryModal
                    orgId={currentOrg._id}
                    categories={categories || []}
                    onClose={() => setIsCreateModalOpen(false)}
                />
            )}

            {/* Edit Modal */}
            {editingCategory && currentOrg && (
                <CategoryModal
                    orgId={currentOrg._id}
                    categories={categories || []}
                    initialData={editingCategory}
                    onClose={() => setEditingCategory(null)}
                />
            )}
        </div>
    );
}

function CategoryModal({
    orgId,
    categories,
    initialData,
    onClose,
}: {
    orgId: Id<"organizations">;
    categories: any[];
    initialData?: {
        _id: Id<"categories">;
        name: string;
        slug: string;
        parentId?: Id<"categories">;
        position: number;
    };
    onClose: () => void;
}) {
    const createCategory = useMutation(api.categories.create);
    const updateCategory = useMutation(api.categories.update);

    const [name, setName] = useState(initialData?.name || "");
    const [slug, setSlug] = useState(initialData?.slug || "");
    const [parentId, setParentId] = useState<string>(initialData?.parentId?.toString() || "");
    const [position, setPosition] = useState(initialData?.position.toString() || "0");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSlugTouched, setIsSlugTouched] = useState(false);

    // Auto-generate slug from name
    const handleNameChange = (value: string) => {
        setName(value);
        if (!isSlugTouched) {
            const newSlug = value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
            setSlug(newSlug);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            if (initialData) {
                await updateCategory({
                    categoryId: initialData._id,
                    name,
                    slug,
                    parentId: parentId ? (parentId as Id<"categories">) : undefined,
                    position: parseInt(position),
                });
            } else {
                await createCategory({
                    orgId,
                    name,
                    slug: slug || undefined,
                    parentId: parentId ? (parentId as Id<"categories">) : undefined,
                    position: parseInt(position),
                });
            }
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter out current category and its descendants from parent options
    const getAvailableParents = () => {
        if (!initialData) return categories;

        const getDescendantIds = (catId: Id<"categories">): Set<Id<"categories">> => {
            const descendants = new Set<Id<"categories">>();
            const children = categories.filter((c) => c.parentId === catId);
            children.forEach((child) => {
                descendants.add(child._id);
                getDescendantIds(child._id).forEach((id) => descendants.add(id));
            });
            return descendants;
        };

        const forbiddenIds = getDescendantIds(initialData._id);
        forbiddenIds.add(initialData._id);

        return categories.filter((c) => !forbiddenIds.has(c._id));
    };

    const availableParents = getAvailableParents();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                <div className="px-6 py-4 border-b border-border flex justify-between items-center">
                    <h3 className="font-semibold text-lg text-foreground">
                        {initialData ? "Edit Category" : "New Category"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-muted-foreground"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-xl">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            className="w-full px-4 py-2.5 border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="e.g. Electronics"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Slug
                        </label>
                        <input
                            type="text"
                            required
                            value={slug}
                            onChange={(e) => {
                                setSlug(e.target.value);
                                setIsSlugTouched(true);
                            }}
                            className="w-full px-4 py-2.5 border border-input rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="electronics"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Parent Category
                        </label>
                        <select
                            value={parentId}
                            onChange={(e) => setParentId(e.target.value)}
                            className="w-full px-4 py-2.5 border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">None (Top Level)</option>
                            {availableParents.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Position
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            className="w-full px-4 py-2.5 border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="0"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Lower numbers appear first
                        </p>
                    </div>
                </form>

                <div className="px-6 py-4 border-t border-border bg-accent/50 flex justify-end gap-3 rounded-b-xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-xl"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-xl shadow-sm disabled:opacity-50"
                    >
                        {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Create Category"}
                    </button>
                </div>
            </div>
        </div>
    );
}
