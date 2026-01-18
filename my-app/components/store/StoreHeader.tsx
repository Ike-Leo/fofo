"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { useCartStore } from "@/lib/store/cartStore";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function StoreHeader() {
    const params = useParams();
    const pathname = usePathname();
    const slug = params.slug as string;
    const { toggleCart, sessionId } = useCartStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Fetch cart count
    // Optimistically, we might want to store count in zustand too,
    // but for now let's just query. It's fast enough.
    const cart = useQuery(api.public.cart.get, sessionId ? { sessionId } : "skip");
    // Derived state directly from cart query
    const itemCount = cart ? cart.items.reduce((acc, item) => acc + item.quantity, 0) : 0;

    const navItems = [
        { href: `/store/${slug}`, label: "Home", exact: true },
        { href: `/store/${slug}/products`, label: "Shop All", exact: false },
    ];

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 backdrop-blur-xl bg-background/80 border-b border-border shadow-sm transition-all duration-300">
                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground min-h-[48px] min-w-[48px] flex items-center justify-center"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Store Logo/Name */}
                <Link href={`/store/${slug}`} className="text-xl sm:text-2xl font-bold tracking-tight text-foreground uppercase button-hover">
                    {slug || "Store"}
                </Link>

                {/* Desktop Nav & Cart */}
                <nav className="flex items-center gap-2 sm:gap-6">
                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {navItems.map((item) => {
                            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`text-sm font-medium transition-colors ${
                                        active
                                            ? "text-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Cart Button - Enhanced Touch Target */}
                    <button
                        onClick={toggleCart}
                        className="relative p-3 text-foreground hover:bg-muted rounded-xl transition-all min-h-[44px] min-w-[44px] flex items-center justify-center button-hover"
                        aria-label="Toggle cart"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        {itemCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-5 px-1 bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center rounded-full animate-fade-in">
                                {itemCount > 9 ? "9+" : itemCount}
                            </span>
                        )}
                    </button>
                </nav>
            </header>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed top-[56px] left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border animate-in slide-in-from-top-2 fade-in duration-200">
                    <nav className="p-4 space-y-1">
                        {navItems.map((item) => {
                            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 min-h-[52px] ${
                                        active
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            )}
        </>
    );
}
