"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { ShoppingBag, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface ProductGridProps {
    orgSlug: string;
}

export function ProductGrid({ orgSlug }: ProductGridProps) {
    const result = useQuery(api.public.products.list, { orgSlug });

    if (result === undefined) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-tertiary" />
            </div>
        );
    }

    const products = result.products;

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-3 sm:space-y-4 px-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-tertiary rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-secondary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-primary">No products found</h3>
                <p className="text-sm sm:text-base text-secondary max-w-md">
                    This store hasn&apos;t added any active products yet. Check back soon.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {products.map((product) => (
                <Link
                    key={product._id}
                    href={`/store/${orgSlug}/product/${product.slug}`}
                    className="group"
                >
                    <Card variant="elevated" padding="none" clickable className="overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all">
                        {/* Image Container with rounded corners */}
                        <div className="relative aspect-[3/4] bg-tertiary rounded-xl overflow-hidden">
                            {product.images?.[0] ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-elevated/50 text-secondary">
                                    <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 opacity-30" />
                                </div>
                            )}

                            {/* Badges - Gradient styling */}
                            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex gap-1.5">
                                {!product.inStock && (
                                    <div className="glass px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                                        <span className="text-[10px] sm:text-xs font-bold text-secondary uppercase tracking-wider">
                                            Sold Out
                                        </span>
                                    </div>
                                )}
                            </div>
                            {product.compareAtPrice && product.compareAtPrice > product.price && (
                                <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                                    <div className="bg-gradient-to-br from-red-500 to-red-600 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg shadow-red-500/20">
                                        <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider">
                                            Sale
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Quick Add Overlay (Desktop Only) */}
                            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out hidden md:block">
                                <button className="w-full glass text-primary font-semibold py-2.5 sm:py-3 rounded-xl shadow-lg hover:bg-white/10 transition-colors text-sm">
                                    View Details
                                </button>
                            </div>
                        </div>

                        {/* Product Info - Premium styling */}
                        <div className="p-3 sm:p-4 space-y-2">
                            <h3 className="text-heading-md font-semibold text-primary group-hover:text-accent-primary transition-colors line-clamp-2">
                                {product.name}
                            </h3>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-body-lg font-semibold text-accent-primary">
                                        ${(product.price / 100).toFixed(2)}
                                    </span>
                                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                                        <span className="text-body-sm text-tertiary line-through">
                                            ${(product.compareAtPrice / 100).toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Add to Cart Button - Mobile only */}
                            <button className="w-full sm:hidden min-h-[44px] mt-2 bg-gradient-to-br from-amber-400 to-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 active:scale-98 transition-transform text-sm">
                                Add to Cart
                            </button>
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
