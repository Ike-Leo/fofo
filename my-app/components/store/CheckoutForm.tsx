"use client";

import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCartStore } from "@/lib/store/cartStore";
import { Loader2, Lock, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function CheckoutForm({ orgSlug }: { clientSecret: string; orgSlug: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const { sessionId, setSessionId } = useCartStore();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const router = useRouter();

    // Mutations
    const checkout = useMutation(api.public.cart.checkout);
    const cart = useQuery(api.public.cart.get, sessionId ? { sessionId } : "skip");

    // Local form state for customer info (since we don't have a full auth user)
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements || !cart) {
            return;
        }

        setIsProcessing(true);
        setErrorMessage(null);

        try {
            // 1. Confirm Payment with Stripe
            const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: window.location.origin + `/store/${orgSlug}/order/success`, // We won't actually redirect if we handle it here, but required
                },
                redirect: 'if_required',
            });

            if (paymentError) {
                setErrorMessage(paymentError.message || "An unexpected error occurred.");
                setIsProcessing(false);
                return;
            }

            if (paymentIntent && paymentIntent.status === "succeeded") {
                // 2. Call Convex to create the Order
                // NOTE: In production, rely on Webhooks for this. This is an optimistic client-side call.
                const orderId = await checkout({
                    cartId: cart._id,
                    customerInfo: {
                        name,
                        email,
                        address,
                    }
                });

                // 3. Clear Session & Redirect
                // New session for next order
                const newSessionId = Math.random().toString(36).substring(2, 15);
                setSessionId(newSessionId);

                router.push(`/store/${orgSlug}/order/${orderId}`);
            }
        } catch (err) {
            console.error(err);
            setErrorMessage("Payment succeeded but order creation failed. Please contact support.");
            // This is the danger of client-side logic.
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Contact Information - Mobile Stacked */}
            <div className="bg-card p-4 sm:p-6 rounded-xl border border-border shadow-sm space-y-3 sm:space-y-4">
                <h3 className="font-semibold text-foreground border-b border-border pb-2 text-base sm:text-lg">Contact Information</h3>
                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-foreground">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full border border-border bg-background rounded-xl px-4 py-3.5 text-base sm:text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none min-h-[48px] transition-shadow"
                        />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-foreground">
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            inputMode="text"
                            autoComplete="name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full border border-border bg-background rounded-xl px-4 py-3.5 text-base sm:text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none min-h-[48px] transition-shadow"
                        />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                        <label htmlFor="address" className="text-sm font-medium text-foreground">
                            Shipping Address
                        </label>
                        <input
                            id="address"
                            type="text"
                            inputMode="text"
                            autoComplete="shipping street-address"
                            required
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="123 Main St, City, Country"
                            className="w-full border border-border bg-background rounded-xl px-4 py-3.5 text-base sm:text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none min-h-[48px] transition-shadow"
                        />
                    </div>
                </div>
            </div>

            {/* Payment Details */}
            <div className="bg-card p-4 sm:p-6 rounded-xl border border-border shadow-sm space-y-3 sm:space-y-4">
                <h3 className="font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2 text-base sm:text-lg">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    Payment Details
                </h3>
                <PaymentElement options={{
                    layout: {
                        type: 'tabs',
                        defaultCollapsed: false,
                    }
                }} />
            </div>

            {/* Error Message */}
            {errorMessage && (
                <div className="p-3 sm:p-4 bg-destructive/10 text-destructive rounded-xl text-sm flex items-center gap-2 border border-destructive/20">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* Submit Button - Full Width, Touch Friendly */}
            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full h-12 sm:h-14 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[48px] shadow-lg text-base sm:text-lg"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        <CheckCircle className="w-5 h-5" />
                        Pay & Complete Order
                    </>
                )}
            </button>

            {/* Security Note */}
            <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5 px-4">
                <Lock className="w-3 h-3" />
                Secured by Stripe. Your payment information is encrypted.
            </p>
        </form>
    );
}
