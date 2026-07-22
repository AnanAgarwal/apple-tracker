import React from 'react';
import { Smartphone, Store, Check, Shield } from 'lucide-react';

export default function DeviceStoreSelector({
  stores,
  devices,
  selectedStores,
  selectedSkus,
  onStoreToggle,
  onSkuToggle,
  onSavePreferences,
  saving
}) {
  return (
    <div className="space-y-8">
      
      {/* STORE SELECTION SECTION */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center space-x-3 border-b border-apple-border pb-4">
          <Store className="w-6 h-6 text-apple-accent" />
          <div>
            <h3 className="text-xl font-bold font-outfit text-white">Apple Store Locations</h3>
            <p className="text-xs text-apple-textMuted">Select stores to monitor for pickup availability</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stores.map(store => {
            const isSelected = selectedStores.includes(store.id);
            return (
              <div
                key={store.id}
                onClick={() => onStoreToggle(store.id)}
                className={`p-5 rounded-2xl cursor-pointer border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-apple-accent/15 border-apple-accent text-white shadow-lg shadow-apple-accent/10'
                    : 'bg-apple-dark/60 border-apple-border text-apple-textMuted hover:border-apple-border/80'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-apple-card border border-apple-border text-white">{store.id}</span>
                    <h4 className="font-semibold text-lg text-white mt-2">{store.name}</h4>
                    <p className="text-xs text-apple-textMuted mt-1">{store.location}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                    isSelected ? 'bg-apple-accent border-apple-accent text-white' : 'border-apple-border'
                  }`}>
                    {isSelected && <Check className="w-4 h-4" />}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-apple-border/50 text-[11px] flex items-center justify-between">
                  <span className="text-emerald-400">● Active Monitor</span>
                  <span className="text-apple-textMuted">{store.city}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DEVICE SELECTION SECTION */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-apple-border pb-4">
          <div className="flex items-center space-x-3">
            <Smartphone className="w-6 h-6 text-apple-accent" />
            <div>
              <h3 className="text-xl font-bold font-outfit text-white">iPhone 17 Models (256GB)</h3>
              <p className="text-xs text-apple-textMuted">Select color variants you want restock notifications for</p>
            </div>
          </div>
          <span className="text-xs text-apple-textMuted bg-apple-card px-3 py-1 rounded-full border border-apple-border">
            Extensible Pro/Pro Max Architecture
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map(device => {
            const isSelected = selectedSkus.includes(device.sku);
            return (
              <div
                key={device.sku}
                onClick={() => onSkuToggle(device.sku)}
                className={`p-5 rounded-2xl cursor-pointer border transition-all flex items-center space-x-4 ${
                  isSelected
                    ? 'bg-apple-accent/15 border-apple-accent text-white shadow-lg shadow-apple-accent/10'
                    : 'bg-apple-dark/60 border-apple-border text-apple-textMuted hover:border-apple-border/80'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-apple-card flex items-center justify-center p-1 border border-apple-border shrink-0">
                  <Smartphone className="w-7 h-7 text-apple-accent" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white truncate">{device.model} • {device.storage}</span>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      isSelected ? 'bg-apple-accent border-apple-accent text-white' : 'border-apple-border'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                  <p className="text-xs text-apple-accent font-medium mt-0.5">{device.color}</p>
                  <p className="text-[10px] font-mono text-apple-textMuted mt-1">SKU: {device.sku}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={onSavePreferences}
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-apple-accent hover:bg-apple-accentHover text-white font-medium text-sm shadow-lg shadow-apple-accent/25 transition-all hover:scale-105 disabled:opacity-50"
          >
            {saving ? 'Saving Preferences...' : 'Save Tracking Preferences'}
          </button>
        </div>
      </div>

    </div>
  );
}
