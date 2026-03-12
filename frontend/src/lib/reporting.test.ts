import { describe, expect, it } from "bun:test";
import { buildEmptyStateMessage, formatTermLabel } from "./reporting";

describe("reporting helpers", () => {
  it("formats term labels consistently", () => {
    expect(formatTermLabel("term2")).toBe("Term 2");
  });

  it("builds a generic empty-state message when no context is given", () => {
    expect(buildEmptyStateMessage()).toContain("will appear here");
  });

  it("references the provided context label", () => {
    expect(buildEmptyStateMessage("Term 3 - 2024")).toContain("Term 3 - 2024");
  });
});
