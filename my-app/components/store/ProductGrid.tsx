"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { ShoppingBag, Loader2 } from "lucide-react";

interface ProductGridProps {
    orgSlug: string;
}

export function ProductGrid({ orgSlug }: ProductGridProps) {
    const result = useQuery(api.public.products.list, { orgSlug });

    if (result === undefined) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const products = result.products;

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-3 sm:space-y-4 px-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">No products found</h3>
                <p className="text-sm sm:text-base text-muted-foreground max-w-md">
                    This store hasn&apos;t added any active products yet. Check back soon.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-6 lg:gap-x-8 gap-y-6 sm:gap-y-8 lg:gap-y-12">
            {products.map((product) => (
                <Link
                    key={product._id}
                    href={`/store/${orgSlug}/product/${product.slug}`}
                    className="group block min-h-[44px]"
                >
                    {/* Image Container - Touch-friendly */}
                    <div className="relative aspect-[3/4] bg-muted rounded-xl overflow-hidden mb-3 sm:mb-5">
                        {product.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted/50 text-muted-foreground">
                                <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 opacity-30" />
                            </div>
                        )}

                        {/* Badges - Responsive positioning */}
                        {!product.inStock && (
                            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-black/70 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider">
                                Sold Out
                            </div>
                        )}
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-destructive text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                                Sale
                            </div>
                        )}

                        {/* Quick Add Overlay (Desktop Only) */}
                        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out hidden md:block">
                            <button className="w-full bg-background/90 backdrop-blur text-foreground font-semibold py-2.5 sm:py-3 rounded-full shadow-lg hover:bg-primary hover:text-primary-foreground transition-colors text-sm">
                                View Details
                            </button>
                        </div>
                    </div>

                    {/* Details - Responsive typography */}
                    <div className="space-y-0.5 sm:space-y-1">
                        <h3 className="text-sm sm:text-base font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {product.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-semibold text-foreground">
                                ${(product.price / 100).toFixed(2)}
                            </span>
                            {product.compareAtPrice && product.compareAtPrice > product.price && (
                                <span className="text-muted-foreground line-through text-xs sm:text-sm">
                                    ${(product.compareAtPrice / 100).toFixed(2)}
                                </span>
                            )}
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
