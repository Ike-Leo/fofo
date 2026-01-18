import AdminHeader from "@/components/AdminHeader";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <AdminHeader />
            <main>
                {children}
            </main>
        </div>
    );
}
