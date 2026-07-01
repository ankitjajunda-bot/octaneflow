========================================================================
📂 SCANS & RAW DOCUMENTS DIRECTORY
========================================================================

This directory houses the raw document scans, digitized transaction ledgers, and OCR extracted CSV tables. It serves as a historical audit trial to compare physical paper readings with database entries.

KEY FOLDERS & CONTENTS:
------------------------------------------------------------------------
- /Supply/
  * Contents: Scanned tanker delivery receipts and supply bills.
  * Extracted CSV files (e.g. supply_bill_extracted_data_sorted_cleaned.csv) contain detailed tabular invoice details including quantity (KL), TT numbers, invoice total prices, and material descriptions.
  
- /November/
  * Contents: Raw handwritten daily DSR sheets from November 2025.
  * Used during initial baseline comparisons to check digitized totalizers against operator notes.

- /December/
  * Contents: Raw handwritten DSR sheets from December 2025.

- /January/
  * Contents: Raw handwritten DSR sheets from January 2026.
  
HOW THE DATA IS USED:
------------------------------------------------------------------------
1. OCR systems extract values from PDF receipts and write them to flat CSV sheets.
2. Conversion scripts (found inside the /scratch/ folder) compile these CSVs into JavaScript modules (e.g., supply_bills_data.js) loaded into the application context.
3. This process guarantees 100% data visibility for auditing, preventing any data manipulation or transcription errors.
========================================================================
