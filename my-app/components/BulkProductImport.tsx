"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { Upload, X, Check, AlertCircle, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface BulkProductImportProps {
    orgId: Id<"organizations">;
    onClose: () => void;
}

interface ParsedProduct {
    name: string;
    slug?: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    categorySlug?: string;
    images?: string[];
}

interface ColumnMapping {
    name: number;
    slug?: number;
    description?: number;
    price: number;
    compareAtPrice?: number;
    categorySlug?: number;
    images?: number;
}

export default function BulkProductImport({ orgId, onClose }: BulkProductImportProps) {
    const bulkImport = useMutation(api.products.bulkImport);

    const [step, setStep] = useState<"upload" | "mapping" | "preview" | "importing" | "complete">("upload");
    const [csvData, setCsvData] = useState<string[][]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [columnMapping, setColumnMapping] = useState<ColumnMapping | null>(null);
    const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
    const [importResults, setImportResults] = useState<{
        success: number;
        failed: number;
        errors: Array<{ row: number; name: string; error: string }>;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Simple CSV parser
    const parseCSV = useCallback((text: string): string[][] => {
        const lines: string[][] = [];
        let currentLine: string[] = [];
        let currentField = "";
        let inQuotes = false;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const nextChar = text[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    currentField += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === "," && !inQuotes) {
                currentLine.push(currentField);
                currentField = "";
            } else if (char === "\n" && !inQuotes) {
                currentLine.push(currentField);
                if (currentLine.length > 1 || currentLine[0]) {
                    lines.push(currentLine);
                }
                currentLine = [];
                currentField = "";
            } else if (char !== "\r") {
                currentField += char;
            }
        }

        if (currentField || currentLine.length > 0) {
            currentLine.push(currentField);
            lines.push(currentLine);
        }

        return lines;
    }, []);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (!selectedFile.name.endsWith(".csv")) {
            setError("Please upload a CSV file");
            return;
        }

        setError(null);

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const data = parseCSV(text);

            if (data.length < 2) {
                setError("CSV file must have at least a header row and one data row");
                return;
            }

            const headerRow = data[0];
            setHeaders(headerRow);
            setCsvData(data.slice(1));
            setStep("mapping");
        };
        reader.onerror = () => setError("Failed to read file");
        reader.readAsText(selectedFile);
    };

    const handleMappingSubmit = () => {
        if (!columnMapping) return;

        const products: ParsedProduct[] = [];

        for (let i = 0; i < csvData.length; i++) {
            const row = csvData[i];
            if (!row[columnMapping.name]?.trim()) continue; // Skip rows without names

            const priceValue = row[columnMapping.price];
            const price = parseFloat(priceValue);

            if (isNaN(price)) {
                setError(`Row ${i + 2}: Invalid price value "${priceValue}"`);
                return;
            }

            const product: ParsedProduct = {
                name: row[columnMapping.name].trim(),
                price: Math.round(price * 100), // Convert to cents
            };

            if (columnMapping.slug !== undefined) {
                product.slug = row[columnMapping.slug]?.trim();
            }

            if (columnMapping.description !== undefined) {
                product.description = row[columnMapping.description]?.trim();
            }

            if (columnMapping.compareAtPrice !== undefined) {
                const compareAtPrice = parseFloat(row[columnMapping.compareAtPrice]);
                if (!isNaN(compareAtPrice)) {
                    product.compareAtPrice = Math.round(compareAtPrice * 100);
                }
            }

            if (columnMapping.categorySlug !== undefined) {
                product.categorySlug = row[columnMapping.categorySlug]?.trim();
            }

            if (columnMapping.images !== undefined) {
                const imagesStr = row[columnMapping.images]?.trim();
                if (imagesStr) {
                    product.images = imagesStr.split("|").map((s) => s.trim()).filter(Boolean);
                }
            }

            products.push(product);
        }

        setParsedProducts(products);
        setStep("preview");
    };

    const handleImport = async () => {
        setStep("importing");
        setError(null);

        try {
            const results = await bulkImport({ orgId, products: parsedProducts });
            setImportResults(results);
            setStep("complete");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to import products");
            setStep("preview");
        }
    };

    const reset = () => {
        setCsvData([]);
        setHeaders([]);
        setColumnMapping(null);
        setParsedProducts([]);
        setImportResults(null);
        setError(null);
        setStep("upload");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-semibold text-slate-900">Bulk Import Products</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {step !== "upload" && step !== "importing" && step !== "complete" && (
                            <button
                                onClick={step === "mapping" ? () => setStep("upload") : () => setStep("mapping")}
                                className="text-sm text-slate-600 hover:text-slate-800 flex items-center gap-1"
                            >
                                <ArrowLeft size={16} />
                                Back
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2">
                            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                            {error}
                        </div>
                    )}

                    {/* Step 1: Upload */}
                    {step === "upload" && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">Upload CSV File</h3>
                                <p className="text-slate-600 mb-4">
                                    Upload a CSV file with your product data. You&apos;ll map columns in the next step.
                                </p>
                            </div>

                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-slate-400 transition-colors">
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="csv-upload"
                                />
                                <label
                                    htmlFor="csv-upload"
                                    className="cursor-pointer flex flex-col items-center"
                                >
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                        <Upload className="text-slate-400" size={32} />
                                    </div>
                                    <p className="text-lg font-medium text-slate-900 mb-1">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-sm text-slate-500">CSV files only</p>
                                </label>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                                    <FileText size={16} />
                                    CSV Format Guidelines
                                </h4>
                                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                                    <li>First row should contain column headers</li>
                                    <li>Required columns: Name, Price</li>
                                    <li>Optional columns: Slug, Description, Compare At Price, Category Slug, Images (separate with |)</li>
                                    <li>Price should be in decimal format (e.g., 29.99 for $29.99)</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Column Mapping */}
                    {step === "mapping" && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">Map Columns</h3>
                                <p className="text-slate-600">
                                    Match your CSV columns to product fields. Required fields are marked with *.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <label className="text-sm font-medium text-slate-700">
                                        Name *
                                    </label>
                                    <select
                                        value={columnMapping?.name ?? ""}
                                        onChange={(e) =>
                                            setColumnMapping({
                                                ...((columnMapping || {}) as ColumnMapping),
                                                name: parseInt(e.target.value),
                                            })
                                        }
                                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">-- Select Column --</option>
                                        {headers.map((header, index) => (
                                            <option key={index} value={index}>
                                                {header || `Column ${index + 1}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <label className="text-sm font-medium text-slate-700">Price *</label>
                                    <select
                                        value={columnMapping?.price ?? ""}
                                        onChange={(e) =>
                                            setColumnMapping({
                                                ...((columnMapping || {}) as ColumnMapping),
                                                price: parseInt(e.target.value),
                                            })
                                        }
                                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">-- Select Column --</option>
                                        {headers.map((header, index) => (
                                            <option key={index} value={index}>
                                                {header || `Column ${index + 1}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <label className="text-sm font-medium text-slate-700">Slug</label>
                                    <select
                                        value={columnMapping?.slug ?? ""}
                                        onChange={(e) =>
                                            setColumnMapping({
                                                ...((columnMapping || {}) as ColumnMapping),
                                                slug: e.target.value
                                                    ? parseInt(e.target.value)
                                                    : undefined,
                                            })
                                        }
                                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">-- Skip --</option>
                                        {headers.map((header, index) => (
                                            <option key={index} value={index}>
                                                {header || `Column ${index + 1}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <label className="text-sm font-medium text-slate-700">Description</label>
                                    <select
                                        value={columnMapping?.description ?? ""}
                                        onChange={(e) =>
                                            setColumnMapping({
                                                ...((columnMapping || {}) as ColumnMapping),
                                                description: e.target.value
                                                    ? parseInt(e.target.value)
                                                    : undefined,
                                            })
                                        }
                                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">-- Skip --</option>
                                        {headers.map((header, index) => (
                                            <option key={index} value={index}>
                                                {header || `Column ${index + 1}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <label className="text-sm font-medium text-slate-700">
                                        Compare At Price
                                    </label>
                                    <select
                                        value={columnMapping?.compareAtPrice ?? ""}
                                        onChange={(e) =>
                                            setColumnMapping({
                                                ...((columnMapping || {}) as ColumnMapping),
                                                compareAtPrice: e.target.value
                                                    ? parseInt(e.target.value)
                                                    : undefined,
                                            })
                                        }
                                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">-- Skip --</option>
                                        {headers.map((header, index) => (
                                            <option key={index} value={index}>
                                                {header || `Column ${index + 1}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <label className="text-sm font-medium text-slate-700">
                                        Category Slug
                                    </label>
                                    <select
                                        value={columnMapping?.categorySlug ?? ""}
                                        onChange={(e) =>
                                            setColumnMapping({
                                                ...((columnMapping || {}) as ColumnMapping),
                                                categorySlug: e.target.value
                                                    ? parseInt(e.target.value)
                                                    : undefined,
                                            })
                                        }
                                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">-- Skip --</option>
                                        {headers.map((header, index) => (
                                            <option key={index} value={index}>
                                                {header || `Column ${index + 1}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                                    <label className="text-sm font-medium text-slate-700">Images</label>
                                    <select
                                        value={columnMapping?.images ?? ""}
                                        onChange={(e) =>
                                            setColumnMapping({
                                                ...((columnMapping || {}) as ColumnMapping),
                                                images: e.target.value
                                                    ? parseInt(e.target.value)
                                                    : undefined,
                                            })
                                        }
                                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">-- Skip --</option>
                                        {headers.map((header, index) => (
                                            <option key={index} value={index}>
                                                {header || `Column ${index + 1}`}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="col-span-2 col-start-2 text-xs text-slate-500">
                                        Separate multiple image URLs with a pipe symbol (|)
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleMappingSubmit}
                                    disabled={!columnMapping || columnMapping.name === undefined || columnMapping.price === undefined}
                                    className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Continue to Preview
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Preview */}
                    {step === "preview" && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                    Preview Import ({parsedProducts.length} products)
                                </h3>
                                <p className="text-slate-600">
                                    Review the products that will be imported. All products will be created as drafts.
                                </p>
                            </div>

                            <div className="border border-slate-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-700 border-b">
                                                Name
                                            </th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-700 border-b">
                                                Price
                                            </th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-700 border-b">
                                                Category
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {parsedProducts.map((product, index) => (
                                            <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                                                <td className="px-4 py-3 font-medium text-slate-900">
                                                    {product.name}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    ${(product.price / 100).toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    {product.categorySlug || "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={() => setStep("mapping")}
                                    className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleImport}
                                    className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    Import Products
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Importing */}
                    {step === "importing" && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                            <p className="text-lg font-medium text-slate-900">Importing products...</p>
                            <p className="text-slate-500">This may take a moment</p>
                        </div>
                    )}

                    {/* Step 5: Complete */}
                    {step === "complete" && importResults && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="text-emerald-600" size={32} />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                                    Import Complete!
                                </h3>
                                <p className="text-slate-600">
                                    {importResults.success} products imported successfully
                                    {importResults.failed > 0 && `, ${importResults.failed} failed`}
                                </p>
                            </div>

                            {importResults.errors.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-red-900 mb-3">Errors</h4>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {importResults.errors.map((err, index) => (
                                            <div
                                                key={index}
                                                className="text-sm text-red-800 flex items-start gap-2"
                                            >
                                                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                                                <span>
                                                    Row {err.row} ({err.name}): {err.error}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-center gap-3 pt-4">
                                <button
                                    onClick={reset}
                                    className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
                                >
                                    Import More
                                </button>
                                <Link
                                    href="/admin/products"
                                    onClick={onClose}
                                    className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    View Products
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
