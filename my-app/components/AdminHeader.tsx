/* eslint-disable */
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OrganizationSwitcher } from "./OrganizationSwitcher";
import { useAuthActions } from "@convex-dev/auth/react";
import { LogOut, LayoutDashboard, Package, Settings, ClipboardList, ShoppingBag, Users, MessageSquare, Shield, Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeProvider";

export default function AdminHeader() {
    const pathname = usePathname();
    const { signOut } = useAuthActions();

    const isActive = (path: string) => pathname?.startsWith(path);

    const navItems = [
        { href: "/admin", label: "Platform", icon: LayoutDashboard, exact: true },
        { href: "/admin/products", label: "Products", icon: Package },
        { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
        { href: "/admin/customers", label: "Customers", icon: Users },
        { href: "/admin/inventory", label: "Inventory", icon: ClipboardList },
        { href: "/admin/chat", label: "Chat", icon: MessageSquare },
        { href: "/admin/team", label: "Team", icon: Shield },
    ];

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-4 md:gap-8">
                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>

                        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-foreground button-hover">
                            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-sm">
                                U
                            </div>
                            <span className="hidden sm:inline">UCCP</span>
                        </Link>

                        <nav className="hidden md:flex gap-1">
                            {navItems.map((item) => {
                                const active = item.exact ? pathname === item.href : isActive(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-200 ${active
                                            ? "bg-primary text-primary-foreground font-bold shadow-md"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium"
                                            }`}
                                    >
                                        <item.icon size={20} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <OrganizationSwitcher />
                        <div className="h-6 w-px bg-border hidden sm:block" />
                        <ThemeToggle />
                        <div className="h-6 w-px bg-border hidden sm:block" />
                        <button
                            onClick={() => signOut()}
                            className="text-muted-foreground hover:text-destructive transition-all p-2 rounded-xl hover:bg-destructive/10"
                            title="Sign out"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl absolute w-full left-0 animate-in slide-in-from-top-5 fade-in duration-200 shadow-2xl">
                    <div className="p-4 space-y-2">
                        {navItems.map((item) => {
                            const active = item.exact ? pathname === item.href : isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${active
                                        ? "bg-primary/10 text-primary font-bold"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium"
                                        }`}
                                >
                                    <item.icon size={20} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </header>
    );
}
