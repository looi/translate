# Translator for language learners

Stop guessing whether your phrasing actually sounds natural. This self-hosted web app turns any OpenAI-compatible LLM into a hands-on language tutor that goes far beyond a single translation:

- **Polish your writing & speaking** — Paste text in your target language to get a **minimal fix**, a **literal back-translation**, and a **natural, idiomatic rewrite** so you can see exactly how a native speaker would say it.
- **Translate with nuance** — Enter text in your native language to compare a **literal** translation against an **idiomatic** one side by side.
- **Learn from every edit** — Spot changes instantly with word-level **diffs**, check a **native-ness verdict**, and read clear explanations calling out phrasing that is grammatically fine yet sounds unnatural to native speakers.

**Live demo:** <https://translate.looiwenli.com>

![Screenshot](screenshot.png)

## Features

- **Six parallel analyses** — literal & idiomatic translations, a minimal fix, two back-translations, and key-expression notes in your native language.
- **Native-ness badge** — green/red verdict on whether a native speaker would find your text natural.
- **Toggleable word-level diffs** — inline highlights comparing corrections and back-translations against your input.
- **Auto-detected direction** — detects input language as you type and flips direction automatically (or swap manually).
- **~60 languages** — searchable pickers with a 1000-character limit (client- and server-validated).
- **Instant response cache** — replays stored SSE streams from SQLite so repeat lookups are free and instant.
- **Searchable history & examples** — SQLite-backed history alongside built-in example sentences.
- **Shareable URLs & streaming UI** — query-param links with SSR hydration and live token-by-token Telefunc streaming.

## Stack

| Area      | Libraries                                                                                                   |
| --------- | ----------------------------------------------------------------------------------------------------------- |
| Framework | [Vike](https://vike.dev) + `vike-react`, [Vite](https://vite.dev), React 19 (React Compiler)                |
| Server    | [Hono](https://hono.dev) (`@vikejs/hono`), [Telefunc](https://telefunc.com)                                 |
| UI        | [Mantine](https://mantine.dev) (`@mantine/core`, `@mantine/hooks`), `@tabler/icons-react`, `react-markdown` |
| Data      | [Drizzle ORM](https://orm.drizzle.team) + `drizzle-kit` (SQLite), [Zod](https://zod.dev)                    |
| Streaming | `eventsource-parser` (SSE), `@repeaterjs/repeater`                                                          |
| Text      | `eld` (language detection), `diff` (word diffs)                                                             |
| State     | `@tanstack/react-query`                                                                                     |

## Configuration

Works with any OpenAI-compatible `/chat/completions` endpoint over SSE (requests send a single user prompt with `stream: true`).

| Variable                | Required | Description                                                                         |
| ----------------------- | -------- | ----------------------------------------------------------------------------------- |
| `DB_PATH`               | yes      | Path to the SQLite database file (migrations run automatically on startup).         |
| `CHAT_COMPLETION_URL`   | yes      | Full chat-completions URL.                                                          |
| `CHAT_COMPLETION_TOKEN` | no       | Sent as `Authorization: Bearer <token>`.                                            |
| `CHAT_COMPLETION_BODY`  | no       | JSON merged into the request body (e.g. `model`, reasoning toggles, `temperature`). |

## Running with Docker

> [!WARNING]
> Do not expose this app to the public internet without rate limiting or authentication to prevent abuse and unexpected LLM costs.

Image: [`ghcr.io/looi/translate:main`](https://ghcr.io/looi/translate) (port `3000`). Mount a volume for SQLite to persist cache and history. Use a fast model with reasoning disabled:

**DeepSeek (`deepseek-flash`, reasoning off):**

```bash
docker run --rm -p 3000:3000 \
  -v "$PWD/data:/data" \
  -e DB_PATH=/data/translate.sqlite3 \
  -e CHAT_COMPLETION_URL=https://api.deepseek.com/chat/completions \
  -e CHAT_COMPLETION_TOKEN=xxxxxxxxxxxxxxxx \
  -e CHAT_COMPLETION_BODY='{"model":"deepseek-flash","thinking":{"type":"disabled"}}' \
  ghcr.io/looi/translate:main
```

**OpenAI (`gpt-5.6-terra`, reasoning off):**

```bash
docker run --rm -p 3000:3000 \
  -v "$PWD/data:/data" \
  -e DB_PATH=/data/translate.sqlite3 \
  -e CHAT_COMPLETION_URL=https://api.openai.com/v1/chat/completions \
  -e CHAT_COMPLETION_TOKEN=xxxxxxxxxxxxxxxx \
  -e CHAT_COMPLETION_BODY='{"model":"gpt-5.6-terra","reasoning_effort":"none"}' \
  ghcr.io/looi/translate:main
```

**Docker Compose:**

```yaml
services:
  translate:
    image: ghcr.io/looi/translate:main
    ports:
      - "3000:3000"
    environment:
      DB_PATH: /data/translate.sqlite3
      CHAT_COMPLETION_URL: https://api.deepseek.com/chat/completions
      CHAT_COMPLETION_TOKEN: xxxxxxxxxxxxxxxx
      CHAT_COMPLETION_BODY: '{"model":"deepseek-flash","thinking":{"type":"disabled"}}'
    volumes:
      - ./data:/data
```

Open <http://localhost:3000>.

## Development

Requires Node.js v22.5.0+ (`node:sqlite`) and pnpm 12.

```bash
pnpm install
DB_PATH=./dev.sqlite3 pnpm dev      # Dev server (http://localhost:5173)
DB_PATH=./dev.sqlite3 pnpm build    # Type-check & production build
DB_PATH=./dev.sqlite3 pnpm preview  # Serve production build (port 3000)
pnpm lint && pnpm check-types       # Lint & type-check
```

**Database migrations:** After editing `src/schema.ts`, run `DB_PATH=./dev.sqlite3 pnpm exec drizzle-kit generate`. Commit the generated SQL under `drizzle/` — migrations apply automatically on startup.
