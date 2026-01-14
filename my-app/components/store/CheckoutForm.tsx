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
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="col-span-full space-y-1">
                        <label className="text-sm font-medium text-gray-700">Shipping Address</label>
                        <input
                            type="text"
                            required
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="123 Main St, City, Country"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-400" />
                    Payment Details
                </h3>
                <PaymentElement />
            </div>

            {errorMessage && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                    {errorMessage}
                </div>
            )}

            <button
                disabled={!stripe || isProcessing}
                className="w-full h-14 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        </form>
    );
}
