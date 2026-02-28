# Suno Draft Backend

This repo does not include a deployed API by default. A minimal backend handler is available at `scripts/suno-draft-server.cjs`.

## Request shape

The frontend now sends:

```json
{
  "promptTemplate": "rule text",
  "input": {
    "genrePreset": "Symphonic DnB, Cinematic Bass | strings, breakbeats, synth bass, choir",
    "languageMode": "KR_ONLY",
    "vocalGender": "FEMALE",
    "bpmHint": 174,
    "themeHint": "빗속 재회",
    "intensity": "EMOTIONAL"
  },
  "preset": {
    "id": "symphonic-dnb",
    "name": "Symphonic DnB",
    "genres": ["Symphonic DnB", "Cinematic Bass"],
    "bpm": 174,
    "instruments": ["strings", "breakbeats", "synth bass", "choir"],
    "moodFocus": "비장"
  },
  "variation": false
}
```

The backend must return JSON only:

```json
{
  "title": "",
  "style": "",
  "lyrics": ""
}
```

## Local run

Mock mode:

```bash
node scripts/suno-draft-server.cjs
```

Health check:

```bash
curl http://localhost:8787/healthz
```

Frontend config:

Set `window.__SEVENCHECK_CONFIG__.sunoGenerator.endpointUrl` in [js/site-config.js](/home/user/sunofox-test-01/js/site-config.js) to your deployed API URL, for example:

```js
endpointUrl: "http://localhost:8787/api/suno-draft",
```

## Provider mode

The server supports two modes:

- `mock`
- `openai_compatible`

`mock` returns a deterministic local draft and is useful for integration testing.

`openai_compatible` expects these env vars:

```bash
SUNO_DRAFT_PROVIDER=openai_compatible
OPENAI_COMPAT_BASE_URL=https://your-provider.example.com/v1
OPENAI_API_KEY=...
OPENAI_MODEL=...
```

The handler sends the frontend `promptTemplate`, `input`, `preset`, and `variation` to a chat-completions compatible endpoint and still enforces the final `title/style/lyrics` response shape.
