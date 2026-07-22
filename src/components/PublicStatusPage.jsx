import React, { useState, useEffect } from 'react';
import { Radio, MapPin, Smartphone, RefreshCw, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

import { safeJsonFetch } from '../utils/api.js';

export default function PublicStatusPage({ onGetStarted }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPublicStatus = async () => {
    try {
      setLoading(true);
      const { ok, data: json } = await safeJsonFetch('/api/public/status');
      if (ok && json) {
        setData(json);
      }
    } catch (e) {
      console.error('Failed to load public status:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicStatus();
    const timer = setInterval(fetchPublicStatus, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      
      {/* HEADER */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full glass-panel border border-emerald-500/30 text-xs font-semibold text-emerald-400">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Public Restock Availability Board • Live</span>
        </div>
        <h1 className="text-4xl font-extrabold font-outfit text-white">Apple Store Pickup Status (India)</h1>
        <p className="text-apple-textMuted max-w-xl mx-auto text-sm">
          Real-time in-store pickup status for iPhone 17 (256GB) models at Apple Saket Delhi & Noida. Updated every 30s.
        </p>
      </div>

      {/* CALL TO ACTION BANNER */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-apple-accent/40 bg-gradient-to-r from-apple-accent/20 via-apple-card to-apple-dark flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase text-apple-accent tracking-wider">Never Miss Restocks Again</div>
          <h3 className="text-2xl font-bold font-outfit text-white">Want instant Telegram push alerts when stock appears?</h3>
          <p className="text-xs text-apple-textMuted">Public board updates live, but instant 2-second Telegram alerts require a Pro subscription.</p>
        </div>

        <button
          onClick={onGetStarted}
          className="px-6 py-3.5 rounded-xl bg-apple-accent hover:bg-apple-accentHover text-white font-semibold text-sm shadow-lg shadow-apple-accent/30 transition-all hover:scale-105 shrink-0 flex items-center space-x-2"
        >
          <span>Get Telegram Alerts (₹999/mo)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* STORE AVAILABILITY CARDS */}
      {loading && !data ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3 text-apple-accent">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span>Fetching Live Apple Fulfillment Feeds...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {data?.stores.map(store => (
            <div key={store.id} className="glass-card rounded-3xl p-6 sm:p-8 border border-apple-border space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-apple-border pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-apple-accent" />
                    <h3 className="text-2xl font-bold font-outfit text-white">{store.name}</h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-apple-card border border-apple-border text-white">{store.id}</span>
                  </div>
                  <p className="text-xs text-apple-textMuted mt-1">{store.location}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${
                    store.availableCount > 0 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                      : 'bg-apple-card text-apple-textMuted border-apple-border'
                  }`}>
                    {store.availableCount > 0 ? `${store.availableCount} Models Available` : 'Out of Stock'}
                  </span>
                </div>
              </div>

              {/* DEVICES GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {store.devices.map(dev => (
                  <div 
                    key={dev.sku} 
                    className={`p-4 rounded-2xl border transition-all ${
                      dev.status === 'available'
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-apple-dark/60 border-apple-border opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">{dev.model} • {dev.storage}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        dev.status === 'available' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-apple-card text-apple-textMuted'
                      }`}>
                        {dev.status === 'available' ? 'AVAILABLE' : 'UNAVAILABLE'}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-apple-accent mt-2">{dev.color}</div>
                    <div className="text-[10px] font-mono text-apple-textMuted mt-1">SKU: {dev.sku}</div>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
