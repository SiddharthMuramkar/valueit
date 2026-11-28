import { readRendererCapabilities } from "@a2ui/agent";
import { createComponentImplementation } from "@a2ui/react";
import { Catalog, MessageProcessor } from "@a2ui/web_core";
import { expect, test } from "vitest";
import { z } from "zod";

test("the agent reads a React renderer's A2UI 1.0 catalog", () => {
  const label = createComponentImplementation(
    { name: "Label", schema: z.object({ text: z.string() }) },
    ({ props }) => props.text,
  );
  const catalog = new Catalog("urn:test:catalog", "1.0", [label], []);
  const renderer = new MessageProcessor([catalog]);

  const capabilities = readRendererCapabilities({
    a2uiRendererCapabilities: renderer.getRendererCapabilities({
      versions: ["1.0"],
      includeInlineCatalogs: true,
    }),
  });

  expect(capabilities?.["1.0"].inlineCatalogs).toMatchObject([
    {
      catalogId: "urn:test:catalog",
      components: { Label: { properties: { text: { type: "string" } } } },
    },
  ]);
});
