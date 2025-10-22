import { v } from "convex/values";
import { action } from "./_generated/server.js";

/**
 * Track events with PostHog.
 * @see https://posthog.com/docs/api/post-only-endpoints
 */
export const trackEvent = action({
  args: {
    apiKey: v.string(),
    host: v.optional(v.string()),
    userId: v.string(),
    event: v.string(),
    properties: v.optional(v.any()),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    if (!args.apiKey) {
      return;
    }

    if (!args.userId || !args.event) {
      console.warn("PostHog: userId and event are required", {
        userId: args.userId,
        event: args.event,
      });
      return;
    }

    try {
      const host = args.host ?? "https://us.i.posthog.com";
      const url = `${host}/i/v0/e/`;

      const payload = {
        api_key: args.apiKey,
        event: args.event,
        distinct_id: args.userId,
        properties: {
          ...args.properties,
          $lib: "convex-posthog",
          $lib_version: "0.1.1",
        },
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const responseText = await response
          .text()
          .catch(() => "Unable to read response");
        console.warn(`PostHog tracking failed: ${response.status} ${response.statusText}`, {
          responseBody: responseText,
          event: args.event,
          userId: args.userId,
          url,
        });
      }
    } catch (error) {
      console.warn("PostHog tracking failed:", error);
    }
  },
});
