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

            {/* Drawer - Mobile Full Width, Desktop Side Panel */}
            <div
                className={`fixed inset-y-0 right-0 z-[70] w-full sm:max-w-md bg-card shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header - Enhanced Touch Targets */}
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border">
                        <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5" />
                            Your Cart
                        </h2>
                        <button
                            onClick={closeCart}
                            className="p-2.5 -mr-2.5 hover:bg-muted rounded-xl transition-colors text-muted-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
                            aria-label="Close cart"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Items - Optimized Spacing */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
                        {!cart ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="animate-spin text-muted-foreground" />
                            </div>
                        ) : cart.items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                    <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground font-medium">Your cart is empty</p>
                                <button
                                    onClick={closeCart}
                                    className="mt-4 text-sm font-semibold text-primary hover:underline min-h-[44px] px-4 py-2"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        ) : (
                            cart.items.map((item) => (
                                <div key={item._id} className="flex gap-3 sm:gap-4 bg-card rounded-xl p-3 border border-border">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                                        {item.image && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1 sm:mb-2">
                                            <div className="min-w-0 flex-1 pr-2">
                                                <h3 className="font-medium text-foreground text-sm sm:text-base line-clamp-1">{item.name}</h3>
                                                {/* Variant name is already included in item.name by the backend */}
                                            </div>
                                            <p className="font-semibold text-foreground text-sm sm:text-base flex-shrink-0">
                                                ${(item.price / 100).toFixed(2)}
                                            </p>
                                        </div>

                                        {/* Quantity Controls - Larger Touch Targets for Mobile */}
                                        <div className="flex justify-between items-center mt-2 sm:mt-3">
                                            <div className="flex items-center border border-border rounded-lg">
                                                <button
                                                    onClick={() => handleUpdateQuantity(item._id, item.variantId, item.quantity - 1)}
                                                    className="p-2 sm:p-1.5 hover:bg-muted text-muted-foreground disabled:opacity-50 min-h-[36px] min-w-[36px] sm:min-w-[32px] sm:min-h-[32px] flex items-center justify-center"
                                                    disabled={loadingId === item._id}
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                                                </button>
                                                <span className="w-8 sm:w-10 text-center text-sm font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item._id, item.variantId, item.quantity + 1)}
                                                    className="p-2 sm:p-1.5 hover:bg-muted text-muted-foreground disabled:opacity-50 min-h-[36px] min-w-[36px] sm:min-w-[32px] sm:min-h-[32px] flex items-center justify-center"
                                                    disabled={loadingId === item._id}
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => handleUpdateQuantity(item._id, item.variantId, 0)}
                                                className="text-muted-foreground hover:text-destructive transition-colors p-2 -mr-2 min-h-[40px] min-w-[40px] flex items-center justify-center"
                                                disabled={loadingId === item._id}
                                                aria-label="Remove item"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer - Full Width Checkout Button */}
                    {cart && cart.items.length > 0 && (
                        <div className="border-t border-border p-4 sm:p-6 bg-muted/30 space-y-3 sm:space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span className="font-mono">${(cart.totalAmount / 100).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold text-foreground">
                                    <span>Total</span>
                                    <span className="font-mono">${(cart.totalAmount / 100).toFixed(2)}</span>
                                </div>
                            </div>
                            <Link
                                href={`/store/${slug}/checkout`}
                                onClick={closeCart}
                                className="w-full flex items-center justify-center py-3.5 sm:py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg min-h-[48px] text-base sm:text-lg"
                            >
                                Checkout
                            </Link>
                            <p className="text-center text-xs text-muted-foreground px-2">
                                Shipping & taxes calculated at checkout.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
