# RoomRevamp Test Lab

This is the automated browser-testing app for the RoomRevamp planner. It tests the real app in Chromium on desktop and an iPhone-sized mobile viewport.

## Run locally
From this directory's parent folder:

```sh
npm install
npx playwright install chromium
npm test
```

## Coverage
- App boot and core sections
- Budget slider live display, remaining amount, and over-budget state
- Style selection and brief propagation
- Add/edit/remove shopping-list rows and totals
- Retailer search-link generation
- Room type, dimensions, and budget propagation into brief
- Local image upload, preview, and removal
- Copy and text-file download actions
- Mobile horizontal overflow and primary action visibility

## Results
Playwright produces a readable terminal report, failure screenshots, traces, videos, and an HTML report under `testing/test-results/`. CI uploads the report as a GitHub Actions artifact.

This test suite checks the current planner. It does not certify AI rendering, live retailer prices, exact product/SKU matching, or integrations that have not been built yet.
