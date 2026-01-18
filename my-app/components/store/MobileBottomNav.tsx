"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, ShoppingCart, X } from "lucide-react";
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
      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border pb-safe sm:hidden shadow-lg">
        <div className="flex justify-around items-center h-16 px-2">
          {/* Home Tab */}
          <Link
            href={`/store/${storeSlug}`}
            className={`flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[48px] rounded-xl transition-all duration-200 ${
              isActive(`/store/${storeSlug}`)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Home size={22} strokeWidth={isActive(`/store/${storeSlug}`) ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Home</span>
          </Link>

          {/* Products Tab */}
          <Link
            href={`/store/${storeSlug}/products`}
            className={`flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[48px] rounded-xl transition-all duration-200 ${
              isActive(`/store/${storeSlug}/products`)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package size={22} strokeWidth={isActive(`/store/${storeSlug}/products`) ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Products</span>
          </Link>

          {/* Cart Tab */}
          <button
            onClick={() => {
              toggleCart();
              setIsCartOpen(!isCartOpen);
            }}
            className={`flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[48px] rounded-xl transition-all duration-200 ${
              isCartOpen
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label="Toggle cart"
          >
            <div className="relative">
              <ShoppingCart size={22} strokeWidth={isCartOpen ? 2.5 : 2} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-0.5 bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center rounded-full">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">Cart</span>
          </button>
        </div>
      </nav>

      {/* Spacer for content to not be hidden behind bottom nav */}
      <div className="h-16 sm:hidden" />
    </>
  );
}
