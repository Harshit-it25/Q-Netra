# Q-NETRA AI — Privacy & Specific Payment Deletion Architecture

**Core Principle:** *"Your payment history belongs to you."*  
Q-NETRA provides granular, per-payment history management allowing users to permanently remove individual payment records and their associated analysis data without clearing their entire history.

---

## 1. Per-Payment Deletion Workflow

```
[ Payment History Item ]
          ↓ (Tap ⋮ Overflow Menu)
[ View Analysis | View Trust Chain | View Network | Delete Payment ]
          ↓ (Select "Delete Payment")
[ Confirmation Dialog: "Delete this payment?" ]
   • Removes local analysis history & RiskGraph state
   • Note: Does not reverse or cancel bank transaction
          ↓
[ Confirm DELETE ]
          ↓
[ Record permanently removed from local storage ]
[ Toast notification: "Payment to <recipient> deleted from Q-NETRA history." ]
[ If active item was deleted → Active context cleared & returns to Home ]
```

---

## 2. Stable Unique ID & Data Purge Scope

Deletion operates strictly on the unique `id` (e.g. `chk-golden-c`, `chk-1725118400000`). When a payment is deleted, all associated local analysis data is permanently purged:

| Component | Purged Upon Deletion |
| :--- | :--- |
| **Transaction Info** | Recipient identifier, amount, timestamp, note |
| **On-Device Context AI** | Threat indicators, confidence score, execution latency |
| **Story Correlation** | Mismatch classification, comparison pillars, explanation |
| **Trust Chain** | 5-stage validation steps and underlying evidence |
| **Investigation State** | Multi-hop graph lookup cache and forensic notes |

---

## 3. Clear Legal & Banking Distinction

The user interface explicitly reinforces that:
> **"Deleting a payment from Q-NETRA history removes local risk analysis records. It does not reverse, cancel, or refund a bank transaction."**

Q-NETRA never presents history deletion as a "Cancel Transaction" or "Refund" action.

---

## 4. Cache Safety & Privacy Boundary

- **Local-First Storage:** Payment records are stored exclusively in client-side `localStorage`.
- **Zero Backend Leakage:** No delete telemetry or API requests are dispatched to remote servers.
- **Service Worker Cache Policy:** The service worker ignores `/api/*` and dynamic payment data, ensuring deleted records cannot be restored from browser HTTP cache.

---

## 5. 3 Golden Demo Cases Restoration

For hackathon judges and evaluators, deleting a golden demo case removes it from history just like any other payment. Users can instantly restore all 3 canonical scenarios at any time via:
- **Settings Screen:** *"Reset to 3 Golden Demo Cases"*
- **Empty State Button:** *"Restore 3 Demo Cases"*

Restores:
- **Case C:** `abc123@upi` (₹10, Electricity Scam → STOP)
- **Case B:** `priya.consulting@okhdfcbank` (₹4,500 → VERIFY)
- **Case A:** `swiggy@icici` (₹850 → PROCEED)

---

## 6. Voice Assistant Integration

The Voice Q&A Assistant respects strict privacy guidelines regarding deletion:
- **Voice Deletion Safety:** Saying *"Delete this payment"* will **never silently delete** data. Q-NETRA asks: *"I can delete this payment from your local history. Would you like me to proceed? You can confirm deletion using the delete button on the payment card."*
- **Privacy Explanation:** Saying *"What happens when I delete a payment?"* explains: *"Deleting a payment removes its local history and associated analysis data from Q-NETRA. It does not reverse or cancel a bank transaction."*
