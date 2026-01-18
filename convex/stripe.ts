"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import Stripe from "stripe";

// Initialize Stripe
// NOTE: Ensure STRIPE_SECRET_KEY is set in Convex Dashboard Environment Variables
// We provide a fallback "dummy" key to prevent build-time errors if the env var is missing,
// but we validate it exists at runtime in the action.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy_key_for_build", {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiVersion: "2024-12-18.acacia" as any, // Use type assertion to avoid version mismatch errors
    typescript: true,
});

export const createPaymentIntent = action({
    args: {
        sessionId: v.string(),
    },
    handler: async (ctx, args): Promise<{ clientSecret: string; amount: number }> => {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error("Stripe API key not configured");
        }

        // 1. Get cart details securely from internal query
        const cart = await ctx.runQuery(internal.public.cart.getInternal, {
            sessionId: args.sessionId
        });

        if (!cart || cart.items.length === 0) {
            throw new Error("Cart is empty");
        }

        // 2. Create PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: cart.totalAmount, // Already in cents
            currency: "usd",
            metadata: {
                cartId: cart._id,
                sessionId: cart.sessionId,
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        if (!paymentIntent.client_secret) {
            throw new Error("Failed to create Client Secret");
        }

        return {
            clientSecret: paymentIntent.client_secret,
            amount: cart.totalAmount,
        };
    },
});
