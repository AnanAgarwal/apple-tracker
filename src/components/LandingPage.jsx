import React, { useState } from 'react';
import { Smartphone, Zap, Bell, ShieldCheck, MapPin, ArrowRight, CheckCircle2, RefreshCw, HelpCircle, Star, Sparkles } from 'lucide-react';

export default function LandingPage({ onGetStarted, onLiveStatusClick }) {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "How fast are the Telegram notifications sent?",
      a: "Notifications are dispatched within 2-5 seconds of stock detection. Our tracker engine polls Apple's fulfillment API every 30-60 seconds 24/7."
    },
    {
      q: "Which Apple Stores in India are currently monitored?",
      a: "We actively monitor Apple Saket (Select CITYWALK, New Delhi) and Apple BKC (Mumbai), alongside upcoming Apple Noida locations."
    },
    {
      q: "Will I get spammed with repeated messages?",
      a: "No! Our state-machine algorithm only triggers a notification when stock status changes from Unavailable to Available. You get 1 instant alert per restock event."
    },
    {
      q: "How does the ₹999/month subscription work?",
      a: "Billing is managed via Razorpay. You get unlimited instant Telegram alerts, choice of iPhone 17 models & colors, and store preferences. Cancel anytime in 1 click."
    },
    {
      q: "How do I set up my Telegram Chat ID?",
      a: "It takes under 30 seconds! In your dashboard, click 'Connect Telegram', send a message to `@userinfobot` or our system bot to copy your Chat ID, and paste it into the dashboard."
    }
  ];

  return (
    <div className="space-y-24 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 lg:pt-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-apple-accent/20 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-panel border border-apple-accent/30 text-xs font-semibold text-apple-accent tracking-wide uppercase shadow-lg shadow-apple-accent/10 animate-pulse-subtle">
            <Sparkles className="w-3.5 h-3.5" />
            <span>iPhone 17 Pickup Alerts Live for Saket & Noida</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-outfit leading-[1.1]">
            Never miss an <span className="blue-gradient-text">Apple Store pickup</span> again.
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-apple-textMuted font-light leading-relaxed">
            Get instant <strong className="text-white font-medium">Telegram notifications</strong> the second iPhone 17 256GB restocks at Apple Saket Delhi & Noida. Built for high-demand restock hunters in India.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-apple-accent hover:bg-apple-accentHover text-white font-semibold text-lg shadow-xl shadow-apple-accent/30 transition-all hover:scale-105 flex items-center justify-center space-x-3"
            >
              <span>Start Tracking for ₹999/mo</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={onLiveStatusClick}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl glass-panel hover:bg-apple-card text-white font-medium text-lg border border-apple-border transition-all flex items-center justify-center space-x-2"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>View Public Stock Board</span>
            </button>
          </div>

          {/* Guarantee Pill */}
          <div className="flex items-center justify-center space-x-6 text-xs text-apple-textMuted pt-4">
            <span className="flex items-center space-x-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> <span>Zero Spam Guarantee</span></span>
            <span className="flex items-center space-x-1.5"><Zap className="w-4 h-4 text-amber-400" /> <span>30s Polling Speed</span></span>
            <span className="flex items-center space-x-1.5"><CheckCircle2 className="w-4 h-4 text-blue-400" /> <span>Razorpay Secure</span></span>
          </div>

        </div>
      </section>

      {/* LIVE DEMO PREVIEW CARD */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-apple-border relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-apple-border/60 pb-5 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 pulse-emerald" />
              <span className="font-semibold text-white tracking-tight text-lg">Real-Time Monitor Preview</span>
            </div>
            <span className="text-xs font-mono text-apple-textMuted">Interval: 30s • Store: Saket (R756)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Model Card 1 */}
            <div className="p-4 rounded-2xl bg-apple-dark/60 border border-emerald-500/30 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">AVAILABLE</span>
                  <span className="text-xs text-apple-textMuted">Saket</span>
                </div>
                <h4 className="font-semibold text-white">iPhone 17 256GB White</h4>
                <p className="text-xs text-apple-textMuted">Pickup Today</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-emerald-400">Restocked 2m ago</span>
              </div>
            </div>

            {/* Model Card 2 */}
            <div className="p-4 rounded-2xl bg-apple-dark/60 border border-apple-border flex items-center justify-between opacity-80">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold uppercase text-apple-textMuted bg-apple-card px-2 py-0.5 rounded">UNAVAILABLE</span>
                  <span className="text-xs text-apple-textMuted">Saket</span>
                </div>
                <h4 className="font-semibold text-white">iPhone 17 256GB Black</h4>
                <p className="text-xs text-apple-textMuted">Out of Stock</p>
              </div>
            </div>

            {/* Model Card 3 */}
            <div className="p-4 rounded-2xl bg-apple-dark/60 border border-emerald-500/30 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">AVAILABLE</span>
                  <span className="text-xs text-apple-textMuted">Noida</span>
                </div>
                <h4 className="font-semibold text-white">iPhone 17 256GB Sage</h4>
                <p className="text-xs text-apple-textMuted">Pickup Tomorrow</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-emerald-400">Restocked 8m ago</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold font-outfit">How Apple Track Works</h2>
          <p className="text-apple-textMuted max-w-xl mx-auto">Get setup in 3 minutes and receive instant Telegram alerts before stock sells out.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="glass-card rounded-3xl p-8 space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-apple-accent/20 text-apple-accent flex items-center justify-center font-bold text-xl">1</div>
            <h3 className="text-xl font-semibold text-white">Choose Devices & Stores</h3>
            <p className="text-sm text-apple-textMuted leading-relaxed">
              Select iPhone 17 (256GB) colors and monitor Apple Saket Delhi and/or Apple Noida.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-8 space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xl">2</div>
            <h3 className="text-xl font-semibold text-white">Link Your Telegram Chat ID</h3>
            <p className="text-sm text-apple-textMuted leading-relaxed">
              Paste your Telegram Chat ID in your dashboard. Test alerts with one click to verify connection.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-8 space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl">3</div>
            <h3 className="text-xl font-semibold text-white">Instant Restock Alert!</h3>
            <p className="text-sm text-apple-textMuted leading-relaxed">
              The moment stock turns available, receive a Telegram push alert with a direct reservation link.
            </p>
          </div>

        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-apple-accent/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-apple-accent text-white font-semibold text-xs uppercase px-4 py-1.5 rounded-bl-2xl">
            Pro Plan
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase text-apple-accent tracking-wider">Simple Transparent Pricing</span>
                <h3 className="text-3xl font-bold font-outfit text-white mt-1">₹999 / month</h3>
                <p className="text-sm text-apple-textMuted mt-2">Unlimited Telegram Alerts • Cancel Anytime</p>
              </div>

              <ul className="space-y-3 text-sm text-apple-textMuted">
                <li className="flex items-center space-x-3"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> <span className="text-white">Apple Saket (Delhi) & Noida Monitoring</span></li>
                <li className="flex items-center space-x-3"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> <span className="text-white">iPhone 17 256GB (White, Black, Blue, Sage, Lavender)</span></li>
                <li className="flex items-center space-x-3"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> <span className="text-white">30-second high frequency checking speed</span></li>
                <li className="flex items-center space-x-3"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> <span className="text-white">State-change no-spam alert algorithm</span></li>
                <li className="flex items-center space-x-3"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> <span className="text-white">Direct Apple Store Buy Reservation Link</span></li>
              </ul>
            </div>

            <div className="space-y-4 text-center glass-panel p-6 rounded-2xl border border-apple-border">
              <div className="text-4xl font-extrabold text-white">₹999 <span className="text-sm font-normal text-apple-textMuted">/mo</span></div>
              <p className="text-xs text-apple-textMuted">Powered by Razorpay Subscription API</p>
              
              <button
                onClick={onGetStarted}
                className="w-full py-4 rounded-xl bg-apple-accent hover:bg-apple-accentHover text-white font-semibold shadow-lg shadow-apple-accent/30 transition-all hover:scale-[1.02]"
              >
                Subscribe Now for ₹999
              </button>

              <p className="text-[11px] text-apple-textMuted">Includes Tax & Instant Activation</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ ACCORDION */}
      <section className="max-w-3xl mx-auto px-4">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl font-bold font-outfit">Frequently Asked Questions</h2>
          <p className="text-apple-textMuted">Everything you need to know about Apple Store pickup tracking in India.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="glass-card rounded-2xl p-6 cursor-pointer border border-apple-border transition-all"
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <div className="flex items-center justify-between font-semibold text-white">
                <span>{faq.q}</span>
                <span className="text-apple-accent text-xl">{openFaq === idx ? '−' : '+'}</span>
              </div>
              {openFaq === idx && (
                <p className="text-sm text-apple-textMuted pt-4 border-t border-apple-border/50 mt-4 leading-relaxed">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-apple-border/50 pt-12 text-center text-xs text-apple-textMuted space-y-3">
        <p>© 2026 Apple Store Pickup Tracker SaaS India. All rights reserved.</p>
        <p className="max-w-md mx-auto">Not affiliated with or endorsed by Apple Inc. Apple, iPhone, and Apple Store are registered trademarks of Apple Inc.</p>
      </footer>

    </div>
  );
}
