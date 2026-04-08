"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Mail, Lock } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("res", res);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed");
        return;
      }

      login(data.accessToken, data.refreshToken, data.user);
      router.push("/dashboard");
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-none shadow-none bg-transparent p-5">
      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-semibold tracking-wide uppercase text-zinc-500"
            >
              Admin Email
            </Label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none group-focus-within:text-primary transition-colors z-10">
                <Mail className="h-5 w-5 text-zinc-400 group-focus-within:text-primary" />
              </div>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@ramesys.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-11 h-12 bg-white/70 border-zinc-200 shadow-sm hover:border-zinc-300 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all text-sm text-zinc-900 rounded-lg"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-sm font-semibold tracking-wide uppercase text-zinc-500"
              >
                Secure Password
              </Label>
              <a
                href="#"
                className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider"
              >
                Reset?
              </a>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none group-focus-within:text-primary transition-colors z-10">
                <Lock className="h-5 w-5 text-zinc-400 group-focus-within:text-primary" />
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-11 h-12 bg-white/70 border-zinc-200 shadow-sm hover:border-zinc-300 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all text-sm text-zinc-900 rounded-lg"
              />
            </div>
          </div>
          {error && (
            <div className="text-sm font-medium text-red-400 bg-red-400/10 px-4 py-3 rounded-xl border border-red-400/20 animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}
          <Button
            type="submit"
            className="w-full h-12 text-sm font-bold uppercase tracking-widest bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg shadow transition-all active:scale-[0.98]"
            disabled={isPending}
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Authenticating...</span>
              </div>
            ) : (
              "Access Dashboard"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
