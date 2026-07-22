import React, { useState } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, X, Zap } from 'lucide-react';

export default function RazorpayModal({ isOpen, onClose, onPaymentSuccess }) {
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSimulatedPayment = async () => {
    setProcessing(true);
    // Simulate Razorpay popup processing delay
    setTimeout(() => {
      onPaymentSuccess({
        paymentId: `pay_${Math.random().toString(36).substring(2, 10)}`,
        subscriptionId: `sub_${Math.random().toString(36).substring(2, 10)}`
      });
      setProcessing(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-card rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 relative border border-apple-accent/40 animate-in fade-in zoom-in duration-200">
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-apple-textMuted hover:text-white hover:bg-apple-card transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Razorpay Badge */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-apple-accent/20 text-apple-accent flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-outfit text-white">Razorpay Secure Checkout</h3>
            <p className="text-xs text-apple-textMuted">Official ₹999/month Monthly Subscription</p>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-apple-dark/60 p-5 rounded-2xl border border-apple-border space-y-3 text-sm">
          <div className="flex justify-between items-center pb-3 border-b border-apple-border">
            <span className="text-apple-textMuted">Plan</span>
            <span className="font-semibold text-white">Apple Track Pro Monthly</span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-apple-border">
            <span className="text-apple-textMuted">Monitored Stores</span>
            <span className="text-xs font-semibold text-emerald-400">Saket Delhi & Noida</span>
          </div>

          <div className="flex justify-between items-center text-lg font-bold">
            <span className="text-white">Total Billed</span>
            <span className="text-apple-accent">₹999 INR / mo</span>
          </div>
        </div>

        {/* Features included */}
        <ul className="space-y-2 text-xs text-apple-textMuted">
          <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> <span>30s High-frequency restock checks</span></li>
          <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> <span>Instant Telegram push notifications</span></li>
          <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> <span>Cancel anytime with 1-click in dashboard</span></li>
        </ul>

        {/* Pay Button */}
        <button
          onClick={handleSimulatedPayment}
          disabled={processing}
          className="w-full py-4 rounded-xl bg-apple-accent hover:bg-apple-accentHover text-white font-semibold text-base shadow-xl shadow-apple-accent/30 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <Zap className="w-4 h-4" />
          <span>{processing ? 'Processing Razorpay Checkout...' : 'Pay ₹999 via Razorpay UPI / Cards'}</span>
        </button>

        <p className="text-[11px] text-center text-apple-textMuted flex items-center justify-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>256-bit SSL Encrypted • Powered by Razorpay India</span>
        </p>

      </div>
    </div>
  );
}
