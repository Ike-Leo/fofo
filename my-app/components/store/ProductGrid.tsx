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
                <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
            </div>
        );
    }

    const products = result.products;

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">No products found</h3>
                <p className="text-gray-500 max-w-md">
                    This store hasn&apos;t added any active products yet. Check back soon.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
            {products.map((product) => (
                <Link
                    key={product._id}
                    href={`/store/${orgSlug}/product/${product.slug}`}
                    className="group block"
                >
                    {/* Image Container */}
                    <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-5">
                        {product.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                <ShoppingBag className="w-12 h-12 opacity-20" />
                            </div>
                        )}

                        {/* Badges / Overlays */}
                        {!product.inStock && (
                            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                Sold Out
                            </div>
                        )}
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                Sale
                            </div>
                        )}

                        {/* Quick Add Overlay (Desktop) */}
                        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out hidden md:block">
                            <button className="w-full bg-white/90 backdrop-blur text-black font-semibold py-3 rounded-full shadow-lg hover:bg-black hover:text-white transition-colors">
                                View Details
                            </button>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-1">
                        <h3 className="text-base font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
                            {product.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-semibold text-gray-900">
                                ${(product.price / 100).toFixed(2)}
                            </span>
                            {product.compareAtPrice && product.compareAtPrice > product.price && (
                                <span className="text-gray-400 line-through">
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
