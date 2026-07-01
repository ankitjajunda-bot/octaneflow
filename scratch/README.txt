========================================================================
🛠️ INTERNAL SCRATCH & HELPERS SANDBOX
========================================================================

This folder is used as a sandbox for temporary developer scripts, background database migrations, data format converters, and testing scripts.

TYPICAL UTILITIES & SCRIPTS:
------------------------------------------------------------------------
- Convert CSVs to JSON modules:
  * Used to parse supply bills OCR outputs and convert them to the JS variables (e.g. SUPPLY_BILLS_DATA) loaded in the UI.
- Validate ledger calculations:
  * Verification scripts to double-check that no duplicate dates or illogical WAC values exist.
- Repair/Merge totalizer logs:
  * Background scripts to heal historical totalizer sequences (such as correcting duplicate reads or misplaced decimals).

NOTE FOR DEVELOPERS:
------------------------------------------------------------------------
Files in this sandbox are not loaded by the user-facing web app. You can safely create Python, Node, or Shell scripts here to run offline analytics or check draft records.
========================================================================
