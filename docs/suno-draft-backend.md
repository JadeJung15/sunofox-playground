# Suno Generate API

`/suno-generator` now calls `POST /api/generate` and expects:

```json
{
  "genrePreset": "Symphonic DnB",
  "themePreset": "reunion_promise",
  "languageMode": "KR_ONLY",
  "energyMode": "emotional",
  "youtubeMode": true
}
```

The Worker response must be:

```json
{
  "title": "",
  "style": "",
  "lyrics": ""
}
```

## Worker env

`OPENAI_API_KEY` must be stored as a Cloudflare Worker Secret.

Regular vars in `wrangler.toml`:

```toml
[vars]
CORS_ALLOWED_ORIGIN = "https://your-domain.com"
OPENAI_COMPAT_BASE_URL = "https://your-provider.example.com/v1"
OPENAI_MODEL = "your-model"
```

Secret:

```bash
wrangler secret put OPENAI_API_KEY
```

## Local test

Install/configure Wrangler first, then:

```bash
npm test
wrangler secret put OPENAI_API_KEY
npm run worker:dev
firebase emulators:start --only hosting,firestore
```

Quick API test:

```bash
curl -i http://127.0.0.1:8787/api/generate \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://your-domain.com' \
  --data '{"genrePreset":"Symphonic DnB","themePreset":"reunion_promise","languageMode":"KR_ONLY","energyMode":"emotional","youtubeMode":true}'
```

## Deploy

Deploy Firestore rules + frontend:

```bash
firebase deploy --only hosting,firestore
```

Deploy Worker:

```bash
wrangler secret put OPENAI_API_KEY
wrangler deploy
```

If you want the frontend to call a same-origin `/api/generate`, attach the Worker to your domain route for `/api/*`.
