"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  currency?: string;
  clientSecret?: string;
  onConfirm: (payload: { method: "card" | "cash"; paymentIntentId?: string }) => Promise<void> | void;
}

function CardPaymentForm({ onSuccess, onError }: { onSuccess: (paymentIntentId: string) => void; onError: (e: Error) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.origin },
        redirect: "if_required",
      });

      if (error) {
        onError(new Error(error.message));
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onSuccess(paymentIntent.id);
      }
    } catch (e) {
      onError(e instanceof Error ? e : new Error("Payment failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button type="submit" disabled={!stripe || loading} className="w-full bg-[#00F9FF] text-[#0A0A0B] hover:bg-[#4CC9F4]">
        {loading ? "Processing..." : "Pay Now"}
      </Button>
    </form>
  );
}

export default function PaymentModal({ open, onOpenChange, amount, currency = "LKR", clientSecret, onConfirm }: PaymentModalProps) {
  const [method, setMethod] = useState<"card" | "cash">("cash");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (method === "card" && !clientSecret) {
      setMethod("cash");
    }
  }, [clientSecret, method]);

  const handlePay = async (paymentIntentId?: string) => {
    setLoading(true);
    try {
      await onConfirm({ method, paymentIntentId });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCardSuccess = (paymentIntentId: string) => {
    handlePay(paymentIntentId);
  };

  const handleCardError = (e: Error) => {
    alert("Payment failed: " + e.message);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Payment</DialogTitle>
          <DialogDescription>Select your preferred payment method</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">Total Amount</div>
            <div className="text-2xl font-bold">
              {currency} {amount.toLocaleString()}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold">Payment Method</Label>
            <RadioGroup value={method} onValueChange={(v) => setMethod(v as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="card" id="card" disabled={!clientSecret} />
                <Label htmlFor="card" className="cursor-pointer">Card (Stripe)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="cursor-pointer">Cash on Admission</Label>
              </div>
            </RadioGroup>
          </div>

          {method === "card" && clientSecret && (
            <div className="border rounded-lg p-4">
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CardPaymentForm onSuccess={handleCardSuccess} onError={handleCardError} />
              </Elements>
            </div>
          )}

          {method === "cash" && (
            <p className="text-sm text-gray-600">
              Cash will be collected when you hand over the vehicle at the service center.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          {method === "cash" && (
            <Button onClick={() => handlePay()} disabled={loading} className="bg-[#00F9FF] text-[#0A0A0B] hover:bg-[#4CC9F4]">
              {loading ? "Processing..." : "Confirm Cash"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
