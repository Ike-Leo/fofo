/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

type Props = {
    onSuccess?: () => void;
};

export function CreateOrganizationForm({ onSuccess }: Props) {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createOrg = useMutation((api as any).organizations?.create);

    // Auto-generate slug
    useEffect(() => {
        if (!isSlugManuallyEdited) {
            const generated = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
            setSlug(generated);
        }
    }, [name, isSlugManuallyEdited]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            if (!name || !slug) {
                setError("Name and slug are required");
                return;
            }

            await createOrg({ name, slug });

            setName("");
            setSlug("");
            setIsSlugManuallyEdited(false);
            onSuccess?.();
        } catch (err: any) {
            setError(err.message || "Failed to create organization");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">New Organization</h3>

            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 text-sm rounded border border-red-200 dark:border-red-800">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Organization Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Acme Corp"
                    />
                </div>

                <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Slug (URL Identifier)
                    </label>
                    <input
                        id="slug"
                        type="text"
                        value={slug}
                        onChange={(e) => {
                            setSlug(e.target.value);
                            setIsSlugManuallyEdited(true);
                        }}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                        placeholder="acme-corp"
                    />
                </div>
            </div>

            <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors"
            >
                Create Organization
            </button>
        </form>
    );
}
