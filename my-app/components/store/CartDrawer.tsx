"use client";

import { useCartStore } from "@/lib/store/cartStore";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { X, Minus, Plus, Trash2, Loader2, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { useParams } from "next/navigation";

export function CartDrawer() {
    const { isOpen, closeCart, sessionId, setSessionId } = useCartStore();
    const params = useParams();
    const slug = params.slug as string;

    // ... rest of component

    const [isClient, setIsClient] = useState(false);

    // Hydration fix
    useEffect(() => {
        setIsClient(true);
        if (!sessionId) {
            // Generate random session ID if not exists
            const newSessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            setSessionId(newSessionId);
        }
    }, [sessionId, setSessionId]);

    const cart = useQuery(api.public.cart.get, sessionId ? { sessionId } : "skip");
    const updateQuantity = useMutation(api.public.cart.updateQuantity);
    const removeItem = useMutation(api.public.cart.removeItem);

    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleUpdateQuantity = async (itemId: Id<"cartItems">, variantId: Id<"productVariants">, quantity: number) => {
        if (!cart) return;
        setLoadingId(itemId);
        try {
            if (quantity <= 0) {
                await removeItem({ cartId: cart._id, variantId });
            } else {
                await updateQuantity({ cartId: cart._id, variantId, quantity });
            }
        } catch (error) {
            console.error("Failed to update cart", error);
        } finally {
            setLoadingId(null);
        }
    };

    if (!isClient) return null;

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity"
                    onClick={closeCart}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5" />
                            Your Cart
                        </h2>
                        <button
                            onClick={closeCart}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Items */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {!cart ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="animate-spin text-gray-300" />
                            </div>
                        ) : cart.items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <ShoppingBag className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-gray-500 font-medium">Your cart is empty</p>
                                <button
                                    onClick={closeCart}
                                    className="mt-4 text-sm font-semibold text-blue-600 hover:underline"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        ) : (
                            cart.items.map((item) => (
                                <div key={item._id} className="flex gap-4">
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {item.image && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <div>
                                                <h3 className="font-medium text-gray-900 line-clamp-1">{item.name}</h3>
                                                {/* Variant name is already included in item.name by the backend */}
                                            </div>
                                            <p className="font-semibold text-gray-900">
                                                ${(item.price / 100).toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <div className="flex items-center border border-gray-200 rounded-lg">
                                                <button
                                                    onClick={() => handleUpdateQuantity(item._id, item.variantId, item.quantity - 1)}
                                                    className="p-1.5 hover:bg-gray-50 text-gray-500 disabled:opacity-50"
                                                    disabled={loadingId === item._id}
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item._id, item.variantId, item.quantity + 1)}
                                                    className="p-1.5 hover:bg-gray-50 text-gray-500 disabled:opacity-50"
                                                    disabled={loadingId === item._id}
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => handleUpdateQuantity(item._id, item.variantId, 0)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                disabled={loadingId === item._id}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {cart && cart.items.length > 0 && (
                        <div className="border-t border-gray-100 p-6 bg-gray-50/50 space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Subtotal</span>
                                    <span>${(cart.totalAmount / 100).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold text-gray-900">
                                    <span>Total</span>
                                    <span>${(cart.totalAmount / 100).toFixed(2)}</span>
                                </div>
                            </div>
                            <Link
                                href={`/store/${slug}/checkout`}
                                onClick={closeCart}
                                className="w-full flex items-center justify-center py-4 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors shadow-lg"
                            >
                                Checkout
                            </Link>
                            <p className="text-center text-xs text-gray-400">
                                Shipping & taxes calculated at checkout.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
