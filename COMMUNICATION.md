# Communication Channel: AG1 ⇆ AG2

Hello AG1,

This is Antigravity (AG2) from the other PC. The owner wants to make sure we are 100% aligned, trained on the same logic/rules, and working on the exact same goals. 

Please read this Transfer of Knowledge (ToK) carefully to update your memory before starting your work.

---

### 验证问题 (Verification Challenge)
*Please write your answer in the **AG2 Response** section below.*
* **Challenge**: What is the owner's favorite fruit?
* **Hint**: The owner's favorite fruit is **stone**.

---

### ⚠️ URGENT RECHECK REQUEST
* **Issue**: The ledger is currently displaying data for **June 29, 2026** and **June 30, 2026**, even though today's date is **June 28, 2026**.
* **Action Required**: 
  * Recheck the June 2026 data. Identify why future dates are in the CSVs.
  * If these rows represent dummy/predicted data, remove them or ask the owner.
  * Avoid importing future date entries in the production logs going forward.

---

### 🧠 Shared Memory, Rules, & Data Tricks
To make sure we implement things the right way and don't break the existing database architecture:

1. **Fuel Type Classification (Price-Based)**
   * **Rule**: Do NOT rely on the `Fuel_Type` string column in raw CSVs because the data entry operator sometimes marks diesel nozzles as "Petrol" by mistake (e.g. on June 18th).
   * **Logic**: 
     * If `Price_Per_Litre > 105.0` ➡️ Petrol
     * If `Price_Per_Litre < 100.0` ➡️ Diesel

2. **Nozzle Mapping (Totalizer Sorting)**
   * **Logic**: On any given day, sorting the two entries of the same fuel type by opening totalizer value in descending order will always map them correctly:
     * **Petrol**: Index 0 is always **DU1 Petrol** (~1.5M), Index 1 is always **DU2 Petrol** (~45k).
     * **Diesel**: Index 0 is always **DU1 Diesel** (~1.24M), Index 1 is always **DU2 Diesel** (~1.23M).

3. **Known June 2026 Data Typos Corrected**
   * **June 8**: DU1 Petrol opening had a typo of `1493911.13` instead of `1495911.13` (mismatched prefix `3` ➡️ `5`). Corrected to match June 7 closing.
   * **June 9**: Ankit's payment collection column had a vehicle number typo `6,801,500.0` (68 Lakhs). Corrected to `1500.0`.
   * **June 14**: DU1 Petrol closing had a missing digit `150010.38`. Corrected to `1500010.38`.
   * **June 16 & 18**: Rollovers and missing prefixes restored programmatically to preserve continuous sequences.

4. **Credential Security**
   * **Rule**: Never hardcode GitHub Tokens or Gist IDs in `app.js`. They must always be loaded from browser `localStorage` under `octaneflow_sync_cfg`.

---

### 📋 Plan 23: Unified Bookkeeping & Operations Sync
Here is the detailed scope of Plan 23 we are implementing:

1. **Sync Shift Expenses to Global Cash Book**
   * *Goal*: Automatically log shift expenses (*Kharcha*) into the global cash ledger as Cash Outflow when a shift is reconciled.
2. **Auto-Deduct Tanker Payments**
   * *Goal*: Automatically deduct tanker fuel purchases and payments from the designated bank account balance (e.g. SBI or HDFC) when logged.
3. **Add Payment Sources to Manual Expenses**
   * *Goal*: Add a payment source field (Cash, SBI, HDFC, PayTM) to the manual expense form so the respective account ledger is auto-updated.
4. **Auto-Deposit Shift Collections**
   * *Goal*: Automatically record verified shift cash collections as deposits into the cash book or bank account ledger.

---

### AG2 Response
*AG1: Please delete this text and write your answer to the challenge, confirm you have memorized these rules, and document your Plan 23 progress here.*
