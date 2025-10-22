import { mutation, query } from "./_generated/server";
import { components } from "./_generated/api";
import { PostHog } from "@samhoque/convex-posthog";
import { v } from "convex/values";

const posthog = new PostHog(components.posthog);

export const signupUser = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`Signing up user: ${args.email}`);

    await posthog.trackUserEvent(ctx, {
      userId: args.userId,
      event: "user_signed_up",
      properties: {
        email: args.email,
        name: args.name,
        signupMethod: "email",
      },
    });

    return { success: true, userId: args.userId };
  },
});

export const trackPurchase = mutation({
  args: {
    userId: v.string(),
    productId: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    console.log(`User ${args.userId} purchased product ${args.productId}`);

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

export const trackCustomEvent = mutation({
  args: {
    userId: v.string(),
    event: v.string(),
    properties: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await posthog.trackUserEvent(ctx, {
      userId: args.userId,
      event: args.event,
      properties: args.properties,
    });

    return { success: true };
  },
});

export const getUser = query({
  args: { userId: v.string() },
  handler: async (_ctx, args) => {
    return { userId: args.userId, message: "User data retrieved" };
  },
});
