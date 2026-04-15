import { describe, expect, it } from "vitest";
import { formatNotionApiError } from "./notion-api.js";

describe("formatNotionApiError", () => {
  it("adds a share hint for restricted resources", () => {
    const message = formatNotionApiError({
      status: 403,
      body: JSON.stringify({
        code: "restricted_resource",
        message: "This page is not shared with the integration.",
        request_id: "req-123",
      }),
      parentPageId: "parent-abc",
    });

    expect(message).toContain("Notion page creation failed (403 restricted_resource)");
    expect(message).toContain("Share parent page parent-abc with the Notion integration.");
    expect(message).toContain("Request id: req-123.");
  });
});
