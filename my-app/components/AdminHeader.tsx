/* eslint-disable */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { OrganizationSwitcher } from "./OrganizationSwitcher";
import { useAuthActions } from "@convex-dev/auth/react";
import { LogOut, LayoutDashboard, Package, Settings, ClipboardList, ShoppingBag, Users, MessageSquare, Shield } from "lucide-react";
import { ThemeToggle } from "./ThemeProvider";

export default function AdminHeader() {
    const pathname = usePathname();
    const { signOut } = useAuthActions();

    const isActive = (path: string) => pathname?.startsWith(path);

    return (
        <header className="sticky top-0 z-50 bg-background/95 dark:bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-foreground button-hover">
                            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-md">
                                U
                            </div>
                            <span>UCCP</span>
                        </Link>

                        <nav className="hidden md:flex gap-1">
                            <Link
                                href="/admin"
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all button-hover ${pathname === "/admin"
                                    ? "bg-accent text-accent-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                    }`}
                            >
                                <LayoutDashboard size={18} />
                                Platform
                            </Link>
                            <Link
                                href="/admin/products"
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all button-hover ${isActive("/admin/products")
                                    ? "bg-primary/10 text-primary shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                    }`}
                            >
                                <Package size={18} />
                                Products
                            </Link>
                            <Link
                                href="/admin/orders"
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all button-hover ${isActive("/admin/orders")
                                    ? "bg-primary/10 text-primary shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                    }`}
                            >
                                <ShoppingBag size={18} />
                                Orders
                            </Link>
                            <Link
                                href="/admin/customers"
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all button-hover ${isActive("/admin/customers")
                                    ? "bg-primary/10 text-primary shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                    }`}
                            >
                                <Users size={18} />
                                Customers
                            </Link>
                            <Link
                                href="/admin/inventory"
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all button-hover ${isActive("/admin/inventory")
                                    ? "bg-primary/10 text-primary shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                    }`}
                            >
                                <ClipboardList size={18} />
                                Inventory
                            </Link>
                            <Link
                                href="/admin/chat"
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all button-hover ${isActive("/admin/chat")
                                    ? "bg-accent text-accent-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                    }`}
                            >
                                <MessageSquare size={18} />
                                Chat
                            </Link>
                            <Link
                                href="/admin/team"
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all button-hover ${isActive("/admin/team")
                                    ? "bg-accent text-accent-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                    }`}
                            >
                                <Shield size={18} />
                                Team
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        <OrganizationSwitcher />
                        <div className="h-6 w-px bg-border" />
                        <ThemeToggle />
                        <div className="h-6 w-px bg-border" />
                        <button
                            onClick={() => signOut()}
                            className="text-muted-foreground hover:text-destructive transition-all p-2 rounded-xl hover:bg-destructive/10 button-hover"
                            title="Sign out"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
