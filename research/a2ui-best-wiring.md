# CopilotKit or the official renderer: which makes the best A2UI Widgets

Research for the ticket [CopilotKit or the official renderer: which makes the best A2UI Widgets](https://github.com/SiddharthMuramkar/valueit/issues/26). It follows [What A2UI can do today](https://github.com/SiddharthMuramkar/valueit/issues/2) and its file, [`research/a2ui-today.md`](https://github.com/SiddharthMuramkar/valueit/blob/research/a2ui-today/research/a2ui-today.md). That file set CopilotKit aside in one line as "an extra framework ValueIt does not need". The owner has asked whether that is right, so this note tests the line instead of defending it.

Checked on 2026-11-28 against CopilotKit's docs and published packages, a2ui.org, the `a2ui-project/a2ui` and `CopilotKit/CopilotKit` repositories, the npm registry and Google's developer blog. Nothing was built or run: every claim comes from a document or from reading shipped source, and "What I could not confirm" lists what that leaves open.

Two decisions from the owner on 2026-11-28 shape the answer: every Widget is built live by the AI and none is made ahead, and the Widgets are the centre of the product and must look first-class.

## The answer

### Recommendation

**Do not use CopilotKit. Wire A2UI directly with Google's three official packages, and spend the effort on ValueIt's own catalog of Widget building blocks.** The earlier one-line dismissal was too quick: CopilotKit is a serious option, and Google's own A2UI tools are built with it. The conclusion still holds after a proper look, and it holds on Widget quality first.

The six facts it rests on:

1. **A Widget's look comes from the catalog, not from the wiring.** A2UI 1.0 carries no colours, fonts or styling at all. A Widget looks exactly as good as the building blocks the app owns. CopilotKit does not make them look better. It offers a ready set of 69, and its own docs call their default look "neutral".
2. **CopilotKit cannot carry ValueIt's finance maths the way ValueIt planned.** The plan is "our maths, the AI's wiring": present value, cost of equity and the rest are written once as checked code, and the AI only connects a slider to a formula to a chart. Google's renderer supports that. CopilotKit's catalogs accept only a fixed list of built-in functions as live values. What it offers instead is a function called `calc`, where the AI writes the arithmetic itself.
3. **In CopilotKit's A2UI 1.0 engine, the Chatbot cannot change a value the Student has touched.** Its docs say so plainly. ValueIt's glossary says the opposite of the Chatbot: it "sees what the Student sets on a Widget and can change it". In official A2UI the Chatbot moves a slider with one small message.
4. **CopilotKit does not fit "OpenAI's own SDK".** Its built-in AI layer runs on Vercel's AI SDK. To keep OpenAI's own SDK we would write the translator between OpenAI and CopilotKit by hand, which is the very work CopilotKit is meant to save.
5. **Saved Widgets would need CopilotKit's hosted service or code of our own either way.** Without the service, CopilotKit's built-in stores keep history in the memory of one running copy of the app, or in one local file. Neither holds on Vercel. The service means a new account, a new key and a bill.
6. **It is heavy, and its A2UI 1.0 support is marked experimental.** Its server package has 45 direct dependencies against 2 for Google's. Its 1.0 engine "can change", follows an October draft of the specification, and leaves parts of 1.0 out.

### What CopilotKit and AG-UI are

- **A2UI** is the language a Widget is written in.
- **AG-UI** is a standard pipe between an AI program on a server and a screen. It carries the AI's words, its tool calls, shared state, and A2UI Widgets. The CopilotKit team developed it with partners.
- **CopilotKit** is a toolkit built on that pipe: a ready chat window, a server piece that connects to many AI frameworks, and helpers for shared state, pausing for a person's answer, and drawing AI-made screens. The code is open source and free. The company sells a hosted service, CopilotKit Intelligence, for saved conversations, memory and usage analytics.

### What CopilotKit would add, and what the direct route does instead

| Need | With CopilotKit | Direct, with the official packages |
| --- | --- | --- |
| Chat pane | Ready-made and restylable | ValueIt builds its own. The Lesson screen is a custom design in any case |
| Pipe from server to browser | AG-UI | One streamed web response, as Google's own guide shows |
| Checking the AI's Widget, and repair | Built in | The check is built into Google's server package. The retry is about 30 lines, shown in Google's guide |
| Ready building blocks | 69, including a table, a chart and a formula view | 18 plain basics. ValueIt builds its own, which a first-class look needs anyway |
| A Widget in a fixed part of the page | Documented for the experimental engine | Yes, natively |
| Saved conversations and Widgets | The hosted service, or our own storage code | Our own storage code, in the database ValueIt already has |
| Our own maths as live values | No | Yes |
| The Chatbot overrides what the Student set | No, in the 1.0 engine | Yes |
| Connecting many AI frameworks | Yes | Not needed: ValueIt calls one model |

### The wiring

1. **The screen.** The Lesson screen holds ValueIt's own chat pane and the Widget pane side by side. Google's React renderer (`@a2ui/react`) draws the Widget pane from ValueIt's catalog. As the earlier research found, this part of the page draws only in the browser.
2. **A turn.** When the Student sends a message or presses a button on a Widget, the browser posts it to one route in the Next.js app, together with what the Student has currently set on the Widget.
3. **The call.** That route puts together the instructions: ValueIt's rules, the Lesson Plan, and the description of the catalog with example Widgets, which Google's server package (`@a2ui/agent`) writes from the catalog. It calls the model through OpenAI's own SDK and streams the reply.
4. **The split.** As the reply arrives, `@a2ui/agent` separates it. The Chatbot's words go straight to the chat pane. Widget parts are checked against the catalog and against what is already on screen.
5. **Pass or repair.** A Widget that passes goes to the browser and is saved in the database. A Widget that fails goes back to the model once with the reason. If it fails again, the Chatbot answers in words.
6. **Small changes.** The Chatbot does not rebuild a Widget to change it. It sends a new value ("set beta to 1.5") or adds a piece to the Widget already on screen.
7. **Earlier Widgets.** To show a Student an earlier Widget again, the saved messages are replayed through the same renderer, with no AI call.

No new vendor, no new account and no new key. Everything runs inside the one Next.js app on Vercel.

### What makes a Widget look first-class

Three things decide how a Widget looks and moves, and all three are ValueIt's to design:

1. **The building blocks.** Build ValueIt's own catalog on the tools already chosen in [The leanest app stack for AI coding agents on Vercel](https://github.com/SiddharthMuramkar/valueit/issues/8): shadcn/ui and Tailwind for the pieces, Recharts 3 for charts, plus KaTeX for formulas and Motion for movement. Each piece is an ordinary React component, so a designer or a coding agent can polish it like any other part of the app.
2. **How much the AI is allowed to arrange.** Opinion: give the AI a few larger, designed pieces with slots, not many tiny ones. A Widget frame with places for a title, the controls, the result and the picture. A slider that already shows its label and value. A metric tile. A chart. A table. A formula line with live numbers. A Test intuition block. The AI fills the slots. Layout quality then comes from the design, not from the AI's taste on the day. The catalog can also state which piece may sit inside which, and carry written house rules and example Widgets for the AI.
3. **Movement.** The renderer adds none. A piece that has not arrived takes no space and then appears. So ValueIt's pieces animate their own entrance, charts glide between values while a slider moves (Recharts does this by itself), and the Widget pane shows a designed "building" state while the AI works. Opinion: since speed is not weighed, hold a new Widget until it is complete and has passed its check, then reveal it once. A Student then never sees a half-built Widget.

Opinion: do not use Google's 18 standard pieces for anything a Student sees. They are generic, and can be restyled only through colour and font settings. ValueIt's own layout pieces cost little and keep one look across the whole screen.

Existing catalogs were checked. None is good enough to adopt:

- Google's own chart catalog (Vega charts) is still not published.
- The one community catalog Google lists is for maps.
- CopilotKit's 69 pieces are the richest ready set, with a table, a chart and a formula view. They work only inside CopilotKit, and look like a neutral dashboard. They are a useful reference for what a good catalog contains.

**Chart library.** Stay with Recharts 3 through shadcn's chart component. When a chart's numbers change it glides from the old values to the new ones without extra code, it respects a Student's "reduce motion" setting, and CopilotKit's own chart is built on it too. Finance pictures no chart library has, such as a waterfall bridge, a cash-flow timeline or balance-sheet blocks, are better built as ValueIt's own drawn pieces.

### Keeping quality high when every Widget is built live

What the official packages give:

- **Checking.** Every Widget is checked before it reaches the browser: unknown pieces, missing required settings, a piece that points at nothing, a misspelled function. The check also knows what is already on screen, so a change to a Widget that does not exist is refused.
- **Repair.** If the whole reply is checked before anything is shown, a failed Widget is thrown away cleanly and the model is asked again with the error. If it is shown as it streams, the valid part stays on screen and is repaired in place or removed.
- **Examples.** Example Widgets are written once, checked against the catalog by the package, and put into the model's instructions. This is where ValueIt's house style lives.
- **Limiting size.** The catalog can be trimmed per Lesson, so the model sees only the pieces that Lesson needs. There is no built-in cap on how big a Widget may be. ValueIt sets its own: a limit on the length of the reply, and a simple count of pieces after the check. A reply cut off by the length limit can look finished, so the app must ask OpenAI whether the reply was cut.
- **Changing a Widget in place.** Three levels, cheapest first: change a value, add or replace a piece, build a new Widget.
- **Reading what the Student set.** A Widget can be created so that its current values travel with every message to the server. The browser can also watch the values directly, for example to save them.
- **Showing earlier Widgets again.** A Widget is a short list of JSON messages. Save them, and the Student's last values, in the database. Replay them through the same renderer. Check them again on load, and give each version of the catalog its own name so old Widgets keep working.

What is still ValueIt's to do: decide what a Student sees when a Widget fails twice, and build a small set of trial requests that is run against the catalog whenever the catalog or the model changes.

### Where the catalog limits a Widget

- The AI arranges approved pieces. It cannot draw a new kind of piece, write a new calculation, or invent a new way to interact, such as dragging a point on a chart, unless a piece already does it.
- So a Widget can only be as distinctive as the catalog, and every Widget shares one family look. For a product that is also a strength: it is the brand.

What widens it, inside A2UI:

- **Pieces with many modes.** One chart piece that can be a line, bars or a waterfall widens more than three fixed charts.
- **Pieces with slots.** A stage that holds layers lets the AI combine pictures, labels and controls in new ways.
- **A drawing piece.** A piece that takes a list of simple marks (lines, bars, labels, arrows) bound to live numbers lets the AI draw a picture nobody planned. It is still only data, so it is still A2UI.
- **Functions that return lists.** ValueIt's own functions can turn slider values into a whole series for a chart.
- **A piece repeated over a list.** One row design, drawn once per item of data.
- **New in 1.0.** Several catalogs on one Widget, rules for what may sit inside what, written house rules in the catalog, and functions that run on the server.
- **Growing the catalog.** When the Chatbot keeps reaching for a piece that does not exist, the check records it, and a coding agent adds that piece.

Google's roadmap promises pieces that are themselves described as data. That is not shipped.

### Against the stack test

- **Widget quality.** Decided above: the direct route gives the Widgets two things CopilotKit lacks, and gives up nothing a Widget needs.
- **Lean and simple.** Direct: three Google packages. CopilotKit: its browser and server packages bring 31 and 45 direct dependencies, among them Vercel's AI SDK, three AI vendors' adapters, a GraphQL server and an analytics client.
- **Run by a vendor, so a fault is the vendor's to fix.** Neither route is a service. Both are code inside ValueIt's app. On the direct route the glue (the stream, the retry, saving and replaying, the chat pane) is ValueIt's to keep working. It is small, and Google's guide shows each part. CopilotKit would own more of that glue, and it is the only one of the two that sells support. Its hosted service is vendor-run, but only for history, memory and analytics.
- **Easy for AI coding agents.** Both publish instructions for coding agents. CopilotKit has two generations of its API and two separate A2UI engines, and its examples default to Vercel's AI SDK, so an agent has more ways to write the wrong thing and to drift from the "OpenAI's own SDK" rule.
- **Fewest vendors.** Direct adds none. CopilotKit adds a company ValueIt depends on, and an account and bill if its saved history is used.

**When to look again.** If ValueIt later needs several AI frameworks, or Slack and Teams, or if CopilotKit's 1.0 engine leaves "experimental" and accepts an app's own functions as live values. Moving later would mean changing the pipe and rewriting the catalog in CopilotKit's format. The Widgets' design and the finance functions would carry over.

### Corrections to the earlier research

1. **The CopilotKit bug it cited is not open.** The report that replayed Widgets never appear was closed by its own author 24 minutes after it was filed, with no fix recorded. It is not evidence either way.
2. **"The official Next.js material goes through CopilotKit" was loose.** a2ui.org has no Next.js guide of any kind. Google's one Next.js example is its Composer tool, which uses CopilotKit for the chat and the official renderer for the drawing.
3. **The limit of 5 nested function calls is going away.** Its removal is in the unreleased notes of Google's core package.
4. **CopilotKit has moved a long way.** On 2026-10-29 it added a second A2UI engine for 1.0, the 69 ready pieces, and drawing into areas of the page.
5. **Stored, pre-built Widgets are dropped.** The same mechanism now serves "show a Student their earlier Widgets again".

## Evidence

All sources below were read on 2026-11-28 unless a line gives another date.

### 1. Versions (read 2026-11-28)

| Thing | State | Source |
| --- | --- | --- |
| `@a2ui/react`, `@a2ui/web_core` | 0.16.1, unchanged since 2026-11-23 | [react](https://registry.npmjs.org/@a2ui/react/latest), [web_core](https://registry.npmjs.org/@a2ui/web_core/latest) |
| `@a2ui/agent` | 0.2.1, unchanged since 2026-11-23. Two breaking changes wait in its unreleased notes | [registry](https://registry.npmjs.org/@a2ui/agent/latest), [changelog](https://github.com/a2ui-project/a2ui/blob/main/typescript/agents/a2ui_agent/CHANGELOG.md) |
| `@copilotkit/react-core`, `@copilotkit/runtime`, `@copilotkit/a2ui-renderer` | 1.90.2, published 2026-11-23. A 2.0 release candidate exists | [react-core](https://registry.npmjs.org/@copilotkit/react-core/latest), [runtime](https://registry.npmjs.org/@copilotkit/runtime/latest), [a2ui-renderer](https://www.npmjs.com/package/@copilotkit/a2ui-renderer) |
| `@ag-ui/core`, `@ag-ui/client` | 1.0.5. Version 1.0.0 came on 2026-09-17 | [registry](https://registry.npmjs.org/@ag-ui/core) |
| `@ag-ui/a2ui-middleware` | 0.0.16 | [registry](https://registry.npmjs.org/@ag-ui/a2ui-middleware/latest) |

### 2. What CopilotKit is and what it adds (read 2026-11-28)

- Three layers joined by AG-UI: a browser kit with ready chat components, a "runtime" that is mounted inside the app's own server (Next.js is supported), and the AI program behind it. Source: [architecture](https://docs.copilotkit.ai/concepts/architecture).
- AG-UI carries "text deltas, tool calls, state snapshots and deltas, reasoning, run lifecycle". Source: [architecture](https://docs.copilotkit.ai/concepts/architecture). It is "an open standard, developed by the CopilotKit team and several agent framework partners". Source: [AG-UI](https://docs.copilotkit.ai/agentic-protocols/ag-ui).
- Beyond A2UI it offers six other ways to draw AI-made screens, shared state, pausing for a person's input, and a browser Inspector for development. Source: [generative UI overview](https://docs.copilotkit.ai/concepts/generative-ui-overview), [open source vs Intelligence](https://docs.copilotkit.ai/concepts/oss-vs-enterprise).
- Google's own Composer tool is a Next.js app that depends on `@copilotkit/react-core`, `@copilotkit/react-ui` and `@copilotkit/runtime` next to `@a2ui/react`. It is the only Next.js app in the A2UI repository. Source: [composer package.json](https://github.com/a2ui-project/a2ui/blob/main/tools/composer/package.json). Google's React sample uses the official packages alone, on Vite: [react shell package.json](https://github.com/a2ui-project/a2ui/blob/main/samples/client/react/shell/package.json).
- The A2UI specification calls AG-UI "the standard transport binding" for talking to a person's screen, while stating that A2UI "does not mandate a specific transport layer". Source: [v1.0 specification, "Transport decoupling"](https://a2ui.org/specification/v1.0-a2ui/).

### 3. CopilotKit has two separate A2UI routes (read 2026-11-28)

**Route 1: the `a2ui` option and `@copilotkit/a2ui-renderer`.**

- "render A2UI v0.9 by default, with explicit A2UI 1.0 support in React". Source: [Adopt from A2UI](https://docs.copilotkit.ai/generative-ui/components/from-a2ui).
- It is CopilotKit's own React renderer on top of Google's `@a2ui/web_core`, pinned to 0.15.0, one release behind. It does not use `@a2ui/react`. Source: [package record](https://registry.npmjs.org/@copilotkit/a2ui-renderer/latest).
- Choosing a 1.0 catalog "does not upgrade backend packages or establish support in every adapter and streaming mode". Source: [Adopt from A2UI](https://docs.copilotkit.ai/generative-ui/components/from-a2ui).
- The helper for AI programs that build Widgets, `@ag-ui/a2ui-toolkit` 0.0.5, "writes v0.9 operations". Source: [support matrix](https://docs.copilotkit.ai/generative-ui/components/from-a2ui#support-matrix).

**Route 2: "Components and surfaces"**, announced 2026-10-29.

- "a separate A2UI 1.0 engine", with its own way to define a catalog (`createGenerativeUI`), the 69 ready pieces, and drawing into named areas of a page. Source: [Components and surfaces](https://docs.copilotkit.ai/generative-ui/components), [announcement](https://www.copilotkit.ai/blog/new-generative-ui).
- Marked "Experimental". It "implements A2UI 1.0 as of spec revision `cbaa5ee` (October 2026)", "the API of this feature can change", and "Anything that it does not list is not supported". The page still says upstream calls 1.0 a candidate, although Google released 1.0 on 2026-11-11. Source: [Components and surfaces](https://docs.copilotkit.ai/generative-ui/components).
- Not supported from 1.0: functions the Chatbot calls in the browser, functions the browser calls on the server, and the rules for which piece may sit inside which ("Not enforced"). Several catalogs on one Widget: "Partly". Source: [support matrix](https://docs.copilotkit.ai/generative-ui/components/from-a2ui#support-matrix).
- The AI sends a Widget as a tool call named `render_ui`, or as raw A2UI JSON inside its reply ("markdown mode"). Neither uses A2UI's compact Express notation, which the earlier research found costs about a third of the output. Source: [transports](https://docs.copilotkit.ai/generative-ui/components/transports), [markdown mode](https://docs.copilotkit.ai/generative-ui/components/markdown-mode).

### 4. ValueIt's own maths as live values (read 2026-11-28)

- Official: a catalog can register its own functions, and a property bound to a function is re-run in the browser whenever its inputs change. Source: [`@a2ui/react` README, "Defining Catalogs and Functions"](https://github.com/a2ui-project/a2ui/blob/main/typescript/renderers/react/README.md), and section 4 of the [earlier research](https://github.com/SiddharthMuramkar/valueit/blob/research/a2ui-today/research/a2ui-today.md).
- CopilotKit route 2: a function ValueIt declares runs "when a component calls an event", that is, on a click. "The functions of the A2UI 1.0 basic catalog are built in", and "A2UI 1.0 has no arithmetic, so CopilotKit adds two catalog functions", `calc` and `series`. Source: [State and actions](https://docs.copilotkit.ai/generative-ui/components/state-and-actions).
- Confirmed in the published 1.90.2 source: a function used as a value must be one of the built-in names, or the Widget is rejected with `"<name>" is not a basic function`. Source: [validate-operation.ts](https://cdn.jsdelivr.net/npm/@copilotkit/shared@1.90.2/src/generative-ui/validate-operation.ts), [basic-functions.ts](https://cdn.jsdelivr.net/npm/@copilotkit/shared@1.90.2/src/generative-ui/basic-functions.ts), and the browser side in [`@copilotkit/core`](https://cdn.jsdelivr.net/npm/@copilotkit/core@1.90.2/dist/generative-ui/index.mjs).
- `calc` takes an expression the AI writes, such as `"seats * 29"`. There is "no function that maps over a list". A sum over many years, such as the present value of a lease, cannot be written in it. Source: [markdown mode, "Limits"](https://docs.copilotkit.ai/generative-ui/components/markdown-mode).
- CopilotKit route 1: its catalog builder takes building blocks only and passes on only the standard functions. Source: [create-catalog.mjs in 1.90.2](https://cdn.jsdelivr.net/npm/@copilotkit/a2ui-renderer@1.90.2/dist/react-renderer/create-catalog.mjs).
- What remains possible in CopilotKit: put a whole calculation inside one custom building block. The AI could then place that block but could no longer connect any slider to any formula to any chart.

### 5. The Chatbot changing what the Student set (read 2026-11-28)

- Official: "The `updateDataModel` message replaces the value at the specified `path` with the new content." Source: [v1.0 specification](https://a2ui.org/specification/v1.0-a2ui/), [data binding](https://a2ui.org/concepts/data-binding/).
- CopilotKit route 2: "what the user types is written there. From then on, that value belongs to the user: a later agent update cannot write over it." Source: [State and actions, "Keep what the user types"](https://docs.copilotkit.ai/generative-ui/components/state-and-actions). The same rule is repeated in [Surfaces](https://docs.copilotkit.ai/generative-ui/components/surfaces) and the [standard catalog](https://docs.copilotkit.ai/generative-ui/components/standard-catalog).
- ValueIt's rule: the Chatbot "sees what the Student sets on a Widget and can change it". Source: `GLOSSARY.md`, and [What the Chatbot does and never does](https://github.com/SiddharthMuramkar/valueit/issues/10).

### 6. OpenAI's own SDK (read 2026-11-28)

- Official: `@a2ui/agent` gives text for the instructions and takes the model's text back. Google's example says "substitute any streaming LLM SDK". Source: [agent integration guide](https://a2ui.org/guides/agent-integration/).
- CopilotKit: "The Built-in Agent uses the Vercel AI SDK". Source: [model selection](https://docs.copilotkit.ai/model-selection).
- To use another model layer there is "factory mode", with three kinds: Vercel's AI SDK, TanStack AI, or "custom", where our code produces the AG-UI events itself, one by one. Source: [factory mode](https://docs.copilotkit.ai/backend/custom-agent). CopilotKit's own quick start for Widgets uses an OpenAI model through TanStack AI: [Components and surfaces](https://docs.copilotkit.ai/generative-ui/components).
- The older adapter that used OpenAI's SDK directly is deprecated and "has no direct v2 replacement". Source: [OpenAIAdapter reference](https://docs.copilotkit.ai/reference/v1/classes/llm-adapters/OpenAIAdapter).
- `@copilotkit/runtime` installs `ai`, `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google` and `@ai-sdk/google-vertex` whether they are used or not. Source: [package record](https://registry.npmjs.org/@copilotkit/runtime/latest).

### 7. Library or service: account, key and bill (read 2026-11-28)

- The browser kit and the TypeScript runtime are MIT-licensed and "connect your frontend to your agent without requiring a CopilotKit service". Source: [open source vs Intelligence](https://docs.copilotkit.ai/concepts/oss-vs-enterprise).
- CopilotKit Intelligence is a separate hosted service, which can also be self-hosted, with a project and an API key. It is needed for saved conversations with their UI, runs that can be resumed, sync across devices, user memories, learning from use, analytics, and Slack and Teams. Source: [open source vs Intelligence](https://docs.copilotkit.ai/concepts/oss-vs-enterprise), [Intelligence overview](https://docs.copilotkit.ai/intelligence/overview).
- Price: free hosted use up to 1,000 interactions per organisation each month. Pay as you go is $49 a month per organisation with 10,000 interactions included, then metered. Annual plans are priced on request. Paid plans include email support. Source: [pricing](https://www.copilotkit.ai/pricing). The docs name the plans differently (Developer, Pro, Team, Enterprise): [plans](https://docs.copilotkit.ai/intelligence/plans).
- Two more places where an account appears: one hook for a custom chat pane, `useCopilotChatHeadless_c`, "needs a public license key" (free), and `selfManagedAgents` "belongs to the Enterprise plan" in production. Source: [headless UI](https://docs.copilotkit.ai/intelligence/headless-ui), [message history](https://docs.copilotkit.ai/backend/message-history).
- The open-source runtime sends usage telemetry (no content) unless `COPILOTKIT_TELEMETRY_DISABLED=true` is set. Source: [telemetry](https://docs.copilotkit.ai/telemetry).
- Weight: `@copilotkit/runtime` has 45 direct dependencies and `@copilotkit/react-core` 31. `@a2ui/agent` has 2, `@a2ui/web_core` 6 and `@a2ui/react` 5. Source: the registry records linked in section 1.

### 8. Saved history without the service (read 2026-11-28)

- "By default, the TypeScript runtime keeps chat history in process memory. A restart loses that history, and other instances cannot read it." Source: [AgentRunner and persistence](https://docs.copilotkit.ai/backend/agent-runner).
- The other built-in store writes one SQLite file, for "One instance". For several instances: "CopilotKit Intelligence's `IntelligenceAgentRunner`, or your own runner backed by a shared datastore." Source: [AgentRunner and persistence](https://docs.copilotkit.ai/backend/agent-runner).
- "Durable replay requires a server-side store to replay from". Source: [thread and history lifecycle](https://docs.copilotkit.ai/threads-lifecycle).
- My reading, not re-checked for this note: Vercel runs an app as separate short-lived copies, not as one long-running process. Neither the in-memory store nor a single local file would hold a Student's history there.

### 9. Known problems (read 2026-11-28)

| Report | State | What it means |
| --- | --- | --- |
| [CopilotKit #6690](https://github.com/CopilotKit/CopilotKit/issues/6690): replayed Widgets never appear | Closed 2026-08-25 by its author, 24 minutes after filing. One automated reply, no fix recorded | Not evidence either way. The earlier research called it open |
| [CopilotKit #8272](https://github.com/CopilotKit/CopilotKit/issues/8272): the Widget tool reports "rendered" when every part was rejected | Open | The AI can tell a person that a Widget appeared when none did |
| [CopilotKit #8261](https://github.com/CopilotKit/CopilotKit/issues/8261): red "Unknown component" text shown to people in production | Open | A debug message inside a live Widget |
| [CopilotKit #8129](https://github.com/CopilotKit/CopilotKit/issues/8129): Widgets written inside the reply never draw for an AI program reached over HTTP | Open | One of the two ways route 2 delivers a Widget fails in that setup |
| [CopilotKit #6526](https://github.com/CopilotKit/CopilotKit/issues/6526): "Building interface" never finishes with the built-in agent | Open since August | Route 1 |
| [CopilotKit #7967](https://github.com/CopilotKit/CopilotKit/issues/7967): packages that still require Zod 3 | Open | The same constraint as Google's packages |
| [A2UI #2013](https://github.com/a2ui-project/a2ui/issues/2013): poor handling of pieces that have not arrived | Open, lowered in priority. Debug text is gone since 0.15.0. A way to supply our own placeholder is specified but not shipped | The app draws its own "building" state |

Both projects are busy: about 500 open issues and pull requests each. Source: [CopilotKit](https://github.com/CopilotKit/CopilotKit), [A2UI](https://github.com/a2ui-project/a2ui).

### 10. What A2UI's own docs recommend for Next.js (read 2026-11-28)

- Nothing specific. The full text of a2ui.org does not mention Next.js. Source: [llms-full.txt](https://a2ui.org/llms-full.txt).
- The guide for the server side uses the official package directly, with a plain streamed response: "If your agent and renderer live in the same binary or codebase, combine both guides, skip the transport step". Source: [agent integration guide](https://a2ui.org/guides/agent-integration/).
- The same guide lists three ready connections for teams that would otherwise write "custom transport plumbing": Google's ADK, the A2A protocol, and "AG-UI and CopilotKit". The address of the older page "A2UI with any agent framework" now shows this guide. Source: [agent integration guide](https://a2ui.org/guides/agent-integration/), [old address](https://a2ui.org/guides/a2ui-with-any-agent-framework/).
- Google's blog post with CopilotKit's CEO presents CopilotKit as the route for apps built on an agent framework, and adds: "You can also consume the event stream directly with `@ag-ui/client` and hand the A2UI operations to any compliant renderer: `@a2ui/react`". Source: [Google Developers Blog, 2026-10-29](https://developers.googleblog.com/build-generative-ui-apps-with-a2ui-copilotkit-agents/).

### 11. What decides look and movement (read 2026-11-28)

- 1.0 took styling out of the protocol: "Removes rigid theme properties ... to defer visual styling entirely to the target framework's native theme. A v1.0 `createSurface` that carries `theme` is invalid." Source: [v1.0 specification](https://a2ui.org/specification/v1.0-a2ui/), [evolution guide](https://a2ui.org/specification/v1.0-evolution-guide/).
- A custom building block is an ordinary React component, styled with the app's own CSS. The standard 18 are web components themed through `--a2ui-*` variables. Source: [`@a2ui/react` README, "Styling and CSS Modules"](https://github.com/a2ui-project/a2ui/blob/main/typescript/renderers/react/README.md), [client integration guide](https://a2ui.org/guides/client-integration/).
- Layout rules: a building block can declare `allowedParents` and `allowedChildren`, and the renderer rejects a Widget that breaks them. Source: [defining a catalog, "Child slots and layout constraints"](https://a2ui.org/guides/defining-a-catalog/).
- House rules: a 1.0 catalog carries written `instructions` that are added to the model's instructions. Source: [defining a catalog, "Prompt instructions and catalog metadata"](https://a2ui.org/guides/defining-a-catalog/).
- Streaming: a piece that has not arrived "renders nothing", with no space reserved. Source: [`@a2ui/react` changelog 0.15.0](https://github.com/a2ui-project/a2ui/blob/main/typescript/renderers/react/CHANGELOG.md), [A2UI #2013](https://github.com/a2ui-project/a2ui/issues/2013).
- CopilotKit, for comparison: "Components fade in once, when they appear", "There is no placeholder", and route 1 accepts a loading component. Source: [markdown mode](https://docs.copilotkit.ai/generative-ui/components/markdown-mode), [A2UI advanced](https://docs.copilotkit.ai/generative-ui/a2ui/advanced).
- CopilotKit's ready pieces: 69 in seven groups, among them `Table`, `Chart`, `Math`, `Slider`, `Tabs` and `Svg`. "The standard components look neutral by default." Colours, corners, shadows and font are CSS variables, and any piece can be dropped or replaced. Its chart draws with Recharts. Source: [standard catalog](https://docs.copilotkit.ai/generative-ui/components/standard-catalog), [theming](https://docs.copilotkit.ai/generative-ui/components/theming). One docs page was viewed as a picture: a clean, pale-blue dashboard chart. Source: [chart](https://docs.copilotkit.ai/generative-ui/components/standard-catalog/chart).
- Other catalogs: Google's Vega chart catalog is "Not published yet". The one community catalog listed adds Google Maps pieces. Source: [A2UI README, packages](https://github.com/a2ui-project/a2ui/blob/main/README.md), [community projects](https://a2ui.org/ecosystem/renderers/).
- The Lesson screen: the owner chose two panes and rejected the first look as pale, with Widgets that should be "colourful and a pleasure to touch". Source: [How the Lesson screen looks and moves](https://github.com/SiddharthMuramkar/valueit/issues/14).

### 12. Chart library (read 2026-11-28)

- Recharts 3.11.2. When data changes it snapshots the old items and animates to the new ones. Animation is "auto" by default, which turns it off for people who ask for reduced motion. Source: [AnimatedItems.tsx](https://github.com/recharts/recharts/blob/main/src/animation/AnimatedItems.tsx), [Pie.tsx](https://github.com/recharts/recharts/blob/main/src/polar/Pie.tsx), read through Context7.
- shadcn's chart is built on Recharts 3 and does not wrap it. Source: [shadcn chart](https://ui.shadcn.com/docs/components/base/chart).
- CopilotKit's browser package depends on `recharts` and `katex`. Source: [package record](https://registry.npmjs.org/@copilotkit/react-core/latest).
- Alternatives:
  - Nivo has the most praised default motion, but its last release, 0.99.0, is from May 2025. Source: [registry](https://registry.npmjs.org/@nivo/core/latest).
  - visx gives drawing primitives with no animation of its own.
  - TanStack Charts is new in 2026 (1.5.0).
  - ECharts draws on canvas and weighs about as much as Recharts.
  - Source: [TanStack Charts comparison](https://tanstack.com/charts/latest/docs/comparison), [LogRocket, 2026-06-01](https://blog.logrocket.com/best-react-chart-libraries-2026/). Both are secondary sources.
- No source measured "polish". That is a judgement for the owner's eye in the Lesson screen prototype.

### 13. Quality tools in the official packages (read 2026-11-28)

- The check: every reply is checked against a record of what the browser holds. "an update to a surface the response did not create is rejected". Source: [`@a2ui/agent` README, "Chat and canvas"](https://github.com/a2ui-project/a2ui/blob/main/typescript/agents/a2ui_agent/README.md).
- Whole-reply check and retry: the reply "is applied to the state all or nothing", and Google's guide shows a retry that sends back "the failed output and error message". Source: [agent integration guide, "Non-streaming generation and validation retry"](https://a2ui.org/guides/agent-integration/).
- While streaming: by default the first rejected block ends the stream. With `afterRejectedBlock: 'continue'` the rest is still shown and the error is handed to the app. Source: [`@a2ui/agent` README, "Streaming"](https://github.com/a2ui-project/a2ui/blob/main/typescript/agents/a2ui_agent/README.md).
- Examples: example Widgets are passed as A2UI JSON. The package "validates them against the negotiated catalogs and decompiles them into the active inference format". Source: [agent integration guide, "Customize catalogs, examples, and inference formats"](https://a2ui.org/guides/agent-integration/).
- Trimming: `ComponentPruningTransformer` and `FunctionPruningTransformer` are exported by `@a2ui/agent` 0.2.1 (checked in the published package). Source: [same guide section](https://a2ui.org/guides/agent-integration/).
- No size cap: the published packages limit nesting depth and expression length, not the number of pieces. Source: [`@a2ui/web_core` 0.16.1 on jsDelivr](https://cdn.jsdelivr.net/npm/@a2ui/web_core@0.16.1/src/validation/integrity-checker.js). A reply that was cut off is not flagged by the package: [known gaps, "Truncation signal lost at compile boundary"](https://github.com/a2ui-project/a2ui/blob/main/typescript/agents/a2ui_agent/KNOWN_GAPS.md).
- Changing in place: keep one record of the screen for the conversation, and the model writes `surface("id", update=true)`. Source: [agent integration guide, step 3](https://a2ui.org/guides/agent-integration/).
- Reading the Student's values: with `sendDataModel: true` the renderer attaches the Widget's values to every message, read with `getRendererDataModel()`. Each Widget's values can also be read and watched in the browser. Source: [agent integration guide, "Read synchronized client data models"](https://a2ui.org/guides/agent-integration/), [client integration guide](https://a2ui.org/guides/client-integration/), and the published `@a2ui/web_core` 0.16.1 type files.
- Replay: the renderer draws any list of messages, and `validatePayload` checks a stored one. Source: section 8 of the [earlier research](https://github.com/SiddharthMuramkar/valueit/blob/research/a2ui-today/research/a2ui-today.md). CopilotKit notes the same catalog-version problem: "Retaining several historical custom catalogs is not automatic". Source: [Adopt from A2UI](https://docs.copilotkit.ai/generative-ui/components/from-a2ui).
- CopilotKit's equivalent: "Every piece the agent sends is checked against your catalog before it renders. If something doesn't match, the agent gets the reason and fixes it on the next turn." Source: [announcement](https://www.copilotkit.ai/blog/new-generative-ui).

### 14. The limits of a catalog (read 2026-11-28)

- "The client keeps a catalog of trusted components, so anything the agent invents outside that set is caught before it reaches the screen." Source: [Google Developers Blog, 2026-10-29](https://developers.googleblog.com/build-generative-ui-apps-with-a2ui-copilotkit-agents/).
- A catalog's own function can return a list, for "computing derived values reactively from bound data-model fields". Source: [defining a catalog, "Custom functions and input validators"](https://a2ui.org/guides/defining-a-catalog/).
- A piece can be repeated once for each item of a list in the Widget's values. Source: [data binding](https://a2ui.org/concepts/data-binding/), [v1.0 specification](https://a2ui.org/specification/v1.0-a2ui/).
- New in 1.0: several catalogs on one Widget, placement rules, catalog instructions, and functions that run on the server. Source: [evolution guide](https://a2ui.org/specification/v1.0-evolution-guide/), [defining a catalog](https://a2ui.org/guides/defining-a-catalog/).
- Server-side "macros", which let the model write one call that expands into many pieces, exist only in the Python package. Source: [macros guide](https://a2ui.org/guides/macros/).
- On the roadmap, not shipped: "Primitives that you style to match your design system and describe declaratively" and "A runtime templating engine". Source: [roadmap](https://a2ui.org/roadmap/).
- The limit of 5 nested function calls is removed in the unreleased notes of `@a2ui/web_core`. Source: [web_core changelog](https://github.com/a2ui-project/a2ui/blob/main/typescript/core/web_core/CHANGELOG.md).

## Open questions

1. **Does `gpt-6.2-sol` build good Widgets from ValueIt's catalog, not merely valid ones?** Still unmeasured, on either route. [Whether answers and generated Widgets arrive fast enough](https://github.com/SiddharthMuramkar/valueit/issues/15) was closed without being run. With every Widget built live, this is now the largest unknown in the plan.
2. **What is in the catalog?** The map's "Widget building blocks" item. It is now the centre of the product, and it waits on [The first Accounting 101 Lesson Plan](https://github.com/SiddharthMuramkar/valueit/issues/22).
3. **Reveal a Widget whole, or let it build piece by piece?** A matter for the owner's eye in [How the Lesson screen looks and moves](https://github.com/SiddharthMuramkar/valueit/issues/14).
4. **How the server remembers what is on screen between messages.** The app does not keep memory between requests on Vercel, so the record has to be rebuilt from the saved messages each time. The function for it exists. It needs a small prototype.
5. **One catalog definition for both server and browser,** without pulling React into the server. Carried over from the earlier research.
6. **Zod 3 or Zod 4.** The app-stack research lists Zod 4. Google's A2UI packages, and CopilotKit's, require Zod 3. For [Lock the stack](https://github.com/SiddharthMuramkar/valueit/issues/17).
7. **What a Student sees when a Widget fails twice,** and the wording of the Chatbot's fallback.
8. **Names for catalog versions,** so a Widget saved today still opens after the catalog changes.

## What I could not confirm

- **Nothing was run.** The claims about CopilotKit's limits come from its docs and its published source. The claims about the official route come from Google's docs and published packages.
- **How CopilotKit's ready pieces look and move in real use.** One docs page was seen as a picture. Whether anything looks "first-class" cannot be settled from documents.
- **Whether a catalog built with Google's own tools, with ValueIt's functions in it, could be handed to CopilotKit's route 1** and reach the model's instructions. CopilotKit's own builders do not offer this. Not tried.
- **Whether route 1 lets the Chatbot overwrite a value the Student set.** It is built on Google's core, so it probably follows the official rule. Not checked.
- **CopilotKit's exact prices beyond the headline figures.** The pricing page and the docs name the plans differently, and the hosted pay-as-you-go button reads "Get Early Access".
- **How well CopilotKit's built-in repair works against a hand-written one.** No measurements exist for either.
- **Any figure for OpenAI models writing A2UI.** CopilotKit's quick start runs an OpenAI model, which shows that it works, not how well.
- **Rebuilding the server's record of the screen from saved messages.** The function is in the published package. The pattern is not shown in any guide.
- **A way to supply our own placeholder in the official renderer.** Specified on 2026-11-03, not in the published 0.16.1.

## How this was researched

- Library docs through Context7 first (CopilotKit, A2UI, Recharts). Then the full-text editions of both doc sites ([a2ui.org/llms-full.txt](https://a2ui.org/llms-full.txt), [docs.copilotkit.ai/llms-full.txt](https://docs.copilotkit.ai/llms-full.txt)), raw files from both repositories, GitHub issues, npm registry records, and the published packages `@copilotkit/core`, `@copilotkit/shared` and `@copilotkit/a2ui-renderer` 1.90.2 and `@a2ui/agent` 0.2.1, `@a2ui/web_core` 0.16.1 and `@a2ui/react` 0.16.1 (read, not executed).
- Search providers: Parallel, Octen, Firecrawl and Tavily. None failed. Tavily was reached through its command-line tool, because its connector was not loaded for this piece of work.
- A local A2UI skill was used as a lead. Its pointer to a guide called "A2UI with any agent framework" now lands on Google's agent integration guide.
- The earlier research was re-checked where it could have moved: package versions (unchanged), the CopilotKit issue (closed, see the corrections), the nesting limit (being removed) and the placeholder question (still open).
