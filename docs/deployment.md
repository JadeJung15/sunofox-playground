# Deployment

This repository uses separate deployment flows for development and production.

## Development

- Trigger: `git push` to `main`
- GitHub Actions workflow: `.github/workflows/cloudflare-dev-deploy.yml`
- Cloudflare Pages project: `sunofox-playground-test`
- URL: `https://sunofox-playground-test.pages.dev/`

## Production

- Trigger: manual run from GitHub Actions
- GitHub Actions workflow: `.github/workflows/cloudflare-deploy.yml`
- Cloudflare Pages project: `sunofox-playground`
- URL: `https://7checkfox.com/`

## Expected flow

1. Push code to `main`
2. Verify changes on the development site
3. Run `Deploy Production to Cloudflare Pages` from GitHub Actions when ready

## Required Cloudflare setting

Disable automatic Git deployment for the `sunofox-playground` Pages project.

If Cloudflare Git auto-deploy remains enabled for production, a push can still publish production outside GitHub Actions.
