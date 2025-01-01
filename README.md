# Eliza.gg

![Eliza.gg Cover](./public/cover.png)

## Overview

Eliza.gg is a RAG-powered documentation assistant that helps developers navigate the Eliza open source ecosystem. It reduces information overload by providing contextual answers and relevant code examples from the Eliza documentation.

### Core Features

- **Search**: Vector database search for finding relevant documentation
- **Context**: Real-time citation tracking for verifiable answers
- **Streaming**: Fast, streaming responses with code examples

## Getting Started

1. Set up environment variables:

```bash
cp .env.example .env
```

2. Install and run:

```bash
bun install
bun run --bun dev
```

3. Open [http://localhost:3000](http://localhost:3000)
