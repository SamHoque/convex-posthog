# PostHog Convex Component

A server-side analytics component for tracking user events with PostHog in your Convex application.

## Features

- **Server-side tracking**: All events are tracked from your backend, ensuring accurate and secure analytics
- **Non-blocking**: Events are scheduled as background jobs, so they never slow down your mutations
- **Type-safe**: Full TypeScript support with proper types
- **Simple API**: Easy-to-use interface for tracking events
- **Flexible configuration**: Support for both environment variables and explicit configuration

## Installation

```bash
npm install @samhoque/convex-posthog
```

## Setup

### 1. Install the component in your Convex app

Create or update `convex/convex.config.ts`:

```ts
import { defineApp } from "convex/server";
import posthog from "@samhoque/convex-posthog/convex.config";

const app = defineApp();
app.use(posthog);

export default app;
```

### 2. Configure environment variables

Set these environment variables in your Convex deployment:

```bash
POSTHOG_API_KEY=your_api_key_here
POSTHOG_HOST=https://us.i.posthog.com  # Optional, defaults to US Cloud
# For EU Cloud use: https://eu.i.posthog.com
```

You can set these in the Convex dashboard or via the CLI:

```bash
npx convex env set POSTHOG_API_KEY your_api_key_here
npx convex env set POSTHOG_HOST https://us.i.posthog.com  # Or https://eu.i.posthog.com for EU Cloud
```

## Usage

### Basic Example

```ts
import { mutation } from "./_generated/server";
import { components } from "./_generated/api";
import { PostHog } from "@samhoque/convex-posthog";
import { v } from "convex/values";

// Initialize the PostHog component
const posthog = new PostHog(components.posthog, {
  // API key and host are read from environment variables by default
  // Or you can pass them explicitly:
  // apiKey: process.env.POSTHOG_API_KEY,
  // host: process.env.POSTHOG_HOST,
});

export const signupUser = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Your business logic here
    // ...

    // Track the signup event
    await posthog.trackUserEvent(ctx, {
      userId: args.userId,
      event: "user_signed_up",
      properties: {
        email: args.email,
        name: args.name,
        signupMethod: "email",
      },
    });

    return { success: true };
  },
});
```

### Tracking Custom Events

```ts
export const trackPurchase = mutation({
  args: {
    userId: v.string(),
    productId: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    // Your business logic
    // ...

    // Track the purchase event
    await posthog.trackUserEvent(ctx, {
      userId: args.userId,
      event: "product_purchased",
      properties: {
        productId: args.productId,
        amount: args.amount,
        currency: "USD",
      },
    });

    return { success: true };
  },
});
```

### Configuration Options

You can configure the PostHog component when instantiating it:

```ts
const posthog = new PostHog(components.posthog, {
  apiKey: "your_api_key",                 // Defaults to process.env.POSTHOG_API_KEY
  host: "https://us.i.posthog.com",       // Defaults to process.env.POSTHOG_HOST or US Cloud
  // For EU Cloud use: "https://eu.i.posthog.com"
  // For self-hosted use your domain
});
```

## API Reference

### `PostHog` Class

#### Constructor

```ts
new PostHog(component: PostHogComponent, options?: PostHogOptions)
```

**Options:**
- `apiKey` (string, optional): PostHog API key. Defaults to `POSTHOG_API_KEY` env var
- `host` (string, optional): PostHog host URL. Defaults to `POSTHOG_HOST` env var or `https://us.i.posthog.com` (US Cloud). Use `https://eu.i.posthog.com` for EU Cloud or your self-hosted domain.

#### `trackUserEvent(ctx, data)`

Track a user event asynchronously.

```ts
await posthog.trackUserEvent(ctx, {
  userId: string,        // Distinct ID for the user
  event: string,         // Event name
  properties?: object    // Optional event properties
});
```

**Parameters:**
- `ctx`: Mutation context (must have `scheduler` capability)
- `data.userId`: The unique identifier for the user
- `data.event`: Name of the event to track
- `data.properties`: Optional object with event properties

**Note:** This method schedules the tracking as a background job using `ctx.scheduler.runAfter(0, ...)`, which means:
- It won't block your mutation
- Analytics failures won't affect your app's functionality
- Events are tracked asynchronously

## How It Works

1. When you call `trackUserEvent`, it schedules a background action using Convex's scheduler
2. The background action uses the PostHog HTTP API directly (no Node.js dependencies required)
3. Events are sent to PostHog with automatic metadata (timestamp, lib version, etc.)
4. If tracking fails, it fails silently without affecting your app

## Development

To develop this component:

```bash
# Install dependencies
npm install

# Run the example app (generates types and starts dev server)
npm run dev

# Build the component
npm run build

# Run tests
npm test

# Type check
npm run typecheck
```

## License

Apache-2.0
