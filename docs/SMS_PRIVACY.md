# Q-NETRA AI — SMS Shield Privacy & Data Boundary

**Core Privacy Statement:**  
> **"Q-NETRA respects strict data minimization. SMS access is strictly opt-in and user-controlled. Analysis history can be cleared locally without touching original device SMS."**

---

## 1. Data Access & Boundary Matrix

| Data Element | Accessed by Default? | Accessed in SMS Shield? | Transmitted to Backend? |
| :--- | :--- | :--- | :--- |
| **SMS Inbox (Unpermitted)** | ❌ No | ❌ No | ❌ Never |
| **Permitted SMS Text** | ❌ No | ✓ Yes (Local Only) | ❌ Never (Analyzed on-device) |
| **Sender ID & Timestamp** | ❌ No | ✓ Yes (Local Only) | ❌ Never |
| **Contacts & Call Logs** | ❌ No | ❌ No | ❌ Never |
| **Camera Frames & Photos** | ❌ No | ❌ No | ❌ Never |
| **Payment UPI ID & Amount** | ✓ When Scanned | ✓ When Scanned | ✓ Transmitted for Graph Lookup |

---

## 2. History & Original Device Messages

- **Independent History:** Deleting an SMS analysis record from Q-NETRA only removes the cached local analysis.
- **Original Android SMS:** Q-NETRA has zero capability to alter, modify, or delete the user's original SMS messages in the native Android messaging app.
- **Permission Revocation:** Revoking SMS permissions from Android Settings or Q-NETRA Settings instantly reverts the app to **Private Mode**.
