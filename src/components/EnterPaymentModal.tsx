import React, { useState } from 'react';

interface EnterPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vpa: string, amount: number, note?: string) => void;
}

const COMMON_HANDLES = ['@okhdfcbank', '@okaxis', '@oksbi', '@ybl', '@paytm', '@ibl'];

export const EnterPaymentModal: React.FC<EnterPaymentModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('20000');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleAppendHandle = (handle: string) => {
    const parts = recipient.split('@');
    setRecipient(`${parts[0] || 'user'}${handle}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim()) return;
    onSubmit(recipient.trim(), Number(amount) || 1000, note.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#131313] border border-[#333333] rounded-2xl max-w-md w-full overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#333333] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#abd600] text-[22px]">
              account_balance_wallet
            </span>
            <h3 className="text-[18px] font-bold text-[#e5e2e1] font-['Inter']">
              Enter Payment Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#c4c9ac] hover:text-white p-1.5 rounded-full hover:bg-[#242424] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          {/* VPA / Account */}
          <div>
            <label className="text-xs font-bold text-[#c4c9ac] uppercase tracking-wider block mb-1.5">
              UPI ID (VPA) or Account / Phone:
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. abc123@upi or 9876543210@paytm"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#333333] focus:border-[#abd600] rounded-xl px-3.5 py-3 text-sm text-[#e5e2e1] placeholder-[#656464] focus:outline-none font-mono-data"
              />
              <span className="absolute right-3 top-3 material-symbols-outlined text-[#656464] text-[20px]">
                alternate_email
              </span>
            </div>

            {/* Quick Handle Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {COMMON_HANDLES.map((handle) => (
                <button
                  type="button"
                  key={handle}
                  onClick={() => handleAppendHandle(handle)}
                  className="text-[11px] bg-[#1A1A1A] hover:bg-[#242424] text-[#c4c9ac] hover:text-[#abd600] border border-[#333333] px-2 py-0.5 rounded transition-colors font-mono-data cursor-pointer"
                >
                  {handle}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-bold text-[#c4c9ac] uppercase tracking-wider block mb-1.5">
              Amount (₹):
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-[18px] text-[#abd600] font-bold">
                ₹
              </span>
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#333333] focus:border-[#abd600] rounded-xl pl-8 pr-3.5 py-2.5 text-[18px] font-bold text-[#abd600] placeholder-[#656464] focus:outline-none font-mono-data"
              />
            </div>
          </div>

          {/* Optional Note / Purpose */}
          <div>
            <label className="text-xs font-bold text-[#c4c9ac] uppercase tracking-wider block mb-1.5">
              Payment Note / Context (Optional):
            </label>
            <input
              type="text"
              placeholder="e.g. Refund processing fee, Booking deposit"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#333333] focus:border-[#abd600] rounded-xl px-3.5 py-2.5 text-xs text-[#e5e2e1] placeholder-[#656464] focus:outline-none"
            />
          </div>

          {/* Quick presets for test ease */}
          <div className="bg-[#1A1A1A] p-3 rounded-xl border border-[#333333] flex flex-col gap-1.5">
            <span className="text-[10px] text-[#c4c9ac] uppercase font-bold tracking-wider">
              Quick Test Cases (Phase 3 AI Validation):
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setRecipient('abc123@upi');
                  setAmount('20000');
                  setNote('Refund processing deposit - immediate release');
                }}
                className="text-xs text-[#ffb4ab] bg-[#93000a]/20 border border-[#ffb4ab]/30 px-2 py-1 rounded cursor-pointer hover:bg-[#93000a]/40"
              >
                Mule Network (₹20K)
              </button>
              <button
                type="button"
                onClick={() => {
                  setRecipient('disconnection.desk@upi');
                  setAmount('10');
                  setNote('Your electricity power will be disconnected tonight. Pay ₹10 immediately.');
                }}
                className="text-xs text-[#ffb4ab] bg-[#93000a]/20 border border-[#ffb4ab]/30 px-2 py-1 rounded cursor-pointer hover:bg-[#93000a]/40"
              >
                Electricity Urgency (₹10)
              </button>
              <button
                type="button"
                onClick={() => {
                  setRecipient('swiggy.merchant@icici');
                  setAmount('450');
                  setNote('Dinner delivery order #8849');
                }}
                className="text-xs text-[#abd600] bg-[rgba(171,214,0,0.15)] border border-[#abd600]/30 px-2 py-1 rounded cursor-pointer hover:bg-[rgba(171,214,0,0.25)]"
              >
                Safe Merchant
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="bg-[#CCFF00] hover:bg-[#d8ff33] text-[#0A0A0A] font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(204,255,0,0.3)] mt-2 uppercase tracking-wide text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">security</span>
            <span>Run Pre-Payment Check</span>
          </button>
        </form>
      </div>
    </div>
  );
};
