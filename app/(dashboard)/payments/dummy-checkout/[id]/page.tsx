"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, XCircle, CreditCard, ShieldCheck } from "lucide-react";

type MockPayment = {
  id: string;
  amount: number;
  status: string;
  projectName: string;
};

export default function DummyCheckoutPage() {
  const { id } = useParams();
  const router = useRouter();
  const [payment, setPayment] = useState<MockPayment | null>(null);
  const [updating, setUpdating] = useState(false);
  const [result, setResult] = useState<"SUCCESS" | "FAILED" | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const existing = JSON.parse(
        localStorage.getItem("mock_payments") || "[]",
      );
      const found = existing.find((p: MockPayment) => p.id === id);
      if (found) {
        setPayment(found);
      }
    }
  }, [id]);

  const updateStatus = (newStatus: "COMPLETED" | "FAILED") => {
    setUpdating(true);

    if (typeof window !== "undefined") {
      const existing = JSON.parse(
        localStorage.getItem("mock_payments") || "[]",
      );
      const updated = existing.map((p: MockPayment) =>
        p.id === id ? { ...p, status: newStatus } : p,
      );
      localStorage.setItem("mock_payments", JSON.stringify(updated));
    }

    setTimeout(() => {
      setUpdating(false);
      setResult(newStatus === "COMPLETED" ? "SUCCESS" : "FAILED");

      setTimeout(() => {
        router.push("/payments");
      }, 2000);
    }, 1500);
  };

  if (result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-12 space-y-6 animate-in fade-in zoom-in duration-500 shadow-2xl border-none">
          <div
            className={`mx-auto h-24 w-24 rounded-full flex items-center justify-center ${result === "SUCCESS" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}
          >
            {result === "SUCCESS" ? (
              <CheckCircle2 className="h-14 w-14" />
            ) : (
              <XCircle className="h-14 w-14" />
            )}
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">
              {result === "SUCCESS" ? "Payment Successful" : "Payment Failed"}
            </h2>
            <p className="text-muted-foreground text-lg">
              {result === "SUCCESS"
                ? "Thank you! Your payment has been processed."
                : "Something went wrong with the transaction."}
            </p>
          </div>
          <p className="text-sm text-muted-foreground animate-pulse pt-4">
            Redirecting you back to the dashboard...
          </p>
        </Card>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground font-medium">
            Loading secure payment gateway...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 space-y-8">
      {/* Branding / Header */}
      <div className="flex items-center gap-2 text-primary font-bold text-2xl mb-4">
        <ShieldCheck className="h-8 w-8" />
        <span>Secure Checkout</span>
      </div>

      <Card className="max-w-md w-full shadow-2xl border-none overflow-hidden ring-1 ring-gray-200 dark:ring-white/10">
        <div className="bg-primary p-1 h-2" /> {/* Top accent line */}
        <CardHeader className="bg-white dark:bg-slate-900 border-b pb-8">
          <div className="flex justify-between items-start mb-4">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              Order Summary
            </CardTitle>
            <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded">
              TEST MODE
            </span>
          </div>
          <CardDescription className="text-base">
            Payment for{" "}
            <span className="font-semibold text-foreground">
              {payment.projectName}
            </span>
          </CardDescription>
          <div className="mt-6">
            <div className="text-4xl font-extrabold text-foreground">
              ${payment.amount.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">
              Reference: {payment.id}
            </div>
          </div>
        </CardHeader>
        <CardContent className="bg-white dark:bg-slate-900 p-8 space-y-8">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-widest">
              Simulation Controls
            </h3>
            <div className="grid gap-4">
              <Button
                onClick={() => updateStatus("COMPLETED")}
                disabled={updating}
                className="h-14 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 dark:shadow-none"
              >
                {updating ? "Processing..." : "Complete Payment (Success)"}
              </Button>
              <Button
                variant="outline"
                onClick={() => updateStatus("FAILED")}
                disabled={updating}
                className="h-14 text-lg font-bold border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all"
              >
                {updating ? "Rejecting..." : "Simulate Failure"}
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium">
            <ShieldCheck className="h-4 w-4" />
            256-bit SSL Secure Transaction
          </div>
        </CardContent>
      </Card>

      <footer className="text-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} AdminDashboard Demo Gateway. No real
          money will be charged.
        </p>
      </footer>
    </div>
  );
}
