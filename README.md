# Shop0 — Pure Man Kurta Green

A simple mock demo shopping site for **Shop0**, selling Pure Man Kurta (green). Built with plain HTML, modular JavaScript, and a single CSS file. No frameworks or build step.

**Project goal:** This repo is used to **test out WebMCP** (Model Context Protocol in the browser / Cursor MCP integration). The site is a minimal e‑commerce UI to exercise MCP tooling and workflows.

---

## What’s in the project

- **Shop0** — One product line: Pure Man Kurta Green, in sizes S, M, L, XL.
- **Listing** with filters: size, logo style, price (RM), body type, height/weight recommendation, rating.
- **Add to cart** via a modal: choose logo (big/small), quantity, optional note. Currency: **MYR (RM)**.
- **Cart** in the header (count + modal). **Reset cart** button clears all items and updates the count.
- **Size recommendation** from height (cm) and weight (kg) using hardcoded range rules.

---

## Setup and run

### Prerequisites

- A modern browser (Chrome, Firefox, Edge, Safari).
- No Node/npm required for the demo (static files only).

### Option 1: Open the file directly

1. Clone or download the repo.
2. Open `index.html` in your browser (double‑click or **File → Open**).

Note: Some browsers may restrict ES modules when using `file://`. If the page is blank or scripts don’t run, use Option 2.

### Option 2: Serve with a local server (recommended)

From the project root:

```bash
# Using npx (Node required)
npx serve .

# Or with Python 3
python -m http.server 8080
```

Then open:

- **npx serve:** http://localhost:3000  
- **Python:** http://localhost:8080  

---

## Deploy to GitHub Pages

1. **Push the repo to GitHub**  
   Create a repository (e.g. `webmcp-shopo`) and push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/webmcp-shopo.git
   git push -u origin main
   ```
   Use your actual GitHub username and repo name; use `master` instead of `main` if that’s your default branch.

2. **Turn on GitHub Pages**  
   - Open the repo on GitHub → **Settings** → **Pages** (left sidebar).  
   - Under **Build and deployment**, **Source** choose **Deploy from a branch**.  
   - **Branch**: pick `main` (or `master`), **Folder**: **/ (root)**.  
   - Click **Save**.

3. **Wait for the first deploy**  
   After a minute or two, the site will be at:
   ```text
   https://YOUR_USERNAME.github.io/webmcp-shopo/
   ```
   Replace `YOUR_USERNAME` and `webmcp-shopo` with your GitHub username and repo name.

**Notes:**  
- The site is static (HTML/CSS/JS); no build step is required.  
- All links use relative paths, so they work on GitHub Pages.  
- WebMCP tools need a secure context; GitHub Pages is HTTPS, so they will work there.

---

## Project structure

```
├── index.html          # Single page: header, filters, listing, modals
├── css/
│   └── theme.css       # Styles (bright white + dark green)
├── js/
│   ├── app.js          # Entry: wiring, listing render, filter/cart init, WebMCP registration
│   ├── data.js         # Mock products, sizes, price (MYR), recommendation ranges
│   ├── filters.js      # Filter state and apply/clear logic
│   ├── cart.js         # Cart state, add-to-cart modal, cart modal, reset
│   └── webmcp.js       # WebMCP tool registration (add_to_cart, get_cart_summary, etc.)
├── image/              # Product images (small, medium, large, extra-large)
└── README.md
```

---

## WebMCP tools

When the app runs in a **secure context** (HTTPS or localhost) and the browser supports WebMCP (`navigator.modelContext`), these tools are registered so AI agents can call them:

| Tool | Description |
|------|-------------|
| `add_to_cart` | Add kurta to cart: size (S/M/L/XL), logo (big/small), optional qty and note. |
| `get_size_recommendation` | Recommend size from height (cm) and weight (kg). Read-only. |
| `get_cart_summary` | Return cart item count and line summary. Read-only. |
| `reset_cart` | Clear all cart items. |
| `list_products` | List products with optional filters (sizes, price range, body type, min rating). Read-only. |

See `.cursor/skills/convert-js-to-webmcp/` for how these were converted from existing JS.

---

## WebMCP / testing focus

This project is intended for:

- Trying **WebMCP** or other MCP-based tooling against a real, small web app.
- Exercising **browser automation**, **DOM inspection**, or **MCP file/run tools** on a known structure.
- Having a **stable, minimal demo** (HTML + JS modules + one CSS file) without a build pipeline.

No backend or API; all data is mock and in-memory.
