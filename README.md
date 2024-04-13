# ChatCrafters

THIS IS A WORK IN PROGRESS!

Craft your conversations, meet virtual personas, connect!

ChatCrafters is a web application which allows you to create AI Personas, which are specialised instructions for an LLM to be able to act as another character. You can also chat with Personas other people create.

This website was built for the [dev.to Cloudflare AI Challenge](https://dev.to/devteam/join-us-for-the-cloudflare-ai-challenge-3000-in-prizes-5f99).

Hosted live at <https://chatcrafters-c70.pages.dev>.  
View my submission post at <https://dev.to/arnu515/chatcrafters-chat-with-ai-powered-personas-40o0>.

## AI Models used

This application uses eight different models!

One of them being [Stable Diffusion XL Lightning](https://developers.cloudflare.com/workers-ai/models/stable-diffusion-xl-lightning/), for generating Persona images.

It also uses [OpenAI Whisper](https://developers.cloudflare.com/workers-ai/models/whisper/) for speech recognition, so you can talk to your Personas!

The other six are Text Generation models. They are:

- [Llama2](https://developers.cloudflare.com/workers-ai/models/llama-2-7b-chat-int8/)
- [Mistral v0.2](https://developers.cloudflare.com/workers-ai/models/mistral-7b-instruct-v0.2/)
- [Neural Chat](https://developers.cloudflare.com/workers-ai/models/neural-chat-7b-v3-1-awq/)
- [OpenHermes](https://developers.cloudflare.com/workers-ai/models/openhermes-2.5-mistral-7b-awq/)
- [Qwen](https://developers.cloudflare.com/workers-ai/models/qwen1.5-7b-chat-awq/)
- [TinyLlama](https://developers.cloudflare.com/workers-ai/models/tinyllama-1.1b-chat-v1.0/)

## Tech stack

- [Svelte Kit](https://kit.svelte.dev) for the fullstack framework.
  - It has first class support for Cloudflare Pages
  - Svelte is a very elegant framework, and Svelte Kit is a very good meta-framework for Svelte.
  - Svelte was probably the reason that I was able to build this application in a reasonable amount of time.
- [TailwindCSS](https://tailwindcss.com), [Daisy UI](https://daisyui.com), and [Bits-UI](https://bits-ui.com) for styling.
- [Cloudflare D1](https://www.cloudflare.com/developer-platform/d1/) for the database.
  - Using the official bindings for the client.
- [Cloudflare Pages](https://pages.cloudflare.com/) for hosting.
- [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces) for the CDN.

## Deploy on Cloudflare Pages

1. Clone this repository and install pnpm packages with `pnpm i`.

Make sure you're authenticated to wrangler with `pnpm exec wrangler login`

2. Create a D1 database using `pnpm exec wrangler d1 create NAME_OF_DB`. Copy whatever TOML output it gives you into `wrangler.toml`, but make sure that the binding is `db`.

Example:

```toml
[[d1_databases]]
binding = "db"  # DO NOT CHANGE THIS
database_name = "NAME_OF_DB"
database_id = "SOME-RANDOM-UUID"
```

Create the schema using

```bash
ls sql/*.sql -1 | xargs -L 1 -t pnpm exec wrangler d1 execute chatcrafters --remote --file
```

If wrangler isn't able to pick up these bindings for Cloudflare pages, then you may need to [add them manually](https://developers.cloudflare.com/pages/functions/bindings/#d1-databases)

3. Add environment variables by copying the `.env.example` file to `.env`, and filling in your values.

Also copy paste the `.env` file you create in your Pages' settings (once it goes live, then do step 4 & 5 again.) as shown [here](https://developers.cloudflare.com/pages/configuration/build-configuration/#environment-variables).

4. Build the app with `pnpm build`.

5. Deploy to pages with `pnpm exec wrangler pages deploy .svelte-kit/cloudflare`

If you don't have a pages project yet, create one with `pnpm exec wrangler pages project create`

## Local Development

1. Follow steps 1-3 of the deployment guide, but substitute `--remote` for `--local` in the D1 command.

2. Run `pnpm dev` to start the local devserver at <http://localhost:5173>.

