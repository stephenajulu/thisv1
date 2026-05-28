# Offline Scaling & Low-End Device Optimization Strategy

This document outlines the performance optimization and database architecture strategy for **THIS** as the clinical database scales from a few seed entries to thousands of diseases, traditional botanical profiles, and GRADE outcomes.

---

## 📱 1. Performance on Low-End Outpost Devices

Clinicians in rural areas often rely on older, low-end tablets or smartphones. Rendering hundreds of complex, interactive cards simultaneously can freeze the DOM and cause sluggish inputs.

### The Chunked DOM Rendering Strategy
In `src/components/Navigator.jsx`, we prevent rendering overhead by implementing **Paginating Chunking**:
1.  **Initial Slice**: We only render the first **12 matching cards** immediately.
2.  **Intersection Observer (Infinite Scroll)**: As the clinician scrolls to the bottom of the search results, we dynamically load the next 12 cards.
3.  **Search Input Debouncing**: We debounce key inputs by 150ms so that fuzzy Levenshtein calculations are not executed on every single keystroke, saving CPU cycles.

---

## 💾 2. Scaling the Database Beyond 400kB (Offline Sovereignty)

While a 400kB client bundle loads in milliseconds, a database with thousands of conditions, active compound profiles, and cross-linked clinical trials can eventually grow to 10MB or more. 

To preserve **100% offline sovereignty** without bloating the initial app load, we employ a **Chunked PWA Cache-on-Demand** architecture:

```
[Initial Load: 120kB Core App] ──(Clinician Visits Page)──> [Fetch Chunked JSON: 15kB] ──(SW Precaches)──> [IndexedDB / Cache Storage]
```

### Step 1: Chunking the JSON Database
Instead of a single `database.js` file, we split the database into:
*   `index.json` (A tiny directory file containing only entity IDs, names, scientific names, and category tags: ~50kB for 1,000 entries). This is loaded initially to power the fuzzy search.
*   `/data/conditions/{id}.json` (Detailed condition packets containing symptoms, prevention checklists, and full GRADE matrix rows for a specific disease).
*   `/data/remedies/{id}.json` (Detailed remedy packets containing botanical details, prep guides, and safety warnings).

### Step 2: Client-side Routing with Dynamic Fetching
When the user visits `/condition/malaria`, the app fires a `fetch('/data/conditions/malaria.json')` request. 
*   **Online**: The request is fetched from the server.
*   **Offline**: The PWA Service Worker interceptor instantly catches the request and serves it from the browser's **Cache Storage** or local **IndexedDB** where it was cached during initial deployment or previous page hits.

### Step 3: Progressive Web App (PWA) Background Pre-caching
We configure `vite-plugin-pwa` to progressively download and cache all detail JSON packets in the background during periods of active connection:
```javascript
// vite.config.js workbox configuration for dynamic caching
workbox: {
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/yoursite\.netlify\.app\/data\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'this-clinical-packets',
        expiration: {
          maxEntries: 500,
          maxAgeSeconds: 60 * 60 * 24 * 30 // 30 Days
        }
      }
    }
  ]
}
```

### Step 4: IndexedDB for User-Generated Data
When invited practitioners submit reviews or flag clinical data offline, the feedback is saved inside the browser's local **IndexedDB** (using a lightweight library like `Dexie.js`). 

As soon as the device detects a stable internet connection, a **Background Sync Service Worker** automatically uploads the queued clinical reports back to the Netlify PR pipeline!
