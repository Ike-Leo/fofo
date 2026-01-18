"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface MobileBottomNavProps {
  storeSlug: string;
}

export function MobileBottomNav({ storeSlug }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { toggleCart, sessionId } = useCartStore();
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Fetch cart count for badge
  const cart = useQuery(api.public.cart.get, sessionId ? { sessionId } : "skip");
  const itemCount = cart ? cart.items.reduce((acc, item) => acc + item.quantity, 0) : 0;

  // Check if paths are active
  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Bottom Navigation - Floating Capsule (Mobile Only) */}
      <nav className="fixed bottom-6 left-4 right-4 z-50 glass rounded-3xl shadow-2xl border border-white/10 h-16 sm:hidden">
        <div className="flex justify-around items-center h-full px-2">
          {/* Home Tab */}
          <Link
            href={`/store/${storeSlug}`}
            className="relative flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[52px] rounded-xl transition-all duration-200 group"
          >
            {/* Active indicator */}
            {isActive(`/store/${storeSlug}`) && (
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            )}
            <Home
              size={22}
              strokeWidth={isActive(`/store/${storeSlug}`) ? 2.5 : 2}
              className={`transition-colors ${
                isActive(`/store/${storeSlug}`)
                  ? "text-amber-400"
                  : "text-secondary group-hover:text-primary"
              }`}
            />
            <span
              className={`text-xs mt-1 font-medium transition-colors ${
                isActive(`/store/${storeSlug}`)
                  ? "text-amber-400"
                  : "text-secondary group-hover:text-primary"
              }`}
            >
              Home
            </span>
          </Link>

          {/* Products Tab */}
          <Link
            href={`/store/${storeSlug}/products`}
            className="relative flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[52px] rounded-xl transition-all duration-200 group"
          >
            {/* Active indicator */}
            {isActive(`/store/${storeSlug}/products`) && (
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            )}
            <Package
              size={22}
              strokeWidth={isActive(`/store/${storeSlug}/products`) ? 2.5 : 2}
              className={`transition-colors ${
                isActive(`/store/${storeSlug}/products`)
                  ? "text-amber-400"
                  : "text-secondary group-hover:text-primary"
              }`}
            />
            <span
              className={`text-xs mt-1 font-medium transition-colors ${
                isActive(`/store/${storeSlug}/products`)
                  ? "text-amber-400"
                  : "text-secondary group-hover:text-primary"
              }`}
            >
              Products
            </span>
          </Link>

          {/* Cart Tab */}
          <button
            onClick={() => {
              toggleCart();
              setIsCartOpen(!isCartOpen);
            }}
            className="relative flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[52px] rounded-xl transition-all duration-200 group"
            aria-label="Toggle cart"
          >
            {/* Active indicator */}
            {isCartOpen && (
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            )}
            <div className="relative">
              <ShoppingCart
                size={22}
                strokeWidth={isCartOpen ? 2.5 : 2}
                className={`transition-colors ${
                  isCartOpen
                    ? "text-amber-400"
                    : "text-secondary group-hover:text-primary"
                }`}
              />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-lg shadow-red-500/20">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </div>
            <span
              className={`text-xs mt-1 font-medium transition-colors ${
                isCartOpen ? "text-amber-400" : "text-secondary group-hover:text-primary"
              }`}
            >
              Cart
            </span>
          </button>
        </div>
      </nav>

      {/* Spacer for content to not be hidden behind bottom nav */}
      <div className="h-24 sm:hidden" />
    </>
  );
}
