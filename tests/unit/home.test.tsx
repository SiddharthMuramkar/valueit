import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import Home from "@/app/page";

test("the home page introduces the finance course", () => {
  expect(renderToStaticMarkup(<Home />)).toContain(
    "A guided course in finance.",
  );
});
