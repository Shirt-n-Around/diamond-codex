# The Diamond Codex (Static Site)

A zero-backend, drag-and-drop static site for First Sergeants.
- Title/Tagline and content live in your browser via localStorage (no server).
- Import/Export JSON to move content between machines.
- Sections: Home (fast edit), Quick Reference, Senior Mentor Notes, Coaching • GROW.
- Footer acknowledgment credits SILC without affiliation.

## Quick Start (Three Easy Hosting Options)

### Option A: Netlify Drop (fastest)
1) Download the ZIP from ChatGPT (below).
2) Visit app.netlify.com/drop and drag the ZIP. That's it.

### Option B: GitHub Pages
1) Create a repo, e.g., `diamond-codex`.
2) Upload all files from this folder (index.html, styles.css, script.js).
3) In repo Settings → Pages → set Branch: `main` (or `master`) and `/root`.
4) Open the provided URL to view your site.

### Option C: Vercel
1) Push these files to a GitHub repo.
2) Go to vercel.com → New Project → Import your repo → Deploy.

## Editing Content
- Use the Home tab's text areas and **Save**.
- Click **Export** to back up to JSON.
- Click **Import** to paste a JSON payload (like `config.json`).

## Notes
- All data is local to your browser until you export and share it.
- If you clear browser storage, you'll lose unsaved content—export first.
