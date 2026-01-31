# Production checklist for LaunchPad ✅

1. Install new backend dependencies:
   - Run in backend folder: `npm install` (or `npm ci`) to install `compression` and `helmet`.
2. Add app icons for PWA:
   - Add `/logo-192.png` and `/logo-512.png` to `public/` (referenced by `manifest.json`).
3. HTTPS & reverse proxy:
   - Use Nginx or a managed host (Vercel/Heroku) and terminate TLS at the proxy.
   - Redirect HTTP → HTTPS and set HSTS via `helmet` configuration if desired.
4. Process manager:
   - Use `pm2`, `systemd` or your host's process manager for `node server.js` with `NODE_ENV=production`.
5. Security & Monitoring:
   - Configure `helmet` policies, strong CORS rules and rate-limiting.
   - Add logging and error monitoring (Sentry or similar).
6. Performance:
   - Serve static files from CDN if possible.
   - Add image optimization and caching headers (already added basic caching).
   - Build and minify frontend assets with `esbuild` (new `npm run build` script).
7. CI/CD & Tests:
   - Add tests and a pipeline to run them on PRs. Consider adding a step to run `npm run build` and `npm test`.
8. SEO & Analytics:
   - Update `sitemap.xml`, add `robots.txt`, and set `og:` tags (already added basics).
9. Accessibility & UX:
   - Run lighthouse and address issues (color contrast, aria labels, keyboard navigation).
10. Optional:
   - Add automated asset bundling (esbuild/webpack/rollup) for minified JS/CSS. (Done: `esbuild` script added to `package.json`)
   - Add a `Dockerfile` for containerized deployments (Dockerfile added).

Recommended next steps for production:
- Run `npm install` at project root to get the `esbuild` CLI (or run `npm ci`).
- Run `npm run build` to create `/public/dist` assets. (The build script now writes hashed filenames and updates HTML/service worker automatically.)
- A GitHub Actions workflow (`.github/workflows/ci.yml`) is included which will run `npm run build` and publish a Docker image to GitHub Container Registry as `ghcr.io/<your-org>/launchpad:latest` when you push to `main`.
- To push images to GHCR automatically ensure the repository allows package write via the default `GITHUB_TOKEN` or configure `PACKAGES` permissions as needed.
- A new GitHub Actions workflow (`.github/workflows/deploy-fly.yml`) is included to build and deploy to Fly.io on push to `main` (or manual dispatch). It expects the repository secret `FLY_API_TOKEN` to be set.
- How to get deploy-ready on Fly:
  1. Install flyctl locally and login: `curl -L https://fly.io/install.sh | sh` and `flyctl auth login`.
  2. Create your Fly app and region locally (recommended): `flyctl launch --name my-launchpad --no-deploy` — this creates `fly.toml`. Replace `app = "launchpad-replace-me"` with your app name or run the `launch` command to overwrite.
  3. In your GitHub repo settings add `FLY_API_TOKEN` (Settings → Secrets → Actions) with a token created via `flyctl auth token`.
  4. Push to `main` or run the `Deploy to Fly` workflow dispatch in Actions to trigger deployment.
- Test site locally and then build Docker image: `docker build -t launchpad:latest .` and run container.
