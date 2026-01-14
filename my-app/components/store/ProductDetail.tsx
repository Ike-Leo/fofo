"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Loader2, ShoppingCart, Info } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cartStore";
import { Id } from "@/convex/_generated/dataModel";

interface ProductDetailProps {
    orgSlug: string;
    productSlug: string;
}

export function ProductDetail({ orgSlug, productSlug }: ProductDetailProps) {
    const product = useQuery(api.public.products.get, { orgSlug, productSlug });
    const addItem = useMutation(api.public.cart.addItem);
    const { sessionId, openCart, setSessionId } = useCartStore();

    // Local state
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    // Auto-select default variant when loaded
    if (product && !selectedVariantId && product.variants.length > 0) {
        const defaultV = product.variants.find(v => v.isDefault) || product.variants[0];
        setSelectedVariantId(defaultV._id);
    }

    if (product === undefined) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
            </div>
        );
    }

    if (product === null) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <h1 className="text-2xl font-bold">Product Not Found</h1>
                <Link href={`/store/${orgSlug}/products`} className="text-blue-600 underline">
                    Return to Shop
                </Link>
            </div>
        );
    }

    const selectedVariant = product.variants.find(v => v._id === selectedVariantId) || product.variants[0];
    const activePrice = selectedVariant?.price ?? product.price;
    const isSoldOut = selectedVariant ? selectedVariant.stockQuantity <= 0 : !product.inStock;

    const handleAddToCart = async () => {
        if (!sessionId) {
            // Should be handled in layout or provider, but fallback here
            const newId = Math.random().toString(36).substring(2, 15);
            setSessionId(newId);
            return; // Wait for next render or handle immediately? Better to just ensure sessionId exists.
        }

        setIsAdding(true);
        try {
            await addItem({
                sessionId,
                productId: product._id as Id<"products">,
                variantId: selectedVariant._id as Id<"productVariants">,
                quantity: 1,
                orgId: product.orgId
            });
            openCart();
        } catch (error) {
            console.error("Add to cart failed", error);
            alert("Failed to add to cart. Stock might have changed.");
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
            {/* Gallery Section */}
            <div className="space-y-4">
                <div className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden relative">
                    {product.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover object-center"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                            <Info className="w-16 h-16 opacity-20" />
                        </div>
                    )}
                </div>
            </div>

            {/* Product Info Section */}
            <div className="flex flex-col pt-8 md:pt-0">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">{product.name}</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-2xl font-medium text-gray-900">
                            ${(activePrice / 100).toFixed(2)}
                        </span>
                        {product.compareAtPrice && product.compareAtPrice > activePrice && (
                            <span className="text-lg text-gray-400 line-through">
                                ${(product.compareAtPrice / 100).toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Variant Selector */}
                {product.variants.length > 0 && (
                    <div className="mb-10 space-y-4">
                        <span className="text-sm font-medium text-gray-900">Select Option</span>
                        <div className="flex flex-wrap gap-3">
                            {product.variants.map((variant) => (
                                <button
                                    key={variant._id}
                                    onClick={() => setSelectedVariantId(variant._id)}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all
                                ${selectedVariantId === variant._id
                                            ? "border-black bg-black text-white shadow-md transform scale-105"
                                            : "border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50 bg-white"
                                        }
                                ${variant.stockQuantity <= 0 ? "opacity-50 cursor-not-allowed" : ""}
                            `}
                                    disabled={variant.stockQuantity <= 0}
                                >
                                    {variant.name}
                                    {variant.stockQuantity <= 0 && " (Out)"}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="prose prose-sm text-gray-500 mb-10 max-w-none">
                    {product.description || "No description available for this product."}
                </div>

                {/* Actions */}
                <div className="mt-auto space-y-4">
                    <button
                        onClick={handleAddToCart}
                        className={`w-full h-14 rounded-full font-bold text-lg flex items-center justify-center gap-3 transition-all
                    ${isSoldOut || isAdding
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]"
                            }
                `}
                        disabled={isSoldOut || isAdding}
                    >
                        {isSoldOut ? (
                            "Sold Out"
                        ) : isAdding ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="w-5 h-5" />
                                Add to Cart
                            </>
                        )}
                    </button>
                    <p className="text-center text-xs text-gray-400">
                        Secure checkout powered by Stripe.
                    </p>
                </div>
            </div>
        </div>
    );
}
