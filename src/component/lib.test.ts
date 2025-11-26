/// <reference types="vite/client" />

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema.js";
import { api } from "./_generated/api.js";
import { modules } from "../test.js";

describe("PostHog component lib", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test("trackEvent accepts valid arguments", async () => {
    const t = convexTest(schema, modules);

    // Test that the action can be called without throwing
    // Note: In a real test environment, you'd mock the PostHog client
    // For now, we just verify the function signature is correct
    await expect(
      t.action(api.lib.trackEvent, {
        apiKey: "test-key",
        host: "https://app.posthog.com",
        userId: "user_123",
        event: "test_event",
        properties: { test: true },
      })
    ).resolves.toBeNull();
  });

  test("trackEvent handles missing apiKey gracefully", async () => {
    const t = convexTest(schema, modules);

    // Should not throw when apiKey is empty
    await expect(
      t.action(api.lib.trackEvent, {
        apiKey: "",
        userId: "user_123",
        event: "test_event",
      })
    ).resolves.toBeNull();
  });

  test("trackEvent accepts optional properties", async () => {
    const t = convexTest(schema, modules);

    // Test without properties
    await expect(
      t.action(api.lib.trackEvent, {
        apiKey: "test-key",
        userId: "user_123",
        event: "test_event",
      })
    ).resolves.toBeNull();
  });
});
