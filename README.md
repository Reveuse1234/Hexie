# Hexie

**your friendly coding space**

**Live site:** https://hexie-eta.vercel.app

A browser-based code editor with a dark neon workspace, multi-file sidebar, and in-browser execution for JavaScript and Python.

---

## Features

- Multi-file workspace with browser local storage
- Starter templates for each supported language
- Live output panel for run results
- Save, copy, and download actions
- Keyboard shortcuts for save and run

---

## Supported languages

| Language | Extension | Runs in browser |
|----------|-----------|-----------------|
| JavaScript | `.js` | Yes |
| Python | `.py` | Yes (Pyodide; first run loads the runtime) |

Hexie only includes languages that run completely in the browser.

---

## Getting started

Install dependencies and start the dev server from the repo root:

```bash
npm install --prefix my-editor-app
npm run dev
```

Open the URL shown in your terminal (default port 5173).

To test a production build locally:

```bash
npm run build
npm run preview
```

---

## Using the editor

1. Open the home page and click **Open Editor**.
2. Click **New File**, enter a name, and pick a language.
3. Write code in the editor. Save with **Save** or **Ctrl/Cmd + S**.
4. Run with **Run** or **Ctrl/Cmd + Enter**. Output appears below.

| Action | How |
|--------|-----|
| Switch file | Click a file in the sidebar |
| Change language | Language dropdown in the toolbar |
| Copy code | **Copy** button |
| Export file | **Download** |
| Delete file | Trash icon on a sidebar file |
| Back to home | **Back to Home** in the sidebar |

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + S | Save |
| Ctrl/Cmd + Enter | Run |
| Tab | Insert two spaces |

Files persist in your browser under the key `hexie-code-files`.

---

## Project structure

```
Hexie/
├── my-editor-app/
│   ├── public/hexie-logo.svg
│   ├── src/
│   │   ├── components/     CodeEditor, HexieLogo
│   │   ├── pages/          HomePage
│   │   ├── lib/            editor.js, pythonRunner.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── LICENSE
├── NOTICE.md
├── package.json
├── vercel.json
└── README.md
```

---

## Scripts

Run these from the repo root:

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build → `my-editor-app/dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | ESLint |

---

## Deploy

The repo includes `vercel.json` for static hosting on Vercel. Push to GitHub, import the repository, and deploy — no extra build settings are required.

Python requires internet on first run so Pyodide can load from its CDN.

---

## Tech stack

React, Vite, Tailwind CSS, Lucide icons, and self-hosted fonts. No backend required.

---

## License

MIT — see `LICENSE`. Third-party attributions are in `NOTICE.md`.
