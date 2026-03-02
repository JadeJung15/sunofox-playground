# Repository Instructions

## Deployment Rules

- Repository: `JadeJung15/sunofox-playground`
- `main` branch push deploys only to the development Cloudflare Pages project `sunofox-playground-test`.
- Development site URL: `https://sunofox-playground-test.pages.dev/`
- Production deploy must be triggered manually from GitHub Actions using `Deploy Production to Cloudflare Pages`.
- Production Cloudflare Pages project: `sunofox-playground`
- Production site URL: `https://7checkfox.com/`
- Keep automatic Git production deployments disabled for the `sunofox-playground` Cloudflare Pages project.
- The legacy development address `https://sunofox-test-g.pages.dev/` is deprecated and should be removed, not reused.

## Workflow Files

- Development deploy workflow: `.github/workflows/cloudflare-dev-deploy.yml`
- Production deploy workflow: `.github/workflows/cloudflare-deploy.yml`
- Additional deployment notes: `docs/deployment.md`
