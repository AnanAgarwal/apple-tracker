import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, ExternalLink, HelpCircle, X } from 'lucide-react';

export default function TelegramSetupModal({ isOpen, onClose, telegramChatId, onSaveChatId, onSendTestMsg, testing }) {
  const [chatIdInput, setChatIdInput] = useState(telegramChatId || '');
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    await onSaveChatId(chatIdInput);
  };

  const handleTest = async () => {
    setTestResult(null);
    const res = await onSendTestMsg();
    setTestResult(res);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-card rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative border border-apple-border animate-in fade-in zoom-in duration-200">
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-apple-textMuted hover:text-white hover:bg-apple-card transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-outfit text-white">Connect Telegram Bot Alerts</h3>
            <p className="text-xs text-apple-textMuted">Receive instant alerts when iPhone 17 restocks</p>
          </div>
        </div>

        {/* INSTRUCTIONS */}
        <div className="space-y-3 bg-apple-dark/60 p-4 rounded-2xl border border-apple-border text-xs text-apple-textMuted">
          <div className="font-semibold text-white flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-apple-accent" />
            <span>How to get your Telegram Chat ID:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
            <li>Open Telegram and search for <strong className="text-blue-400">@userinfobot</strong> or <strong className="text-blue-400">@raw_data_bot</strong>.</li>
            <li>Press <strong>Start</strong> or send any text message.</li>
            <li>The bot will reply with your numerical <strong>Id</strong> (e.g. <code className="text-emerald-400">123456789</code> or group <code className="text-emerald-400">-5015233395</code>).</li>
            <li>Copy and paste it into the input field below.</li>
          </ol>
        </div>

        {/* INPUT FIELD */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-white">Your Telegram Chat ID</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={chatIdInput}
              onChange={(e) => setChatIdInput(e.target.value)}
              placeholder="e.g. 123456789 or -5015233395"
              className="flex-1 px-4 py-3 rounded-xl bg-apple-card border border-apple-border text-white text-sm focus:outline-none focus:border-apple-accent transition-colors font-mono"
            />
            <button
              onClick={handleSave}
              className="px-5 py-3 rounded-xl bg-apple-accent hover:bg-apple-accentHover text-white font-medium text-sm transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        {/* TEST BUTTON */}
        <div className="pt-2 border-t border-apple-border/50 flex items-center justify-between">
          <div className="text-xs text-apple-textMuted">Verify your connection right now:</div>
          <button
            onClick={handleTest}
            disabled={testing || !chatIdInput}
            className="px-4 py-2.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-medium text-xs border border-blue-500/30 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{testing ? 'Dispatching...' : 'Send Test Alert'}</span>
          </button>
        </div>

        {/* TEST RESULT ALERTS */}
        {testResult && (
          <div className={`p-4 rounded-xl text-xs flex items-start space-x-2.5 border ${
            testResult.success 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
            <div>
              <p className="font-semibold">{testResult.success ? 'Telegram Alert Sent Successfully!' : 'Dispatch Failed'}</p>
              <p className="mt-0.5 opacity-90">{testResult.message || testResult.error}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
