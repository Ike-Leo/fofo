"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Building2 } from "lucide-react";

export default function SignIn() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <div className="flex flex-col gap-8 w-full max-w-sm mx-auto h-screen justify-center items-center px-4 bg-background">
      <div className="text-center flex flex-col items-center gap-6">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
          <Building2 size={32} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Control Platform
          </h1>
          <p className="text-muted-foreground text-sm">
            Sign in to access your universal commerce dashboard and manage your organization.
          </p>
        </div>
      </div>

      <form
        className="flex flex-col gap-4 w-full bg-card p-8 rounded-2xl shadow-xl border border-border"
        onSubmit={(e) => {
          e.preventDefault();
          setLoading(true);
          setError(null);
          const formData = new FormData(e.target as HTMLFormElement);
          formData.set("flow", flow);
          void signIn("password", formData)
            .catch((error) => {
              setError(error.message);
              setLoading(false);
            })
            .then(() => {
              router.push("/");
            });
        }}
      >
        <div className="space-y-4">
          <input
            className="w-full bg-background text-foreground rounded-xl px-4 py-3 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground"
            type="email"
            name="email"
            placeholder="Email address"
            required
          />
          <div className="flex flex-col gap-1">
            <input
              className="w-full bg-background text-foreground rounded-xl px-4 py-3 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground"
              type="password"
              name="password"
              placeholder="Password"
              minLength={8}
              required
            />
            {flow === "signUp" && (
              <p className="text-xs text-muted-foreground px-1">
                Password must be at least 8 characters
              </p>
            )}
          </div>
        </div>

        <button
          className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl py-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={loading}
        >
          {loading ? "Please wait..." : flow === "signIn" ? "Sign In" : "Create Account"}
        </button>

        <div className="flex flex-row gap-2 text-sm justify-center mt-2">
          <span className="text-muted-foreground">
            {flow === "signIn"
              ? "New to the platform?"
              : "Already have an account?"}
          </span>
          <span
            className="text-primary hover:text-primary/80 font-medium cursor-pointer transition-colors"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Create account" : "Sign in"}
          </span>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-500 font-medium text-sm break-words text-center">
              {error}
            </p>
          </div>
        )}
      </form>

      <div className="text-xs text-muted-foreground text-center">
        &copy; {new Date().getFullYear()} Universal Commerce Control Platform
      </div>
    </div>
  );
}
