import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";
import { CartDrawer } from "@/components/store/CartDrawer";

export default function StoreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-white font-sans antialiased text-gray-900 selection:bg-black selection:text-white">
            <StoreHeader />
            <main className="flex-1 pt-[70px]">
                {children}
            </main>
            <CartDrawer />
            <StoreFooter />
        </div>
    );
}
