import Link from "next/link";
import { CheckCircle, ShoppingBag } from "lucide-react";

export default async function OrderSuccessPage({
    params,
}: {
    params: Promise<{ slug: string; orderId: string }>;
}) {
    const { slug, orderId } = await params;

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
            <div className="w-20 h-20 bg-green-100/50 rounded-full flex items-center justify-center mb-6 animate-fade-in-up">
                <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                Order Confirmed!
            </h1>

            <p className="text-gray-500 max-w-md mb-2 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                Thank you for your purchase. Your order has been successfully placed.
            </p>

            <div className="bg-gray-50 rounded-lg px-4 py-2 mb-8 font-mono text-sm text-gray-600 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
                Order ID: {orderId}
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
                <Link
                    href={`/store/${slug}/products`}
                    className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
                >
                    <ShoppingBag className="w-5 h-5" />
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}
