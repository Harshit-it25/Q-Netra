import React, { useState } from 'react';
import { PaymentCheck, ScreenType } from '../types';

interface HomeScreenProps {
  recentChecks: PaymentCheck[];
  onSelectCheck: (check: PaymentCheck) => void;
  onNavigate: (screen: ScreenType) => void;
  onOpenScanner: () => void;
  onOpenCheckMessage: () => void;
  onOpenEnterPayment: () => void;
  onOpenAskAi: () => void;
  onDeletePayment: (id: string) => void;
  onResetDemo?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  recentChecks,
  onSelectCheck,
  onNavigate,
  onOpenScanner,
  onOpenCheckMessage,
  onOpenEnterPayment,
  onOpenAskAi,
  onDeletePayment,
  onResetDemo
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<PaymentCheck | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleConfirmDelete = () => {
    if (!paymentToDelete) return;
    const recipient = paymentToDelete.recipient;
    onDeletePayment(paymentToDelete.id);
    setPaymentToDelete(null);
    setActiveMenuId(null);
    showToast(`Payment to ${recipient} deleted from Q-NETRA history.`);
  };

  return (
    <main className="px-4 pt-6 pb-[calc(7rem+env(safe-area-inset-bottom,0px))] flex flex-col gap-6 max-w-2xl mx-auto w-full relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1A1A1A] border border-[#abd600]/40 text-[#e5e2e1] px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-mono-data">
          <span className="material-symbols-outlined text-[#abd600] text-[18px]">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="flex flex-col gap-2 text-center items-center mt-2">
        <div className="inline-flex items-center gap-1.5 bg-[#1C1C1C] border border-[#333333] px-3 py-1 rounded-full">
          <span className="text-[11px] font-bold text-[#abd600] uppercase tracking-wider font-mono-data">
            STORY → PERSON → TRAIL → DECISION
          </span>
        </div>
        <h2 className="text-[34px] sm:text-[42px] font-bold text-[#e5e2e1] leading-[1.15] tracking-tight font-['Inter']">
          Before you pay, know the trail.
        </h2>
        <p className="text-[14px] sm:text-[15px] text-[#c4c9ac] max-w-md mt-0.5 leading-relaxed">
          Q-NETRA checks if the story behind the payment matches the person and the network receiving the money.
        </p>
      </section>

      {/* Primary Action Button */}
      <section className="flex justify-center mt-3">
        <button
          id="btn-scan-qr-hero"
          onClick={onOpenScanner}
          className="bg-[#CCFF00] text-[#0A0A0A] font-bold text-[18px] sm:text-[19px] rounded-lg uppercase px-8 py-4 flex items-center gap-3 active:scale-95 transition-all duration-150 shadow-[0_0_20px_rgba(204,255,0,0.35)] hover:shadow-[0_0_30px_rgba(204,255,0,0.6)] cursor-pointer hover:bg-[#d8ff33]"
        >
          <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>
            qr_code_scanner
          </span>
          <span>SCAN QR</span>
        </button>
      </section>

      {/* Secondary Actions Bento */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <button
          id="btn-check-message"
          onClick={onOpenCheckMessage}
          className="bg-[#1A1A1A] border border-[#333333] rounded-xl p-4 flex items-center gap-4 hover:bg-[#242424] hover:border-[#abd600]/40 transition-all text-left group cursor-pointer"
        >
          <div className="bg-[#242424] p-3 rounded-lg group-hover:bg-[#333333] transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined text-[#e5e2e1] text-[24px]">chat</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[17px] font-semibold text-[#e5e2e1]">Check a message</span>
            <span className="text-[13px] text-[#c4c9ac]">Analyze SMS or links</span>
          </div>
        </button>

        <button
          id="btn-enter-payment-details"
          onClick={onOpenEnterPayment}
          className="bg-[#1A1A1A] border border-[#333333] rounded-xl p-4 flex items-center gap-4 hover:bg-[#242424] hover:border-[#abd600]/40 transition-all text-left group cursor-pointer"
        >
          <div className="bg-[#242424] p-3 rounded-lg group-hover:bg-[#333333] transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined text-[#e5e2e1] text-[24px]">account_balance_wallet</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[17px] font-semibold text-[#e5e2e1]">Enter payment details</span>
            <span className="text-[13px] text-[#c4c9ac]">VPA or Account No.</span>
          </div>
        </button>
      </section>

      {/* Ask Q-NETRA Link */}
      <div className="flex justify-center mt-0.5">
        <button
          id="btn-ask-qnetra-link"
          onClick={onOpenAskAi}
          className="text-[14px] text-[#c4c9ac] underline hover:text-[#abd600] transition-colors cursor-pointer py-1 px-3 flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">psychology</span>
          <span>Ask Q-NETRA Voice Assistant</span>
        </button>
      </div>

      {/* Recent Checks / Payment History */}
      <section className="flex flex-col gap-3 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-[18px] sm:text-[20px] font-semibold text-[#e5e2e1]">Payment History</h3>
            <span className="text-[11px] bg-[#222] text-[#c4c9ac] border border-[#333] px-2 py-0.5 rounded-full font-mono-data">
              Local Only
            </span>
          </div>
          <span className="text-xs text-[#c4c9ac]/80 font-mono-data">
            {recentChecks.length} {recentChecks.length === 1 ? 'Record' : 'Records'}
          </span>
        </div>

        {recentChecks.length === 0 ? (
          /* Empty State */
          <div className="bg-[#171717] border border-[#2d2d2d] rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#242424] border border-[#333] flex items-center justify-center text-[#c4c9ac]">
              <span className="material-symbols-outlined text-[28px]">history</span>
            </div>
            <h4 className="text-[17px] font-bold text-[#e5e2e1] font-['Inter']">
              No payment history
            </h4>
            <p className="text-[13px] text-[#c4c9ac] max-w-xs">
              Payments and QR codes you analyze will appear here.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={onOpenScanner}
                className="bg-[#abd600] text-[#0A0A0A] font-bold text-xs px-4 py-2.5 rounded-lg uppercase transition-colors cursor-pointer hover:bg-[#b8e600]"
              >
                Scan a Payment
              </button>
              {onResetDemo && (
                <button
                  onClick={onResetDemo}
                  className="bg-[#242424] hover:bg-[#303030] text-[#e5e2e1] border border-[#3a3a3a] font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Restore 3 Demo Cases
                </button>
              )}
            </div>
          </div>
        ) : (
          /* History List */
          <div className="flex flex-col bg-[#1A1A1A] rounded-xl border border-[#333333] overflow-hidden divide-y divide-[#333333]">
            {recentChecks.map((item) => {
              const isSafe = item.riskLevel === 'SAFE';
              const isHighRisk = item.riskLevel === 'HIGH RISK';
              const isMenuOpen = activeMenuId === item.id;

              return (
                <div
                  key={item.id}
                  id={`recent-check-${item.id}`}
                  className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-[#222] transition-colors relative"
                >
                  {/* Item Content (Clicking opens Analysis) */}
                  <div
                    onClick={() => {
                      setActiveMenuId(null);
                      onSelectCheck(item);
                    }}
                    className="flex items-center gap-3 cursor-pointer flex-grow min-w-0"
                  >
                    <div
                      className={`p-2 rounded-lg flex items-center justify-center shrink-0 ${
                        isSafe
                          ? 'bg-[rgba(171,214,0,0.15)] text-[#abd600]'
                          : isHighRisk
                          ? 'bg-[rgba(255,180,171,0.15)] text-[#ffb4ab]'
                          : 'bg-amber-500/15 text-amber-400'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isSafe ? 'check_circle' : isHighRisk ? 'block' : 'gpp_maybe'}
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono-data text-[14px] sm:text-[15px] font-medium text-[#e5e2e1] truncate">
                          {item.recipient}
                        </span>
                        {item.amount > 0 && (
                          <span className="text-xs text-[#c4c9ac] font-mono-data shrink-0">
                            (₹{item.amount.toLocaleString()})
                          </span>
                        )}
                      </div>
                      <span className="text-[12px] text-[#c4c9ac] truncate">
                        {item.note || item.date}
                      </span>
                    </div>
                  </div>

                  {/* Right Status Badge & Overflow Menu Button */}
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span
                      onClick={() => onSelectCheck(item)}
                      className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono-data cursor-pointer ${
                        isSafe
                          ? 'bg-[rgba(171,214,0,0.15)] text-[#abd600]'
                          : isHighRisk
                          ? 'bg-[rgba(255,180,171,0.15)] text-[#ffb4ab] ring-1 ring-[#ffb4ab]/30'
                          : 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30'
                      }`}
                    >
                      {item.riskLevel === 'HIGH RISK' ? 'STOP' : item.riskLevel === 'MODERATE' ? 'VERIFY' : 'PROCEED'}
                    </span>

                    {/* 3-Dot Overflow Action Menu Trigger (min 48px touch target) */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(isMenuOpen ? null : item.id);
                        }}
                        title="Payment options"
                        className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg hover:bg-[#333] text-[#c4c9ac] hover:text-white transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          more_vert
                        </span>
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-11 z-40 bg-[#1E1E1E] border border-[#3a3a3a] rounded-xl shadow-2xl py-1 w-48 flex flex-col text-xs font-mono-data overflow-hidden"
                        >
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              onSelectCheck(item);
                            }}
                            className="px-3.5 py-2.5 text-left text-[#e5e2e1] hover:bg-[#2c2c2c] flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px] text-[#abd600]">
                              visibility
                            </span>
                            <span>View Analysis</span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              onSelectCheck(item);
                              onNavigate('trust-chain');
                            }}
                            className="px-3.5 py-2.5 text-left text-[#e5e2e1] hover:bg-[#2c2c2c] flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px] text-[#abd600]">
                              linear_scale
                            </span>
                            <span>View Trust Chain</span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              onSelectCheck(item);
                              onNavigate('network');
                            }}
                            className="px-3.5 py-2.5 text-left text-[#e5e2e1] hover:bg-[#2c2c2c] flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px] text-[#abd600]">
                              account_tree
                            </span>
                            <span>View Network</span>
                          </button>

                          <div className="h-px bg-[#333] my-0.5" />

                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              setPaymentToDelete(item);
                            }}
                            className="px-3.5 py-2.5 text-left text-[#ffb4ab] hover:bg-[#3d1317] flex items-center gap-2 transition-colors cursor-pointer font-bold"
                          >
                            <span className="material-symbols-outlined text-[16px] text-[#ffb4ab]">
                              delete
                            </span>
                            <span>Delete Payment</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Delete Confirmation Modal (Accessibility & Destructive Confirmation) */}
      {paymentToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-[#161616] border border-[#ffb4ab]/40 rounded-2xl max-w-sm w-full p-5 flex flex-col gap-3.5 shadow-[0_0_30px_rgba(147,0,10,0.3)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ffb4ab]/15 border border-[#ffb4ab]/30 flex items-center justify-center text-[#ffb4ab] shrink-0">
                <span className="material-symbols-outlined text-[24px]">delete_forever</span>
              </div>
              <div>
                <h4 id="delete-dialog-title" className="text-[17px] font-bold text-[#e5e2e1] font-['Inter']">
                  Delete this payment?
                </h4>
                <span className="text-xs text-[#ffb4ab] font-mono-data">
                  {paymentToDelete.recipient} (₹{paymentToDelete.amount})
                </span>
              </div>
            </div>

            <div className="bg-[#1F1214] border border-[#ffb4ab]/20 rounded-xl p-3 text-xs text-[#c4c9ac] leading-relaxed">
              <p className="mb-1.5 text-[#e5e2e1]">
                This removes this payment and its local analysis history from Q-NETRA.
              </p>
              <p className="text-[11px] text-[#999]">
                <strong className="text-[#ffb4ab]">Note:</strong> This cannot be undone. Deleting history from Q-NETRA does not reverse or cancel a bank transaction.
              </p>
            </div>

            <div className="flex items-center gap-2.5 mt-1">
              <button
                type="button"
                onClick={() => setPaymentToDelete(null)}
                className="flex-1 min-h-[48px] bg-[#262626] hover:bg-[#333] text-[#e5e2e1] font-semibold text-xs rounded-xl transition-colors cursor-pointer border border-[#3a3a3a]"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 min-h-[48px] bg-[#93000a] hover:bg-[#b3141f] text-[#ffb4ab] font-bold text-xs rounded-xl transition-colors cursor-pointer border border-[#ffb4ab]/40 flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>DELETE</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
