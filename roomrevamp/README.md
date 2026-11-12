# RoomRevamp

A zero-cost-first room redesign planner. This first build is a mobile-friendly, dependency-free web app.

## Run
Open `app/index.html` in a browser. No build step, account, API key, paid service, or external dependency is required.

## Current features
- Local room-photo preview (image stays in the browser)\n- Room choices, budget, style, and shopping list saved locally between visits (photo itself is not saved)
- Room type, dimensions, and design-style selection
- Live budget slider with synchronized numeric display
- Editable shopping shortlist with retailer search links
- Budget total and remaining-budget calculation
- Design brief generation, copy, and download\n- Custom item names generate matching retailer search terms

## Honest scope
This is the first functional planning interface, not yet an AI image-generation service or live product catalog. Retailer links are searches, and listed prices are editable planning estimates—not verified live prices or exact SKUs. Later integrations must use approved retailer feeds/APIs and must map displayed products to real product identifiers. Browser automation currently covers desktop and iPhone-sized Chromium; it does not yet test Safari on a physical iPhone.

## Cost policy
Keep the core app free to run. Do not add paid APIs, hosting, subscriptions, or credentials without explicit approval.
