import React from 'react';
import { Smartphone, Bell, Shield, User, LogOut, LayoutDashboard, Radio } from 'lucide-react';

export default function Navbar({ user, currentView, setCurrentView, onLogout }) {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-apple-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div 
          onClick={() => setCurrentView('landing')} 
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-apple-accent to-blue-400 p-0.5 shadow-lg shadow-apple-accent/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-apple-dark rounded-[10px] flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-apple-accent" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-lg tracking-tight text-white font-outfit">Apple Track</span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-apple-accent/20 text-apple-accent border border-apple-accent/30">India</span>
            </div>
            <p className="text-[11px] text-apple-textMuted hidden sm:block">Instant Saket & Noida Restock Alerts</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          
          {/* Public Live Status */}
          <button
            onClick={() => setCurrentView('public-status')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'public-status' 
                ? 'bg-apple-border text-white' 
                : 'text-apple-textMuted hover:text-white hover:bg-apple-card'
            }`}
          >
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Live Stock Board</span>
          </button>

          {user ? (
            <>
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'dashboard' 
                    ? 'bg-apple-accent text-white shadow-lg shadow-apple-accent/25' 
                    : 'text-apple-textMuted hover:text-white hover:bg-apple-card'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              {user.role === 'admin' && (
                <button
                  onClick={() => setCurrentView('admin')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'admin' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-purple-400 hover:text-white hover:bg-purple-900/30'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin Panel</span>
                </button>
              )}

              <button
                onClick={onLogout}
                className="p-2 text-apple-textMuted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentView('auth-login')}
                className="text-sm font-medium text-apple-textMuted hover:text-white transition-colors px-3 py-1.5"
              >
                Log In
              </button>
              <button
                onClick={() => setCurrentView('auth-signup')}
                className="text-sm font-semibold px-4 py-2 rounded-xl bg-apple-accent hover:bg-apple-accentHover text-white shadow-lg shadow-apple-accent/30 transition-all hover:scale-105"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
