# What A2UI can do today

Research for ticket #2. Checked on 2026-11-27 against a2ui.org, the `a2ui-project/a2ui` repository (formerly `google/A2UI`, which now redirects there), the npm registry, the published package contents, and OpenAI's API docs. Nothing was built or run: every claim below comes from a document or from reading shipped source, and the last section lists what that leaves unproven.

## The answer

### What A2UI is

A2UI is a format for describing a piece of screen as data. A Widget written in A2UI is a short JSON document that says "a column holding a slider, a number and a chart", plus a small bag of values (the "data model") that those pieces read from and write to. The browser draws it with components the app already owns. The AI never sends code, only this description, so it can only use building blocks ValueIt has approved.

Google released version 1.0 on 2026-11-11 and calls it the first stable version. It comes with an official React renderer and an official TypeScript library that turns a model's output into valid A2UI.

### The slider question

**When a Student drags a slider, the Widget updates in the browser by itself. Nothing goes to the AI model or to the server.**

- The slider writes its new value into the Widget's data model on every movement of the thumb.
- Every piece bound to that value redraws at once.
- A piece can also be bound to a *function* of values ("cost of equity, given this risk-free rate, this beta and this premium"). The renderer re-runs that function in the browser whenever one of its inputs changes.

What A2UI does *not* give us:

- **No arithmetic out of the box.** The standard function set only formats and validates (format a number, format currency, required field, and/or/not). There is no add or multiply, and no formula language.
- **No charts, tables or formula display out of the box.** The standard component set is 18 general pieces: text, image, layout, button, text field, checkbox, choice picker, slider, date input and a few more.
- **The AI cannot invent a calculation.** It can only wire together functions ValueIt has registered ahead of time.

So the finance has to live in ValueIt's own "catalog": our own components and our own functions, written once as normal code, which both the renderer and the AI are told about.

### Recommendation

1. **Target A2UI protocol v1.0.** Use the official packages `@a2ui/react` and `@a2ui/web_core` in the browser and `@a2ui/agent` on the server. Pin exact versions: the protocol is declared stable, but the packages are still numbered 0.x and have shipped breaking changes every two to three weeks.
2. **Build one ValueIt catalog and make it the single set of Widget building blocks.** It holds:
   - display components the standard set lacks: chart, table, formula, metric tile, and probably a proper number input;
   - finance functions: cost of equity, after-tax cost of debt, WACC, levered beta and so on, implemented once in tested code and shared with the Lesson's calculator.
3. **Cleanest pattern for instant Widgets: "our maths, the AI's wiring".** A Widget binds sliders to values, and binds numbers and charts to our finance functions of those values. The AI chooses which inputs and outputs to show and how to lay them out. It never writes the maths, so it cannot get the maths wrong. Where a Widget is too special for that, register it as one big custom component with its own internal logic. It is still drawn by the same renderer.
4. **Use the same renderer for pre-built Widgets.** A stored Widget is one saved JSON document, drawn with no AI call. One Widget system serves both the fixed Lesson path and the Chatbot.
5. **Have the OpenAI model write A2UI as plain streamed text, not as OpenAI "structured output".** Put the instructions that `@a2ui/agent` generates from our catalog into the system prompt, stream the reply through OpenAI's own SDK, and pass each chunk to `@a2ui/agent`, which checks it and emits ready-to-draw A2UI messages. Send those to the browser as they are produced.
6. **Treat A2UI screens as browser-only islands inside the Next.js app.** They do not draw on the server.

### What it means for ValueIt

- **Fast for the Student:** yes for interaction, by design. Dragging is local. The wait is only for the first appearance of an AI-generated Widget, and A2UI cannot shorten the time a model spends thinking before it writes its first word.
- **One Widget system:** yes. The same building blocks, the same renderer and the same saved format for Widgets written ahead of time and Widgets generated on the spot. A generated Widget can also be saved and shown again later.
- **Fewest vendors:** A2UI adds no vendor and no account. It is open-source code (Apache 2.0) that runs inside our own app on Vercel. The route recommended here needs no extra framework between the app and OpenAI.
- **The real work is the catalog.** A2UI gives us the plumbing. The chart, the table, the formula view and every finance function are ours to build and test.
- **The main risk is youth, not capability.** The server library is five weeks old. Coding agents' built-in knowledge of A2UI is out of date, so they must read the installed package's own docs rather than write from memory.

## Evidence

### 1. Version and how settled it is

| Thing | State on 2026-11-27 | Source |
| --- | --- | --- |
| Protocol v1.0 | "Current". v0.9.1 and v0.9 "previous", v0.8 "deprecated" | [versions.json](https://github.com/a2ui-project/a2ui/blob/main/specification/versions.json), [roadmap](https://a2ui.org/roadmap/) |
| 1.0 release | 2026-11-11, "the first stable version of our open protocol" | [Google Developers Blog](https://developers.googleblog.com/a2ui-10-build-delightful-fast-reliable-agentic-experiences) |
| `@a2ui/react` | 0.16.1, published 2026-11-23. First release 0.8.0 on 2026-03-17 | [npm](https://www.npmjs.com/package/@a2ui/react), [registry record](https://registry.npmjs.org/@a2ui/react/latest) |
| `@a2ui/web_core` | 0.16.1 | [registry record](https://registry.npmjs.org/@a2ui/web_core/latest) |
| `@a2ui/agent` | 0.2.1, published 2026-11-23. First release 2026-10-19 | [registry record](https://registry.npmjs.org/@a2ui/agent/latest) |

- What 1.0 changed from 0.9: the binding keys gained an `@` prefix (`@path`, `@call`), a whole Widget can arrive in one `createSurface` message, components from several catalogs can mix on one surface, and functions can be called across the wire in both directions. Catalogs written for 0.9 do not work with 1.0. Source: [v1.0 specification](https://a2ui.org/specification/v1.0-a2ui/), [evolution guide](https://a2ui.org/specification/v1.0-evolution-guide/).
- The renderer packages are not as settled as the protocol. `@a2ui/react` shipped breaking changes in 0.13.0 (2026-10-09), 0.15.0 (2026-11-02) and 0.16.0 (2026-11-23). `@a2ui/agent` shipped breaking changes in 0.0.2, 0.1.0 and 0.2.0, which is three of the four releases since its first. Source: [`@a2ui/react` changelog](https://github.com/a2ui-project/a2ui/blob/main/typescript/renderers/react/CHANGELOG.md), [`@a2ui/agent` changelog](https://github.com/a2ui-project/a2ui/blob/main/typescript/agents/a2ui_agent/CHANGELOG.md).
- Published guidance lags the code. Context7's maintainer notes for the A2UI repository still say v0.9.1 is current and v1.0 a release candidate, and an older renderer table on a2ui.org listed React support for v1.0 as "planned". The package README and the SDK page say v1.0 is supported. Source: [`@a2ui/react` README](https://github.com/a2ui-project/a2ui/blob/main/typescript/renderers/react/README.md), [SDKs](https://a2ui.org/concepts/sdks/).

### 2. The React renderer in a Next.js App Router app

- It is official: published by Google's `a2ui-team`, supports React 17, 18 and 19, and renders v0.9, v0.9.1 and v1.0 from one package. Source: [registry record](https://registry.npmjs.org/@a2ui/react/latest), [README](https://github.com/a2ui-project/a2ui/blob/main/typescript/renderers/react/README.md).
- How it is used: create a `MessageProcessor` with the catalogs, feed it A2UI messages, and render `<A2uiSurface surface={...} />` for each surface. Source: [README quick start](https://github.com/a2ui-project/a2ui/blob/main/typescript/renderers/react/README.md), [client integration guide](https://a2ui.org/guides/client-integration/).
- **It draws only in the browser.** Since 0.13.0 the standard components are web components (built with Lit) and "the basic catalog no longer server-renders, since custom elements produce no markup outside a browser". Source: [changelog 0.13.0](https://github.com/a2ui-project/a2ui/blob/main/typescript/renderers/react/CHANGELOG.md), [PR #2630](https://github.com/a2ui-project/a2ui/pull/2630).
- Versions 0.13.0 to 0.16.0 crashed a server-rendering app merely by being imported ("HTMLElement is not defined"). Fixed in 0.16.1, four days before this note. I confirmed the guard is present in the published 0.16.1 bundle. Source: [issue #3158](https://github.com/a2ui-project/a2ui/issues/3158), [issue #3420](https://github.com/a2ui-project/a2ui/issues/3420), [changelog 0.16.1](https://github.com/a2ui-project/a2ui/blob/main/typescript/renderers/react/CHANGELOG.md).
- The package root carries no `"use client"` marker (checked in the published 0.16.1 bundle), so ValueIt wraps the surface in its own client component. The safe shape is a client-only island, loaded with `next/dynamic` and `ssr: false`. A third-party walkthrough written against 0.15 reached the same shape. Source: [dev.to walkthrough, 2026-11-13](https://dev.to/zforzain2000/a2ui-10-in-nextjs-the-deep-dive-and-your-first-agent-screen-43kk) (not a primary source).
- There is no official Next.js guide for `@a2ui/react` used directly. The official Next.js material goes through CopilotKit and AG-UI, which is an extra framework ValueIt does not need. Source: [agent integration guide, "AG-UI and CopilotKit"](https://a2ui.org/guides/agent-integration/).
- Styling: standard components render in the page's normal DOM and are themed with `--a2ui-*` CSS variables. Custom components are ordinary React and can use the app's own styling. Source: [README, "Styling"](https://github.com/a2ui-project/a2ui/blob/main/typescript/renderers/react/README.md), [client integration guide, theme tokens](https://a2ui.org/guides/client-integration/).
- Dependency to know about: the packages are built on Zod 3 (`zod ^3.25.76` is a peer dependency). The maintainers record that a library needing Zod 4 could not be used alongside it in their own repository. Source: [registry record](https://registry.npmjs.org/@a2ui/react/latest), [`@a2ui/agent` known gaps](https://github.com/a2ui-project/a2ui/blob/main/typescript/agents/a2ui_agent/KNOWN_GAPS.md).

### 3. What the standard set contains

- 18 components: `Text`, `Image`, `Icon`, `Video`, `AudioPlayer`, `Row`, `Column`, `List`, `Card`, `Tabs`, `Modal`, `Divider`, `Button`, `TextField`, `CheckBox`, `ChoicePicker`, `Slider`, `DateTimeInput`.
- 14 functions: `required`, `regex`, `length`, `numeric`, `email`, `formatString`, `formatNumber`, `formatCurrency`, `formatDate`, `pluralize`, `openUrl`, `and`, `or`, `not`.
- Source: [basic catalog JSON](https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json), [catalogs page](https://a2ui.org/concepts/catalogs/).

Against what a finance Lesson needs:

| Need | In the standard set? | Note |
| --- | --- | --- |
| Slider | Yes | `min`, `max`, `steps`, `label`, `value` |
| Number input | Partly | `TextField` has a `number` variant, but its value is text, not a number |
| Chart | No | An official Vega chart catalog exists in the repository but is not published to npm |
| Table | No | `List`, `Row` and `Column` can lay out rows, but there is no table |
| Formula display | No | `Text` renders simple Markdown through a renderer the app supplies |
| Arithmetic | No | Formatting, validation and boolean logic only |

Source for the chart catalog: [repository README, packages table](https://github.com/a2ui-project/a2ui/blob/main/README.md). `npm view @a2ui/catalog-vegachart` returned "not found" on 2026-11-27.

### 4. How a slider updates the Widget without the AI

Three mechanisms, all local to the browser.

**a. Two-way binding.** Input components write to the data model the moment the Student interacts, and everything bound to the same value updates.

> "User inputs (keystrokes, toggles) do **not** automatically trigger network requests to the agent. The updated state is sent to the agent only when a specific **User Action** is triggered (e.g., a `Button` click)."

Source: [v1.0 specification, "Two-way binding & input components"](https://a2ui.org/specification/v1.0-a2ui/), [data binding](https://a2ui.org/concepts/data-binding/). The shipped slider listens to the browser's `input` event, which fires continuously during a drag, not only on release: [Slider.ts](https://github.com/a2ui-project/a2ui/blob/main/typescript/core/web_core/src/universal/basic_catalog/components/Slider.ts).

**b. Functions in bindings.** A component property can be a function call whose arguments are bound values.

> "Component properties can compute their value from a function call. The client automatically re-evaluates the function whenever the underlying bound data changes."

Source: [actions and functions](https://a2ui.org/concepts/actions-and-functions/). A catalog can add its own functions, and the guide lists "Local formatting & computation: computing derived values reactively from bound data-model fields" as a use, with return types `string`, `number`, `array`, `object` or `any`. Source: [defining a catalog, "Custom functions and input validators"](https://a2ui.org/guides/defining-a-catalog/). In the shipped code a call is wrapped in a computed signal over its arguments: [data-context.ts](https://github.com/a2ui-project/a2ui/blob/main/typescript/core/web_core/src/resolution/data-context.ts).

**c. Custom components with their own logic.** A custom React component receives its bound properties already resolved, plus a setter for each bindable one, and re-renders when they change. It can hold any logic and any internal state. Source: [README, "Defining Custom Components" and "Generic Binder Features"](https://github.com/a2ui-project/a2ui/blob/main/typescript/renderers/react/README.md).

Limits:

- Function calls can be nested, but the published `@a2ui/web_core` 0.16.1 caps nesting at 5 levels (`MAX_FUNC_CALL_DEPTH = 5`). Building long formulas out of tiny add and multiply functions is therefore a poor fit, and it would also let the model wire a formula wrongly. Whole finance functions are the better unit. Source: [integrity-checker.js in the published 0.16.1 package](https://cdn.jsdelivr.net/npm/@a2ui/web_core@0.16.1/src/validation/integrity-checker.js). The constant is no longer in the same file on the repository's main branch, so treat the exact limit as something that may change.
- A function the browser does not implement is sent to the server instead (an "agent function", new in 1.0). That is a round trip to our server code, not to the AI model. It is useful for data lookups and wrong for slider maths. Source: [actions and functions, "Agent functions"](https://a2ui.org/concepts/actions-and-functions/).
- The AI hears about a Widget only when a component fires an "event" (for example a button), or when the Student next sends a message if the Widget was created with `sendDataModel: true`. That second option lets the Chatbot see where the Student left the sliders. Source: [data binding, "Synchronizing state back to the agent"](https://a2ui.org/concepts/data-binding/).

What a Widget document looks like. This is illustrative, assembled from the documented pieces and not run. `costOfEquity` and `formatPercent` stand for functions ValueIt would register:

```json
{
  "version": "1.0",
  "createSurface": {
    "surfaceId": "cost-of-equity",
    "catalogId": "https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json",
    "components": [
      {"id": "root", "component": "Column", "children": ["beta", "result"]},
      {"id": "beta", "component": "Slider", "label": "Beta", "min": 0, "max": 3, "steps": 60,
       "value": {"@path": "/inputs/beta"}},
      {"id": "result", "component": "Text",
       "text": {"@call": "formatPercent", "catalogId": "https://example.com/catalogs/lesson/v1/catalog.json",
                "args": {"value": {"@call": "costOfEquity",
                                   "catalogId": "https://example.com/catalogs/lesson/v1/catalog.json",
                                   "args": {"riskFree": {"@path": "/inputs/riskFree"},
                                            "beta": {"@path": "/inputs/beta"},
                                            "premium": {"@path": "/inputs/premium"}}}}}}
    ],
    "dataModel": {"inputs": {"riskFree": 0.04, "beta": 1.1, "premium": 0.05}}
  }
}
```

### 5. Defining a catalog and giving it to the model

- A catalog is an id (a URL-shaped string), a set of component descriptions, a set of function descriptions, and optional written instructions for the model. Source: [catalogs](https://a2ui.org/concepts/catalogs/).
- In the browser, each component is a name, a Zod schema of its properties, and a React function. Each function is a name, a return type, a schema of its arguments, and the code. They are grouped with `new Catalog(id, '1.0', components, functions)` and passed to the `MessageProcessor` next to the standard catalog. Source: [README, "Defining Catalogs and Functions"](https://github.com/a2ui-project/a2ui/blob/main/typescript/renderers/react/README.md), [defining a catalog](https://a2ui.org/guides/defining-a-catalog/).
- On the server, the same catalog goes to `A2uiGenerator` from `@a2ui/agent`. It produces a `promptSnippet`: the format rules, the signature of every component and function, the catalog's instructions and any examples. That text is appended to the system prompt. The same object then checks everything the model writes against the catalog. Source: [`@a2ui/agent` README](https://github.com/a2ui-project/a2ui/blob/main/typescript/agents/a2ui_agent/README.md), [agent integration guide](https://a2ui.org/guides/agent-integration/).
- When server and browser share a language and a repository, the catalog can be defined in code. A separate `catalog.json` is needed only when they differ. Source: [defining a catalog, "When you need a catalog.json file"](https://a2ui.org/guides/defining-a-catalog/).
- A catalog can be trimmed per request, so the model is shown only the components a situation needs, and examples are written once as A2UI JSON. Source: [agent integration guide, "Customize catalogs, examples, and inference formats"](https://a2ui.org/guides/agent-integration/).
- In 1.0 a Widget can mix standard and custom components by tagging the custom ones with `@catalogId`. Source: [defining a catalog](https://a2ui.org/guides/defining-a-catalog/).

### 6. Streaming, and when the first piece shows

- On the wire, a Widget is a sequence of JSON messages and the renderer draws as they arrive. The React renderer shows nothing for a surface until its root component exists, shows nothing for a child that has not arrived yet, and fills each in when it does. Source: [v1.0 specification, introduction](https://a2ui.org/specification/v1.0-a2ui/), [changelog 0.15.0 and 0.11.0](https://github.com/a2ui-project/a2ui/blob/main/typescript/renderers/react/CHANGELOG.md).
- The model does not write that JSON directly. By default it writes "A2UI Express", a compact one-line-per-component notation, and `@a2ui/agent` compiles it into the JSON messages. Google reports about a third of the output tokens of raw JSON with equal accuracy. Those measurements are on Gemini models only. Source: [inference formats](https://a2ui.org/concepts/inference-formats/), [Google Developers Blog, 2026-10-27](https://developers.googleblog.com/fast-reliable-a2ui/).
- Express streams line by line since `@a2ui/agent` 0.1.0 (2026-11-02). The first message is released when the line that defines the root has arrived, and later lines arrive as small additions. Text is shown while it is still being written. Source: [`@a2ui/agent` changelog 0.1.0](https://github.com/a2ui-project/a2ui/blob/main/typescript/agents/a2ui_agent/CHANGELOG.md), [README, "Streaming"](https://github.com/a2ui-project/a2ui/blob/main/typescript/agents/a2ui_agent/README.md). Older write-ups, including Google's October post, say Express does not stream. That was true until 0.1.0.
- If the model writes raw JSON instead and uses the 1.0 single-message form, nothing is released until the whole message closes. This is by design. Source: [issue #3521](https://github.com/a2ui-project/a2ui/issues/3521).
- So the first piece is visible as soon as the model has started writing and has produced a line or two. A2UI does nothing about the time before the model's first word. If the model thinks for long before it writes, the Student waits that long.
- To the browser, the simplest transport is one streamed HTTP response (server-sent events), one JSON message per event. The official guide shows exactly that. Source: [agent integration guide, "Connect to a transport"](https://a2ui.org/guides/agent-integration/).
- If a streamed Widget fails validation part-way, the part already sent stays on screen. The library hands back what was valid, and the choice is to repair in place or delete and regenerate. Source: [agent integration guide, "Non-streaming generation and validation retry"](https://a2ui.org/guides/agent-integration/).

### 7. Making an OpenAI model emit valid A2UI with OpenAI's own SDK

`@a2ui/agent` does not care which model is used. It gives text for the prompt and takes text back. Google's own guide says "substitute any streaming LLM SDK". Source: [agent integration guide](https://a2ui.org/guides/agent-integration/).

The recommended route:

1. At start-up, build an `A2uiGenerator` from the standard catalog and the ValueIt catalog.
2. Per request, put `processor.promptSnippet` after ValueIt's own instructions in the system prompt.
3. Call OpenAI's Responses API with `stream: true` and feed each `response.output_text.delta` into `stream.feed(...)`. Each call returns plain-text parts, which are the Chatbot's words, and A2UI parts, which are checked messages ready for the browser. Source for the event names: [OpenAI streaming guide](https://developers.openai.com/api/docs/guides/streaming-responses).
4. On a validation error, show what was valid, then retry once with the error text or fall back to a plain-text answer. Source: [agent integration guide, validation retry](https://a2ui.org/guides/agent-integration/), [specification, "the prompt-generate-validate loop"](https://a2ui.org/specification/v1.0-a2ui/).

Why not OpenAI structured output with the A2UI schema:

- OpenAI's strict mode rejects schemas that use `allOf` or `not`, requires every field to be marked required, requires `additionalProperties: false` on every object, and requires the root to be a plain object. Source: [OpenAI structured outputs guide](https://developers.openai.com/api/docs/guides/structured-outputs).
- A2UI's catalog schema uses `allOf` (the slider is built that way), uses `not`, has many optional properties, and carries a free-form data model. Source: [basic catalog JSON](https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json).
- So the published schema cannot be handed to OpenAI as it is. We would maintain a second, simplified schema by hand and still pay roughly three times the output tokens.
- A2UI itself moved from "structured output first" to "prompt first" at v0.9. Source: [v0.9.1 specification, "Changes from previous versions"](https://a2ui.org/specification/v0.9.1-a2ui/).

Why not a tool call: it works (the library has `validatePayload` for "the argument of a tool call"), but the argument is raw JSON, so it costs more tokens. As far as I can tell from the docs it also gives up the line-by-line Express streaming described above, because the library's stream reader expects the model's text, not a tool argument. I did not test that. Source: [`@a2ui/agent` README, "Chat and canvas"](https://github.com/a2ui-project/a2ui/blob/main/typescript/agents/a2ui_agent/README.md).

What goes wrong, from the maintainers' own notes and issues:

- **No evidence for OpenAI models.** Every published accuracy and speed figure is for Gemini. How reliably an OpenAI model writes Express for our catalog has to be measured.
- **A dropped opening tag.** If the model forgets the opening `<a2ui>` tag while streaming, the block is shown to the Student as text instead of a Widget. Source: [known gaps](https://github.com/a2ui-project/a2ui/blob/main/typescript/agents/a2ui_agent/KNOWN_GAPS.md).
- **Silent truncation.** If the model's output is cut off, the result can look like a finished Widget. The library does not signal the cut. Source: [known gaps, "Truncation signal lost at compile boundary"](https://github.com/a2ui-project/a2ui/blob/main/typescript/agents/a2ui_agent/KNOWN_GAPS.md).
- **Unknown components, missing required properties, dangling child references and misspelled function names.** The TypeScript library rejects all of these before they reach the browser. Source: [known gaps](https://github.com/a2ui-project/a2ui/blob/main/typescript/agents/a2ui_agent/KNOWN_GAPS.md), [changelog](https://github.com/a2ui-project/a2ui/blob/main/typescript/agents/a2ui_agent/CHANGELOG.md).
- **The fixed rules in the prompt name two standard components** (`DateTimeInput`, `Image`) even when the catalog has been trimmed to exclude them, so the model may reach for them. Source: [known gaps](https://github.com/a2ui-project/a2ui/blob/main/typescript/agents/a2ui_agent/KNOWN_GAPS.md).
- **Prompt size.** Google measured a median of about 6,000 input tokens for the Express instructions with the standard catalog (Gemini's count). Our catalog adds to that. Source: [inference formats, benchmarks](https://a2ui.org/concepts/inference-formats/).
- **Express is still filed as a proposal** in the specification folder although it is the library default, and it had real bugs as recently as late October, since fixed. Source: [issue #3599](https://github.com/a2ui-project/a2ui/issues/3599), [issue #3598](https://github.com/a2ui-project/a2ui/issues/3598). Because Express is compiled on our server into the stable JSON, a change there does not touch stored Widgets or the browser.

### 8. Stored, pre-built Widgets

Yes. The renderer does not know or care where messages come from.

- The official quick start renders a hard-coded list of messages with no agent at all. Source: [README quick start](https://github.com/a2ui-project/a2ui/blob/main/typescript/renderers/react/README.md).
- Google's demo app "opens on a recorded sample trip" when no model key is present. Source: [quickstart instructions](https://a2ui.org/quickstart/agent/web.md).
- The docs name the use: "Regulated or deterministic workflows can also construct wire messages directly in server code ... and send the resulting JSON to the renderer without an LLM compilation step." Source: [inference formats](https://a2ui.org/concepts/inference-formats/).
- Stored documents can be checked automatically with `validatePayload(catalogs, messages)`, the same check the renderer applies. Source: [serving A2UI from an MCP server, "Validate server payloads"](https://a2ui.org/guides/a2ui-over-mcp/).
- In 1.0 a whole Widget, with its starting values, fits in one `createSurface` message, so one Widget is one JSON document. Source: [v1.0 specification, "Changes from previous versions"](https://a2ui.org/specification/v1.0-a2ui/).

Two cautions:

- A stored Widget still draws only in the browser (section 2). On the fixed path the Lesson's text can arrive in the page itself, and its Widgets appear when the page's script has loaded.
- CopilotKit's separate A2UI renderer has an open report that surfaces replayed from saved history after first load never appear. That is a different package from the official `@a2ui/react`, and it is one more reason to use the official one directly and test replay early. Source: [CopilotKit issue #6690](https://github.com/CopilotKit/CopilotKit/issues/6690).

## Open questions

1. **Does an OpenAI model write valid Express for the ValueIt catalog, and how fast?** No public data. Belongs with the speed prototype (#15) and the model-speed research (#3).
2. **What exactly is in the ValueIt catalog?** Which components, and which finance functions, shared with the calculator (#16). This is the "Widget building blocks" item on the map.
3. **How is one catalog definition shared between server and browser** without pulling React code into the server? The docs show both sides separately. The file layout needs a small prototype.
4. **How long before a stored Widget appears on the fixed path**, given it draws only in the browser? Measure in the Lesson screen prototype (#14).
5. **Should the Chatbot see the Student's slider positions** (`sendDataModel`)? A product question for the Chatbot's role (#10).
6. **Where do stored Widget documents live and how are they written?** By hand, by a coding agent, or with Google's visual A2UI Composer. Belongs with "Writing and storing a Lesson".
7. **Upgrade policy.** With 0.x packages changing every few weeks, who decides when to move, and what test catches a break?

## What I could not verify

- **Nothing was run.** That a slider drives a custom function and a chart smoothly is established from the specification, the guides and the shipped source, not from a working page.
- **Server rendering of `A2uiSurface`.** An issue reporting that it throws during server rendering ([#2080](https://github.com/a2ui-project/a2ui/issues/2080)) could not be confirmed as fixed. The client-only island avoids the question.
- **`@a2ui/agent` on Vercel.** It is plain JavaScript and should run in a normal Node function. Not tried. The Edge runtime is untested.
- **Bundle size** added to the page by the renderer, which includes Lit alongside React.
- **A written compatibility promise for 1.0.** Google calls it stable and the repository calls the wire format "wire-stable". I found no policy stating what may change within 1.x.
- **What changed in the specification text between June and the November release.** Its header says "Last Updated: Jun 8, 2026".
- **A loading-placeholder API** for half-arrived Widgets is proposed but not shipped ([#2013](https://github.com/a2ui-project/a2ui/issues/2013)). The app must draw its own "working" state.

## How this was researched

- Library docs through Context7 first (A2UI, OpenAI), then a2ui.org pages in their Markdown editions, raw files from the `a2ui-project/a2ui` repository, the npm registry, and the published tarballs of `@a2ui/react` 0.16.1, `@a2ui/web_core` 0.16.1 and `@a2ui/agent` 0.2.1 (read, not executed).
- Search providers: Parallel, Octen and Firecrawl. Tavily was not connected in this session. Parallel's search connector hit a rate limit after the first round, so later page reads went through Parallel's command-line tool.
- A local A2UI skill was used as a lead. Its claims (v1.0 current, package names, import paths) matched the primary sources.
