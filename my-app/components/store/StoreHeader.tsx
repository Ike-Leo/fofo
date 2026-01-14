"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useParams } from "next/navigation";
import { useCartStore } from "@/lib/store/cartStore";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function StoreHeader() {
    const params = useParams();
    const slug = params.slug as string;
    const { toggleCart, sessionId } = useCartStore();

    // Fetch cart count
    // Optimistically, we might want to store count in zustand too, 
    // but for now let's just query. It's fast enough.
    const cart = useQuery(api.public.cart.get, sessionId ? { sessionId } : "skip");
    // Derived state directly from cart query
    const itemCount = cart ? cart.items.reduce((acc, item) => acc + item.quantity, 0) : 0;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-white/70 border-b border-gray-100/50 transition-all duration-300">
            <Link href={`/store/${slug}`} className="text-xl font-bold tracking-tighter text-gray-900 uppercase">
                {slug || "Store"}
            </Link>

            <nav className="flex items-center gap-6">
                <Link href={`/store/${slug}/products`} className="text-sm font-medium text-gray-600 hover:text-black transition-colors hidden md:block">
                    Shop All
                </Link>
                <button
                    onClick={toggleCart}
                    className="relative p-2 text-gray-800 hover:bg-black/5 rounded-full transition-all group"
                >
                    <ShoppingCart className="w-5 h-5" />
                    {itemCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-black text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-fade-in">
                            {itemCount}
                        </span>
                    )}
                </button>
            </nav>
        </header>
    );
}
