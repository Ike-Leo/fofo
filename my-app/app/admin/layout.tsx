import AdminHeader from "@/components/AdminHeader";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50/50">
            <AdminHeader />
            <main>
                {children}
            </main>
        </div>
    );
}
