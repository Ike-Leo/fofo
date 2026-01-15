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
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white">
                            <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-slate-900">
                                U
                            </div>
                            <span>UCCP</span>
                        </Link>

                        <nav className="hidden md:flex gap-1">
                            <Link
                                href="/admin"
                                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === "/admin"
                                    ? "bg-slate-100 text-slate-900"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                    }`}
                            >
                                <LayoutDashboard size={18} />
                                Platform
                            </Link>
                            <Link
                                href="/admin/products"
                                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/admin/products")
                                    ? "bg-primary/10 text-primary"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                    }`}
                            >
                                <Package size={18} />
                                Products
                            </Link>
                            <Link
                                href="/admin/orders"
                                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/admin/orders")
                                    ? "bg-primary/10 text-primary"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                    }`}
                            >
                                <ShoppingBag size={18} />
                                Orders
                            </Link>
                            <Link
                                href="/admin/customers"
                                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/admin/customers")
                                    ? "bg-primary/10 text-primary"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                    }`}
                            >
                                <Users size={18} />
                                Customers
                            </Link>
                            <Link
                                href="/admin/inventory"
                                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/admin/inventory")
                                    ? "bg-primary/10 text-primary"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                    }`}
                            >
                                <ClipboardList size={18} />
                                Inventory
                            </Link>
                            <Link
                                href="/admin/chat"
                                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/admin/chat")
                                    ? "bg-purple-100 text-purple-700"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                    }`}
                            >
                                <MessageSquare size={18} />
                                Chat
                            </Link>
                            <Link
                                href="/admin/team"
                                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/admin/team")
                                    ? "bg-indigo-100 text-indigo-700"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                    }`}
                            >
                                <Shield size={18} />
                                Team
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <OrganizationSwitcher />
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                        <ThemeToggle />
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                        <button
                            onClick={() => signOut()}
                            className="text-slate-500 hover:text-red-600 transition-colors p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"
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
