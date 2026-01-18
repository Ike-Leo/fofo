"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store/cartStore";
import { CheckoutForm } from "@/components/store/CheckoutForm";
import { Loader2 } from "lucide-react";

// Load Stripe outside of component render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
    const [slug, setSlug] = useState<string>("");

    useEffect(() => {
        params.then((p) => setSlug(p.slug));
    }, [params]);

    const { sessionId } = useCartStore();
    const createPaymentIntent = useAction(api.stripe.createPaymentIntent);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (sessionId && !clientSecret) {
            createPaymentIntent({ sessionId })
                .then((res) => {
                    setClientSecret(res.clientSecret);
                })
                .catch((err) => {
                    console.error(err);
                    setError("Failed to initialize checkout. Your cart might be empty.");
                });
        }
    }, [sessionId, createPaymentIntent, clientSecret]);

    if (error) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Checkout Error</h1>
                <p className="text-gray-500 mb-6">{error}</p>
                <a href={`/store/${slug}/products`} className="text-blue-600 hover:underline">Return to Shop</a>
            </div>
        );
    }

    if (!clientSecret || !slug) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm clientSecret={clientSecret} orgSlug={slug} />
            </Elements>
        </div>
    );
}
