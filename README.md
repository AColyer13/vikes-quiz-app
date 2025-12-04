# Minnesota Vikings Quiz App (React + Vite)

This is a small React app built with Vite. It includes a mobile-friendly UI, a quiz flow with progress, and GitHub Pages deployment.

## Project Structure

```
eslint.config.js
index.html
package.json
README.md
vite.config.js
docs/
	index.html
	vite.svg
	assets/
		index-ClunwmRn.css
		index-zpuqSM6M.js
public/
	vite.svg
src/
	App.css
	App.jsx
	index.css
	main.jsx
	assets/
		react.svg
```

Key files:
- `src/App.jsx`: Quiz UI and logic.
- `src/index.css` and `src/App.css`: Styles (includes mobile/iOS overflow fixes).
- `index.html`: App mount point and Vite entry.
- `docs/`: Built site used for GitHub Pages (branch: `main`, folder: `/docs`).

## Getting Started

Prerequisites:
- Node.js 18+ recommended.

Install dependencies:

```powershell
npm install
```

Run the dev server:

```powershell
# Local only
npm run dev

# Expose to LAN (test on iPhone on same Wi‑Fi)
npm run dev -- --host
```

Vite will print a local URL and (with `--host`) a LAN URL you can open on your phone.

## Build

Create a production build:

```powershell
npm run build
```

The output will be in `dist/`. If you are using the `docs/` folder for GitHub Pages, you can copy the build there:

```powershell
# Optionally replace docs/ with the latest dist/
Remove-Item -Recurse -Force docs
Copy-Item -Recurse dist docs
```

## Deploy (GitHub Pages)

Two common options:

1) Use `docs/` on `main` (simple):
- Commit and push the `docs/` folder to `main`.
- In your GitHub repo Settings → Pages, select:
	- Source: `Deploy from a branch`
	- Branch: `main`
	- Folder: `/docs`
- The site will be available at `https://<username>.github.io/<repo>/`.

2) Use a `gh-pages` branch:
- Install helper:

```powershell
npm install --save-dev gh-pages
```

- Add scripts to `package.json`:

```json
{
	"scripts": {
		"predeploy": "npm run build",
		"deploy": "gh-pages -d dist"
	}
}
```

- Deploy:

```powershell
npm run deploy
```

Ensure `vite.config.js` has a correct `base` if your site is served under a subpath:

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
	plugins: [react()],
	// If publishing to https://<username>.github.io/<repo>/ use:
	// base: '/<repo>/'
	// For user/organization pages (root), base can be '/'
})
```

## Git Basics

Check status and remotes:

```powershell
git status
git remote -v
```

If the remote is missing, add it:

```powershell
git remote add origin https://github.com/<username>/<repo>.git
```

Commit and push:

```powershell
git add -A
git commit -m "Build and deploy updates"
git push -u origin main
```

## Mobile Notes

- To test on iPhone, run `npm run dev -- --host` and open the LAN URL.
- `src/index.css` includes safeguards against iOS Safari horizontal overflow and ensures buttons stay within the viewport.

## Troubleshooting

- If GitHub Pages shows a 404 or wrong paths, set `base` in `vite.config.js` to `'/<repo>/'` for project pages.
- If the dev port is busy, Vite will pick another port; watch the terminal output.
- Clear browser cache or use a private window after redeploys to avoid stale assets.
