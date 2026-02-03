import type { Expand, FunctionReference } from "convex/server";
import type { GenericId } from "convex/values";
import type { RunMutationCtx } from "./types.js";

/** PostHog component API shape */
export type PostHogComponent = {
  lib: {
    trackEvent: FunctionReference<
      "action",
      "internal",
      {
        apiKey: string;
        host?: string;
        userId: string;
        event: string;
        properties?: Record<string, unknown>;
        setProperties?: Record<string, unknown>;
        setOnceProperties?: Record<string, unknown>;
      },
      null
    >;
  };
};

export type PostHogOptions = {
  /** PostHog API key. Defaults to POSTHOG_API_KEY environment variable. */
  apiKey?: string;

  /** PostHog host URL. Defaults to https://us.i.posthog.com (US Cloud). */
  host?: string;
};

/**
 * PostHog analytics component for Convex.
 *
 * @example
 * ```ts
 * const posthog = new PostHog(components.posthog);
 *
 * await posthog.trackUserEvent(ctx, {
 *   userId: "user_123",
 *   event: "user_created",
 *   properties: { email: "user@example.com" },
 *   setProperties: { name: "John Doe" },
 *   setOnceProperties: { first_login: Date.now() }
 * });
 * ```
 */
export class PostHog {
  private apiKey: string;
  private host: string;

  constructor(
    public component: PostHogComponent,
    options?: PostHogOptions
  ) {
    this.apiKey = options?.apiKey ?? process.env.POSTHOG_API_KEY ?? "";
    this.host = options?.host ?? process.env.POSTHOG_HOST ?? "https://us.i.posthog.com";
  }

  /** Track user events from mutations */
  async trackUserEvent(
    ctx: RunMutationCtx,
    data: {
      userId: string;
      event: string;
      properties?: Record<string, unknown>;
      setProperties?: Record<string, unknown>;
      setOnceProperties?: Record<string, unknown>;
    }
  ): Promise<void> {
    if (!this.apiKey) {
      console.warn("PostHog API key not configured, skipping event tracking");
      return;
    }

    await ctx.scheduler.runAfter(0, this.component.lib.trackEvent, {
      apiKey: this.apiKey,
      host: this.host,
      userId: data.userId,
      event: data.event,
      properties: data.properties,
      setProperties: data.setProperties,
      setOnceProperties: data.setOnceProperties,
    });
  }
}

export type OpaqueIds<T> =
  T extends GenericId<infer _T>
    ? string
    : T extends (infer U)[]
      ? OpaqueIds<U>[]
      : T extends ArrayBuffer
        ? ArrayBuffer
        : T extends object
          ? { [K in keyof T]: OpaqueIds<T[K]> }
          : T;

export type UseApi<API> = Expand<{
  [mod in keyof API]: API[mod] extends FunctionReference<
    infer FType,
    "public",
    infer FArgs,
    infer FReturnType,
    infer FComponentPath
  >
    ? FunctionReference<
        FType,
        "internal",
        OpaqueIds<FArgs>,
        OpaqueIds<FReturnType>,
        FComponentPath
      >
    : UseApi<API[mod]>;
}>;
