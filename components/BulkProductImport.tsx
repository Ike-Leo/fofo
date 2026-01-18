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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-card w-full sm:max-w-4xl sm:rounded-xl rounded-t-2xl max-h-[90vh] overflow-hidden flex flex-col slide-up-sheet shadow-xl">
                {/* Mobile swipe handle */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="w-12 h-1.5 bg-muted rounded-full" />
                </div>

                {/* Header */}
                <div className="px-4 sm:px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center">
                            <X size={20} />
                        </button>
                        <h2 className="text-lg sm:text-xl font-semibold text-foreground">Bulk Import Products</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {step !== "upload" && step !== "importing" && step !== "complete" && (
                            <button
                                onClick={step === "mapping" ? () => setStep("upload") : () => setStep("mapping")}
                                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 min-h-[44px]"
                            >
                                <ArrowLeft size={16} />
                                <span className="hidden sm:inline">Back</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {error && (
                        <div className="mb-4 p-3 sm:p-4 bg-destructive/10 text-destructive text-sm rounded-lg flex items-start gap-2">
                            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                            {error}
                        </div>
                    )}

                    {/* Step 1: Upload */}
                    {step === "upload" && (
                        <div className="space-y-4 sm:space-y-6">
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Upload CSV File</h3>
                                <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                                    Upload a CSV file with your product data. You&apos;ll map columns in the next step.
                                </p>
                            </div>

                            <div className="border-2 border-dashed border-border rounded-xl p-6 sm:p-12 text-center hover:border-primary/50 transition-colors">
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
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                        <Upload className="text-muted-foreground" size={24} />
                                    </div>
                                    <p className="text-base sm:text-lg font-medium text-foreground mb-1">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-sm text-muted-foreground">CSV files only</p>
                                </label>
                            </div>

                            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 sm:p-4">
                                <h4 className="font-medium text-primary mb-2 flex items-center gap-2 text-sm sm:text-base">
                                    <FileText size={16} />
                                    CSV Format Guidelines
                                </h4>
                                <ul className="text-sm text-primary/90 space-y-1 list-disc list-inside">
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
                        <div className="space-y-4 sm:space-y-6">
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Map Columns</h3>
                                <p className="text-muted-foreground text-sm sm:text-base">
                                    Match your CSV columns to product fields. Required fields are marked with *.
                                </p>
                            </div>

                            <div className="space-y-3 sm:space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-3 sm:gap-4 items-center">
                                    <label className="text-sm font-medium text-foreground">
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
                                        className="w-full px-3 py-2.5 sm:py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
                                    >
                                        <option value="">-- Select Column --</option>
                                        {headers.map((header, index) => (
                                            <option key={index} value={index}>
                                                {header || `Column ${index + 1}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-3 sm:gap-4 items-center">
                                    <label className="text-sm font-medium text-foreground">Price *</label>
                                    <select
                                        value={columnMapping?.price ?? ""}
                                        onChange={(e) =>
                                            setColumnMapping({
                                                ...((columnMapping || {}) as ColumnMapping),
                                                price: parseInt(e.target.value),
                                            })
                                        }
                                        className="w-full px-3 py-2.5 sm:py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
                                    >
                                        <option value="">-- Select Column --</option>
                                        {headers.map((header, index) => (
                                            <option key={index} value={index}>
                                                {header || `Column ${index + 1}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-3 sm:gap-4 items-center">
                                    <label className="text-sm font-medium text-foreground">Slug</label>
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
                                        className="w-full px-3 py-2.5 sm:py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
                                    >
                                        <option value="">-- Skip --</option>
                                        {headers.map((header, index) => (
                                            <option key={index} value={index}>
                                                {header || `Column ${index + 1}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-3 sm:gap-4 items-center">
                                    <label className="text-sm font-medium text-foreground">Description</label>
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
                                        className="w-full px-3 py-2.5 sm:py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
                                    >
                                        <option value="">-- Skip --</option>
                                        {headers.map((header, index) => (
                                            <option key={index} value={index}>
                                                {header || `Column ${index + 1}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-3 sm:gap-4 items-center">
                                    <label className="text-sm font-medium text-foreground">
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
                                        className="w-full px-3 py-2.5 sm:py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
                                    >
                                        <option value="">-- Skip --</option>
                                        {headers.map((header, index) => (
                                            <option key={index} value={index}>
                                                {header || `Column ${index + 1}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-3 sm:gap-4 items-center">
                                    <label className="text-sm font-medium text-foreground">
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
                                        className="w-full px-3 py-2.5 sm:py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
                                    >
                                        <option value="">-- Skip --</option>
                                        {headers.map((header, index) => (
                                            <option key={index} value={index}>
                                                {header || `Column ${index + 1}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-3 sm:gap-4 items-center">
                                    <label className="text-sm font-medium text-foreground">Images</label>
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
                                        className="w-full px-3 py-2.5 sm:py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
                                    >
                                        <option value="">-- Skip --</option>
                                        {headers.map((header, index) => (
                                            <option key={index} value={index}>
                                                {header || `Column ${index + 1}`}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="col-span-1 sm:col-span-2 text-xs text-muted-foreground">
                                        Separate multiple image URLs with a pipe symbol (|)
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleMappingSubmit}
                                    disabled={!columnMapping || columnMapping.name === undefined || columnMapping.price === undefined}
                                    className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] sm:min-h-0"
                                >
                                    Continue to Preview
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Preview */}
                    {step === "preview" && (
                        <div className="space-y-4 sm:space-y-6">
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                                    Preview Import ({parsedProducts.length} products)
                                </h3>
                                <p className="text-muted-foreground text-sm sm:text-base">
                                    Review the products that will be imported. All products will be created as drafts.
                                </p>
                            </div>

                            <div className="border border-border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50 sticky top-0">
                                            <tr>
                                                <th className="px-3 sm:px-4 py-3 text-left font-semibold text-foreground border-b">
                                                    Name
                                                </th>
                                                <th className="px-3 sm:px-4 py-3 text-left font-semibold text-foreground border-b">
                                                    Price
                                                </th>
                                                <th className="px-3 sm:px-4 py-3 text-left font-semibold text-foreground border-b hidden sm:table-cell">
                                                    Category
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {parsedProducts.map((product, index) => (
                                                <tr key={index} className="border-b border-border hover:bg-muted/30">
                                                    <td className="px-3 sm:px-4 py-3 font-medium text-foreground">
                                                        {product.name}
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-3 text-muted-foreground">
                                                        ${(product.price / 100).toFixed(2)}
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-3 text-muted-foreground hidden sm:table-cell">
                                                        {product.categorySlug || "-"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                                <button
                                    onClick={() => setStep("mapping")}
                                    className="w-full sm:w-auto px-4 py-3 sm:py-2 text-foreground hover:bg-muted rounded-lg font-medium min-h-[48px] sm:min-h-0"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleImport}
                                    className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors min-h-[48px] sm:min-h-0"
                                >
                                    Import Products
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Importing */}
                    {step === "importing" && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                            <p className="text-lg font-medium text-foreground">Importing products...</p>
                            <p className="text-muted-foreground">This may take a moment</p>
                        </div>
                    )}

                    {/* Step 5: Complete */}
                    {step === "complete" && importResults && (
                        <div className="space-y-4 sm:space-y-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="text-emerald-500" size={32} />
                                </div>
                                <h3 className="text-xl font-semibold text-foreground mb-2">
                                    Import Complete!
                                </h3>
                                <p className="text-muted-foreground">
                                    {importResults.success} products imported successfully
                                    {importResults.failed > 0 && `, ${importResults.failed} failed`}
                                </p>
                            </div>

                            {importResults.errors.length > 0 && (
                                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                                    <h4 className="font-semibold text-destructive mb-3">Errors</h4>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {importResults.errors.map((err, index) => (
                                            <div
                                                key={index}
                                                className="text-sm text-destructive flex items-start gap-2"
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

                            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
                                <button
                                    onClick={reset}
                                    className="w-full sm:w-auto px-4 py-3 sm:py-2 text-foreground hover:bg-muted rounded-lg font-medium min-h-[48px] sm:min-h-0"
                                >
                                    Import More
                                </button>
                                <Link
                                    href="/admin/products"
                                    onClick={onClose}
                                    className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors text-center min-h-[48px] sm:min-h-0"
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
