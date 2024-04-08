# ChatCrafters

THIS IS A WORK IN PROGRESS!

Craft your conversations, meet virtual personas, connect!

ChatCrafters is a web application which allows you to create your own AI personas, chat with them, and also chat with other users of the platform with AI-enchanced chat features!

This website was built for the [dev.to Cloudflare AI Challenge](https://dev.to/devteam/join-us-for-the-cloudflare-ai-challenge-3000-in-prizes-5f99).

## AI Models used

WIP

## Tech stack

WIP

## Deploy on Cloudflare Pages

1. Clone this repository and install pnpm packages with `pnpm i`.

Make sure you're authenticated to wrangler with `pnpm exec wrangler login`

2. Create a D1 database using `pnpm exec wrangler d1 create NAME_OF_DB`. Copy whatever TOML output it gives you into `wrangler.toml`, but make sure that the binding is `db`.

Example:
```toml
[[d1_databases]]
binding = "db"
database_name = "chatcrafters"
database_id = "SOME-RANDOM-UUID"
```

3. Build the app with `pnpm build`.

4. Deploy to pages with `pnpm exec wrangler pages deploy .svelte-kit/cloudflare`

If you don't have a pages project yet, create one with `pnpm exec wrangler pages project create`

## Local Development

WIP
