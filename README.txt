========================================================================
⛽ OCTANEFLOW FUEL STATION MANAGER - ROOT DIRECTORY
========================================================================

Welcome to the root workspace. This directory contains the primary files required for serving, running, and managing the OctaneFlow local-first PWA dashboard.

CORE WEB APPLICATION FILES:
------------------------------------------------------------------------
- index.html
  * Description: Main UI layout, navigation sidebar, and tab shell.
  * Purpose: Serves as the dashboard frontend, logistics inputs, and DSR review hub.
- app.js
  * Description: Central controller script.
  * Purpose: Implements state management, cash variance calculations, inventory reconciliation, and Gist cloud synchronization.
- styles.css
  * Description: Global styling stylesheet.
  * Purpose: Implements high-fidelity glassmorphism, responsive spreadsheet widths, custom grid panels, and dark-theme aesthetics.
- live_shift_reconciliation_dashboard.html
  * Description: Live dual-shift totalizer alignment sheet.
  * Purpose: Loaded in an iframe inside the main app to check Morning vs Evening shifts for dates in the Jodhpur range.

LOCAL DATABASE / JS SCRIPTS:
------------------------------------------------------------------------
- dsr_data.js
  * Description: Production Daily Sales Record (DSR) ledger baseline.
  * Purpose: Contains historical daily sales volume readings and tank stock balances.
- supply_bills_data.js
  * Description: Extracted IOCL invoice supply ledger.
  * Purpose: Feeds the Weighted Average Cost (WAC) engine for historical purchases.

PWA / INSTALLATION SERVICE WORKERS:
------------------------------------------------------------------------
- manifest.json
  * Description: Web App manifest.
  * Purpose: Configures name, start URL, theme colors, and icons for desktop and mobile installation.
- sw.js
  * Description: Service Worker script.
  * Purpose: Implements network-first offline caching strategies to load the dashboard without active internet connection.

SUBDIRECTORIES:
------------------------------------------------------------------------
- /PUMP Bills/ : Directory for raw PDF scanned documents and OCR CSV outputs.
- /scratch/    : Background data migration and script logs sandbox.
========================================================================
