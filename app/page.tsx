/* eslint-disable */
"use client";

import { useConvexAuth } from "convex/react";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { OrganizationSwitcher } from "@/components/OrganizationSwitcher";
import { LayoutDashboard, LogOut, ArrowRight, ShieldCheck, Globe, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeProvider";

export default function Home() {
  const { isAuthenticated } = useConvexAuth();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-sm font-bold">
              U
            </div>
            <h1 className="font-bold text-xl tracking-tight">UCCP</h1>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link
                href="/admin"
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2"
              >
                <LayoutDashboard size={16} />
                Go to Console
              </Link>
            ) : (
              <Link
                href="/signin"
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90 transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              v2.0 Now Available
            </div>
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground">
              Universal Commerce <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                Control Platform
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The complete operating system for modern commerce. Manage products, orders, customers, and teams from a single, beautiful command center.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href={isAuthenticated ? "/admin" : "/signin"}
                className="px-8 py-4 bg-foreground text-background font-bold rounded-full hover:bg-foreground/90 transition-all flex items-center gap-2 shadow-lg hover:scale-105"
              >
                {isAuthenticated ? "Enter Dashboard" : "Get Started"}
                <ArrowRight size={18} />
              </Link>
              <a
                href="https://docs.convex.dev"
                target="_blank"
                rel="noreferrer"
                className="px-8 py-4 bg-muted text-foreground font-semibold rounded-full hover:bg-muted/80 transition-all border border-border"
              >
                Read Documentation
              </a>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 px-6 bg-muted/10 border-t border-border">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Globe className="text-blue-500" size={32} />}
                title="Global Scale"
                description="Built on distributed infrastructure to handle commerce at any scale, anywhere in the world."
              />
              <FeatureCard
                icon={<ShieldCheck className="text-emerald-500" size={32} />}
                title="Enterprise Security"
                description="Bank-grade security with granular role-based access control and comprehensive audit logs."
              />
              <FeatureCard
                icon={<Zap className="text-amber-500" size={32} />}
                title="Real-time Sync"
                description="Changes reflect instantly across all devices. No more refresh buttons or stale data."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-border text-center text-sm text-muted-foreground">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Universal Commerce Control Platform. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-all hover:-translate-y-1">
      <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
