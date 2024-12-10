# Eliza.gg

![Eliza.gg Cover](./public/cover.png)

The documentation resource for Eliza.

## Getting Started

Copy the `.env.example` file to `.env` and fill in the values.

```bash
cp .env.example .env
```

### API Keys Setup

1. **Turso Database**

   - Visit [Turso Dashboard](https://app.turso.tech)
   - Create a new database or select an existing one
   - Get your database URL and authentication token from the dashboard

2. **OpenAI API**

   - Go to [OpenAI API Keys](https://platform.openai.com/settings/organization/api-keys)
   - Create a new API key
   - Copy the key to your `.env` file

3. **Voyage AI**

   - Visit [Voyage Dashboard](https://dash.voyageai.com)
   - Generate a new API key
   - Copy the key to your `.env` file

4. **Cerebras AI**
   - Visit [Cerebras Dashboard](https://cloud.cerebras.ai/)
   - Generate a new API key
   - Copy the key to your `.env` file

Install the dependencies and run the development server.

```bash
bun install
bun run --bun dev
```

Open the browser and go to [http://localhost:3000](http://localhost:3000).
