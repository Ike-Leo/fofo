"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OrganizationSwitcher } from "./OrganizationSwitcher";
import { useAuthActions } from "@convex-dev/auth/react";
import { LogOut, LayoutDashboard, Package, ClipboardList, ShoppingBag, Users, MessageSquare, Shield, Menu, X } from "lucide-react";
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
    <header
      className="sticky top-0 z-50 glass-strong border-b border-subtle shadow-xl pl-safe"
      style={{ paddingLeft: 'env(safe-area-inset-left)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4 md:gap-8">
            {/* Mobile Menu Toggle - Enhanced touch target (48x48px) */}
            <button
              className="md:hidden p-2 -ml-2 text-secondary hover:text-primary active-scale min-h-[48px] min-w-[48px] flex items-center justify-center transition-fast"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
                U
              </div>
              <span className="hidden sm:inline">UCCP</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-1">
              {navItems.map((item) => {
                const active = item.exact ? pathname === item.href : isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-body-md font-medium transition-fast min-h-[44px] ${active
                      ? "bg-gradient-to-br from-amber-400/20 to-amber-600/20 text-amber-400 border border-amber-400/30 shadow-lg shadow-amber-500/10"
                      : "text-secondary hover:text-primary hover:bg-elevated/50"
                      }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Organization Switcher - Full width on mobile */}
            <div className="w-full sm:w-auto max-w-[200px]">
              <OrganizationSwitcher />
            </div>

            {/* Vertical Divider (desktop only) */}
            <div className="h-6 w-px bg-subtle hidden sm:block" />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Vertical Divider (desktop only) */}
            <div className="h-6 w-px bg-subtle hidden sm:block" />

            {/* Sign Out Button */}
            <button
              onClick={() => signOut()}
              className="text-secondary hover:text-accent-danger transition-fast p-2 rounded-xl hover:bg-accent-danger/10 min-h-[44px] min-w-[44px] flex items-center justify-center active-scale"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu - Full-width bottom sheet */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden border-t border-subtle glass-strong absolute w-full left-0 animate-slide-down shadow-2xl pl-safe"
          style={{ paddingLeft: 'env(safe-area-inset-left)' }}
        >
          <div className="p-4 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {navItems.map((item) => {
              const active = item.exact ? pathname === item.href : isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-body-md font-semibold transition-fast min-h-[52px] ${active
                    ? "bg-gradient-to-br from-amber-400/20 to-amber-600/20 text-amber-400 border border-amber-400/30 shadow-lg shadow-amber-500/10"
                    : "text-secondary hover:text-primary hover:bg-elevated/50 active-scale"
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
