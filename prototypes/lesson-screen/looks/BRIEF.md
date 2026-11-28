# Brief: finished looks for the Lesson screen

PROTOTYPE, throwaway. This is the brief every look was built and judged against.

## Why

The owner saw the first rough pass, chose its layout (A: Chatbot on the left, Widget on the right, split 48 / 52), and then said, in short:

- It is pale, tasteless and boring to look at. The Widgets are not interactive and not fun.
- It should look as if a team of twenty top designers spent a fortune on it: a billion-dollar product. The typeface, the scale of the text, the alignment of the text, the colours, every single detail thought over and as good as it can be.
- The generated Widgets should be dashing, colourful, out of this world. A first look should leave people in awe.

So: the same screen, the same nine moments, the same words, as a finished look. Three looks are built, each a different direction, each in its own folder. The owner reacts to them and picks.

The owner subsequently decided that the Chatbot builds every Widget live from Building blocks, following the Lesson Plan’s Widget brief. Moment 1 shows the first Widget already on screen. Moment 3 lets the owner replay two ways to show a build in progress. [Decision on live Widgets](https://github.com/SiddharthMuramkar/valueit/issues/14#issuecomment-7238372045)

## The bar

Ten out of ten means: put it on the landing page of the best-designed product you know and nobody blinks. Five is a competent template. The first rough pass is a two.

What reads as cheap, and is not wanted: a default system font at default weights; one grey for everything; every box the same rounded card with the same soft shadow; a purple gradient on white; emoji as icons; text centred because nobody decided; borders where spacing should do the work; colour sprinkled as decoration rather than carrying meaning; motion that is only a fade.

What reads as expensive: a point of view you can name in one sentence; type with real hierarchy and rhythm; alignment you could check with a ruler; colour that means something; a Widget you want to touch before you are told to; motion with weight; every state designed (hover, focus, pressed, disabled, waiting, wrong, right).

Beauty that makes the idea harder to see fails. The Student is an adult learning finance from zero, reading for about 25 minutes. Clarity first, then awe.

## What is fixed

**Layout.** Layout A. A top bar across the screen. Under it two panes: the conversation on the left takes 48% of the width, the Widget on the right takes 52%. The Widget pane does not scroll at the four full screen sizes; only the conversation scrolls. Landscape only.

**Placements** (from layout A; the owner said "base A"):

- Top bar: `Accounting 101 · Lesson 1`, the Lesson title, progress through the Lesson's four ideas plus "What to keep" (with the current one named, as in "Idea 2 of 4: What it owes, and what's left"), and a `Notes (3)` button.
- Conversation: the Chatbot's messages, the Student's messages, small lines for things the Student pressed, dividers between ideas. Where a Widget enters, the conversation shows a small marker pointing right ("On the right: …"); pressing it brings that Widget to the front.
- Message box at the bottom of the conversation, with "I'm stuck" beside it and a Send button.
- A Widget the Chatbot builds opens as a tab on the right, marked "Built for you"; the Lesson's own Widget stays one tab away.
- Test intuition sits inside the Widget: one question, four answers.
- "Save as Note" on each Widget, under the answers marked for it, and on "What to keep".
- A source link sits under the one answer that used the web, and under no other.
- After the right Test intuition answer, a "Go on" button in the conversation.

**Words.** The made-up Lesson in `../lesson.js` is the script: use its words as they are. Product words are fixed: Chatbot, Widget, Test intuition, Note, Lesson, Student, "I'm stuck". Never tutor, assistant, quiz, bookmark. The Chatbot's words call "Left for Maya" the blue block, so that block is blue in every look.

**The nine moments.** Each must draw correctly straight from `?moment=N`, and move well when stepped to from the moment before.

| # | What happens | What must show |
|---|---|---|
| 1 | The Chatbot opens an idea | Divider, the Chatbot's opening words, the marker for the Lesson's Widget. Right: the Lesson's Widget (own money 6,000, loan 0). |
| 2 | The Student asks, the Chatbot thinks | The Student's question, then a thinking state. The real wait is 23 to 52 seconds before the first word, so this state is seen a lot: it says so honestly, and the Widget stays usable. Right: loan at 5,000. |
| 3 | The Chatbot answers and builds a Widget | The answer, with "Save as Note". A second Widget, "The machine wears out", arrives as a "Built for you" tab and comes to the front. |
| 4 | A question about today | The Student's question, the answer, and under it the source link (`Starbucks annual report · sec.gov`). |
| 5 | Test intuition | The Lesson's Widget comes back to the front with the question and four answers inside it. A badge says the Chatbot set the bank loan back to 0. |
| 6 | "I'm stuck" | A line that the Student pressed it, a hint (never the answer), and the loan control marked "The Chatbot is pointing here". |
| 7 | A wrong pick | The wrong answer marked "Not this one", the Chatbot's explanation, and the Widget changed by the Chatbot: loan at 5,000, with a badge saying so. |
| 8 | A right pick, and moving on | The right answer marked, the idea marked done in the top bar, and "Go on: What it earns" in the conversation. |
| 9 | What to keep, and saving a Note | A line that two ideas were skipped, a divider, the Chatbot's closing words. Right: "What to keep" with its four points, shown as already saved to Notes, a strip to add a line of the Student's own, and "Finish · Next: Lesson 2: The income statement". |

What the Student can press: Send goes to the next moment. "I'm stuck" goes to moment 6. A wrong answer goes to moment 7, the right one (the third) to moment 8. "Go on" goes to moment 9. Tabs and markers switch the Widget in front. Sliders redraw the Widget at once, in the browser, with no call to the Chatbot. "Save as Note" flips to "Saved to Notes ✓" and back. Arriving at a moment resets the Widget to that moment's numbers.

**Product truths the look must respect.**

1. *The Chatbot and the Widget are one teacher.* When the Chatbot builds a Widget, changes one, or points at a control, the screen should show the two acting together: the words and the Widget visibly linked. A concept has one colour everywhere it appears: in the Widget, and in the Chatbot's words about it.
2. *The Chatbot generates Widgets from a fixed catalogue of building blocks.* It wires blocks together; it never draws. So each look designs a **kit**: the Widget frame and header, an amounts block (stacked, labelled amounts on two sides that must stay equal), a slider, a number, a badge for "the Chatbot set …", a pointer mark, the Test intuition block, tabs, the "What to keep" list, the Note button and strip. Both Widgets on screen are assembled from that one kit by one drawing routine fed with plain data (labels and numbers). Nothing may be drawn by hand for one Widget that another could not reuse: no one-off illustration of a coffee cart. A block can be as rich as you like (alive, draggable, glowing) as long as data alone drives it.
3. *The half-minute wait is real.* Do not design as if answers were instant.
4. *One screen, no clutter.* No settings, no theme switch, no new features.

## What you design

- **A point of view.** One sentence that says what this look is. Everything follows from it.
- **Type.** One or two families, chosen on purpose, self-hosted. A named scale with few steps. Line height and letter spacing set per step. Lining, tabular numerals for every amount, so digits do not jiggle when a slider moves. Headings balanced, paragraphs without widows where the browser allows. Comfortable reading: the Chatbot's words at 16px or larger on an iPad, 45 to 75 characters a line.
- **Colour.** Roles (canvas, surface, ink, quiet ink, line, accent) and a **data palette**: one colour each for Cash, Cart, Coffee machine, Owes the bank, and Left for Maya (blue). Text contrast at least 4.5 to 1 (3 to 1 for large text). Not pale.
- **Space and alignment.** One spacing scale. Shared left edges down the conversation, and from the top bar into the panes. Numbers aligned so they compare. Corner radii that nest. Nothing a pixel or two off.
- **The Widget kit.** This is where the awe has to come from. It must make "owns = owes + what's left" obvious at a glance, invite touch, and answer touch instantly. Consider: grabbing a block itself, not only its slider; amounts that count as they change; the two sides growing in lockstep while the blue block visibly stays put; the loan and the machine it bought shown as one thing in two places.
- **Motion.** With weight, not only fades: springs for blocks and numbers, staggered arrival for new messages, a real handover when the tab changes. Fast: nothing blocks the Student, most things settle within 400ms. Honour reduced motion. Animate transform and opacity so an iPad stays smooth.
- **States.** Hover, keyboard focus, pressed, disabled, for every control. Touch targets at least 44 by 44.

## Where awe is earned

1. **First sight** (moment 1). The first second decides it.
2. **Dragging the loan.** The moment of understanding: both sides grow, the blue block does not move.
3. **Thinking** (moment 2). Half a minute made calm and alive, without pretending.
4. **A Widget being built** (moment 3). Generated UI arriving: it should feel assembled for this Student, block by block, not swapped in.
5. **The Chatbot's hand on the Widget** (moments 5 to 7). It sets the loan and the Widget moves by itself; it points and a control lights up.
6. **Right and wrong** (moments 7 and 8). Wrong is kind. Right is a small celebration, in character.
7. **What to keep** (moment 9). The page a Student saves. It should be worth saving.

## Screens

| Name | Size | |
|---|---|---|
| `laptop` | 1470 × 840 | big laptop |
| `laptop-s` | 1366 × 650 | small, short laptop |
| `ipad` | 1180 × 750 | iPad held sideways: design here first |
| `ipad-s` | 1080 × 740 | smaller iPad sideways |
| `ipad-kb` | 1180 × 353 | what is left above the iPad's on-screen keyboard |
| `ipad-s-kb` | 1080 × 348 | the same on the smaller iPad |

Touch and mouse both. Nothing that needs hover. With the keyboard up there are about 350px of height: the latest words, the message box and a compact but readable Widget must all still be there. Decide what shrinks and what goes. Type and spacing should scale with the screen, not jump.

## How it is built

- Your look is one folder: `looks/<slug>/` with `index.html`, your CSS and JS, `fonts/`, and `NOTES.md`. **Write nowhere else.** Start from `looks/_template/index.html`, which shows the wiring.
- Plain HTML, CSS and JavaScript. No build step, no framework, no library, nothing loaded from the network when it runs: the owner opens it by double-clicking a file. Classic `<script src>` only (modules and `fetch` of local files fail on `file://`).
- Load `../../lesson.js` for the made-up Lesson (`P.lesson`, `P.stream`, `P.moments`, `P.testIntuition`, `P.keep`; `../../widgets.js` holds the Widgets' numbers and sums, to read and reuse or copy). Load `../bridge.js` for the moment: `Look.moment`, `Look.onMoment(fn)`, `Look.go(n)`.
- Mark the two panes `data-pane="chat"` and `data-pane="widget"`. Give every custom control a real role (`button`, `tab`, `slider`), a name, keyboard use and a visible focus ring.
- The page fills the window exactly and never scrolls as a whole. On first load it is settled within 800ms (the screenshot tools wait about a second); only the thinking state may keep moving.
- Fonts: self-hosted `.woff2` in `fonts/`, open licences only (OFL or Apache), with each licence file beside them. These fetch patterns work: `https://cdn.jsdelivr.net/fontsource/fonts/<id>:vf@latest/latin-wght-normal.woff2` (variable weight), `…/<id>:vf@latest/latin-full-normal.woff2` (every axis), `…/<id>@latest/latin-400-normal.woff2` (one weight); `https://api.fontsource.org/v1/fonts/<id>` lists axes and the licence.
- **Tokens.** Every colour, type step, spacing step, radius, shadow, duration and easing is a CSS custom property in one block at the top of the main stylesheet. That block is what the real product will copy.
- It must work in current Chrome, Firefox and iPad Safari. Newer CSS is welcome where it degrades without breaking.
- `NOTES.md`, short: the one-sentence point of view; the fonts and their licences; the type scale at each screen size; the palette; the kit, block by block; what you know is still weak.

Modern web guidance: before writing, fetch the guides that apply and follow them:
`NPM_CONFIG_CACHE=/tmp/npm-cache npx -y modern-web-guidance@latest retrieve "typography,fluid-scaling,color,motion,physics-based-easing,slider,natural-interactions"`.
Others worth a look: `same-document-transitions`, `animate-element-entry-exit`, `dynamic-sibling-animations`, `anchor-positioning-tab-underline`, `visually-stable-font-fallbacks`, `size-aware-styling`, `form-factor-adaptation`, `accessibility` (search more with `… search "<two to five words>"`). Note which guides shaped the work, with a short phrase quoted exactly from each.

## Tools

Run from `prototypes/lesson-screen/`. They start their own headless Chrome; several can run at once.

- `node tools/shots.mjs <slug> <outDir>`: the standard 28 screenshots. `--moments 1,5 --sizes ipad,ipad-kb` for a few; `--dpr 2` for sharp type. `rough` as the slug shows the first rough pass.
- `node tools/audit.mjs <slug>`: measures instead of guessing. Type sizes in use, fonts that failed to load, contrast sampled from real pixels, touch targets under 44px, cut or shortened text, what scrolls, the pane split, characters per line, near-miss alignment, spacing steps, radii.
- `tools/cdp.mjs`: for your own scripts. `open()`, `page.size()`, `page.goto(lookUrl(slug, moment))`, `page.click()`, `page.drag()`, `page.setRange()`, `page.key()`, `page.eval()`, `page.shot(file, { clip, scale })`, `page.shotOf(file, selector)` to zoom into one element, `page.errors`. Use it to drag a slider and photograph the Widget mid-move, and to press through all nine moments.

Look at your own screenshots (the Read tool shows a PNG) the way a hostile design director would. Keep scratch files under `/tmp/valueit-looks/<slug>/`, never in the repo.

## Done means

- All nine moments draw from their address and from stepping; every control in "What the Student can press" works; no page errors.
- `audit.mjs`: fonts showing, the split at 48 / 52, the page fits at all six sizes, no contrast failures, no small targets, no cut text that is not on purpose.
- It holds at all six sizes, in Chrome and Firefox.
- You would sign it.

## How it is judged

Each from 1 to 10: first-glance awe; typography; alignment and spacing; colour; the Widget (delight and interactivity); motion; clarity of the idea being taught; every screen size including keyboard-up; finish (states, edge cases, nothing glitchy, the kit honest).

---

# Second reaction: Playful blocks, made professional (2026-11-28)

The owner tried the three looks and said, in short:

- Playful blocks is the one: "really good". Keep what it does.
- Now make it professional: minimalistic, dark, with royal blue accents.
- "The best fonts to read", and bold type for the thing the Student should focus on.
- Clean and minimal, yet it should look as if a team of high-end software developers made it: really good layouts, well thought out UI and UX.
- Really good to look at and interactive. Every single aspect properly thought through.

So there is a fourth look. Everything above in this brief still holds (layout, placements, words, the nine moments, the product truths, how it is built, done means) except where this section says otherwise. Read `play/` first: it is the behaviour the owner liked. A dark recolour of it fails; so does anything that loses its blocks.

## What stays from Playful blocks

- The amounts block: two stacks of solid blocks with real depth, one block per amount, standing on a floor, on one shared scale, with a bold total over each stack and an equals sign between them. A block carries its name when it has room.
- Grab a block itself to change it. Every movable block also has a labelled range control. The Cart never moves and never looks grabbable.
- The ledger under the stacks that repeats every label and amount.
- Big, tight, bold type for the idea title, the Widget title and the two totals.
- The whole kit and both Widgets drawn by one routine from `P.defs`.

## What changes

- Light lilac becomes dark. The violet accent becomes royal blue.
- The quirky display face becomes a reading-first family.
- The cartoon tells go: a dark outline around every face, tilted icon squares, hard offset shadows, candy gradients.
- Fewer boxes. Play puts the board, the ledger, each slider and the question in separate bordered cards. Here spacing, alignment and a few hairlines do that work.

## Minimal: the budget

- **One accent.** Royal blue marks what the Student can act on and what is selected or focused. Nothing else in the frame around the Widget is coloured. The data palette lives only inside a Widget and in the Chatbot's words about those amounts.
- **Surfaces.** At most three tones of one blue-black: canvas, raised, sunken. No pure black and no pure white; reading text is an off-white.
- **Lines.** A hairline only where two things would otherwise run together. No box around something that space already separates.
- **No decoration.** No glow, no neon, no glass blur, no gradient for its own sake. Depth is allowed where it carries meaning: the blocks are objects, and a sheet lies over the page.
- **Icons.** Simple line icons, one stroke weight, inline SVG, `currentColor`. No emoji.
- **Motion.** Quick and physical. Nothing loops except the thinking state, and that gently.

## Type

Inter, variable, with its optical-size axis: the official 4.1 build, `InterVariable.woff2`, SIL Open Font License 1.1. The file and its licence come from the `inter-ui` package, version 4.1.0 (`variable/InterVariable.woff2`, `LICENSE.txt`); the copies are in `royal/fonts/`. The smaller build on Fontsource leaves out the arrows and the alternates, so it is not the one to use.

It was chosen by looking. Twelve reading faces were set in this screen's real column on a dark ground at 1× and 2×: Inter, Geist, Atkinson Hyperlegible Next, IBM Plex Sans, Source Sans 3, Hanken Grotesk, Figtree, Mona Sans, Public Sans, Instrument Sans, Manrope, Lexend. Inter read most evenly at 17 px, and its display cut at heavy weights gives the tight, confident headline the owner liked in Playful blocks without the quirks.

- `font-optical-sizing: auto`, so small text gets the sturdier text cut and headlines the display cut. `font-synthesis: none`. No italics.
- Reading text at a regular weight: try 400 to 460 on the dark ground and judge by eye at 1× (light text on dark renders thinner on some systems and fatter on others).
- **Bold is for focus.** Heavy weights (650 to 800) are reserved for what the Student should look at next: the idea title, the Widget title, the two totals, the question, the primary button, the word being taught. If everything is bold, nothing is.
- Tabular lining numerals on every amount (`font-variant-numeric: tabular-nums lining-nums`). This build has `ss01`, `cv05`, `cv08`, `case` and friends; use an alternate only if it makes text easier to read without looking odd.
- This build draws every arrow and tick the script uses (→ ↗ ↑ ↓ ↳ ↕ ✓ ×), so no fallback font may appear anywhere on screen. `node tools/audit.mjs` lists the fonts in use.
- Sizes follow the scaling rule in `README.md` (driven by width, never height; Chatbot text 16.5 to 18 px; lines 45 to 75 characters; the smallest text fixed, not below 12 px).

## Colour

- **Canvas:** a blue-black. Clearly dark, clearly not grey.
- **Accent:** royal blue. A fill near `#4169e1` for the primary button, the selected state, the slider fill and the focus ring; white on it must reach 4.5 to 1. Small text and links on the canvas need a lighter tint of the same hue, because the fill colour itself does not reach 4.5 to 1 on a dark ground.
- **Data palette:** five colours on dark. Left for Maya is the blue block, and blue is also the accent, so decide on purpose how the two relate and say so in your notes. The other four must be plainly different from it and from each other, for a colour-blind Student too; names on the faces and in the ledger carry the meaning as well, never colour alone. Professional, not candy: tune the five to similar lightness and strength (work in OKLCH) so no block shouts. A concept keeps its colour everywhere, in the Widget and in the Chatbot's words about it.
- **Right and wrong:** right is a calm green with a tick and the word; wrong is kind, with a mark and "Not this one", never an alarm red.
- **Contrast:** text 4.5 to 1 (3 to 1 when large), control edges and focus rings 3 to 1.

## Layout and UX: each of these is a decision, not an accident

- Shared edges. The brand, the idea title, the Chatbot's words and the message box share one left edge. The Widget title, the stacks, the ledger and the controls share another. The top bar lines up with the panes under it.
- One focal point per moment, made with weight and position, not with more colour. On the Widget pane the order is title, totals, blocks, ledger, controls; at Test intuition the question becomes the loudest thing and the chart compacts.
- The conversation is a document, not a chat app. The Chatbot's words are plain text on the canvas; the Student's words are set apart quietly.
- Empty space at moment 1 is a feature.
- "I'm stuck" is always findable and never louder than Send.
- Notes is a sheet with its own design: a title, what was saved, the Student's own line.
- Progress in the top bar shows done, now and later without relying on colour alone.

## Interaction: the owner asked for interactive

Every control needs hover, keyboard focus, pressed and disabled states that look different from each other.

1. **Direct manipulation.** A grabbed block follows the finger with no lag and settles with weight on release. Linked blocks move in lockstep (the loan: machine and bank debt; own money: cash and Maya's share), and the blue block visibly stays put when the loan moves. While dragging, show the amount and how much it changed.
2. **One teacher.** The Chatbot's words about an amount carry that amount's colour. Hovering, focusing or tapping such a word lights its block and its ledger row on the right. Hovering a block or a ledger row lights its partners. All of it works by touch.
3. **The Chatbot's hand.** When it sets an amount the blocks move by themselves from the old value to the new, the numbers count, and a line says what it did. When it points, the control is marked "The Chatbot is pointing here" and draws the eye once, not forever.
4. **A Widget being built.** Stepping to moment 3 should look assembled. The bar's two replays (**Piece by piece**, **All at once**) hide and show every `[data-build-part]` and swap the text of the pane's first `h2` (see `bridge.js`). Hidden parts keep their space so nothing jumps, and the reveal may animate.
5. **Thinking.** Calm, alive, honest about the half minute. The Widget stays usable. The prototype stays at moment 2 until the owner moves on, so anything that counts or moves must still look right after five minutes.
6. **Tabs.** A real handover between Widgets. Each keeps its slider values while hidden. Arrow keys, Home and End.
7. **Notes.** "Save as Note" flips to "Saved to Notes", the count in the top bar answers, and the sheet lists what was saved.
8. **Keyboard and touch.** Everything reachable in a sensible order with a visible royal blue focus ring. Escape closes the sheet. Targets at least 44 px. `touch-action` set so dragging a block never scrolls the page.

## Hooks the tools rely on

- Each block: `data-block="cash|cart|machine|owes|equity"`. Each coloured word in the Chatbot's text: `data-concept` with the same key. Each total: `data-total="left|right"`.
- `data-build-part="amounts"` on the chart and `data-build-part="controls"` on what arrives after it. The Widget title is the pane's first `h2`.
- Native `<input type="range">` for every control, its `aria-label` the control's label from `P.defs`.
- Button names keep the product words: Send, I'm stuck, Save as Note, Saved to Notes, Go on: What it earns, Done, Close, `Notes (3)`, and the marker starts "On the right:". Notes opens in a `<dialog>`.

## Checks for this look

Run from `prototypes/lesson-screen/`, like the tools above; each starts its own headless browser. The look must be listed in `looks.js`.

- `node tools/drive.mjs chrome <look>` and `… firefox <look>`: uses the look the way a Student would, 64 checks, all must pass.
- `node tools/arrival.mjs chrome <look>` and `… firefox <look>`: both arrival replays in the bar.
- `node tools/panel.mjs <look> <outDir>`: one fixed set of pictures (every moment and size, drags frame by frame, hover, focus, pressed, Notes, right and wrong, reduced motion, the replays). `--only stills|motion|states|bar` for a part.
- `node tools/modes.mjs <look> <outDir>`: the look as a colour-blind Student sees it, in forced colours, with more contrast, with wider text spacing.
- `node tools/ff-shots.mjs <look> <outDir>`: the same moments in Firefox, to hold beside Chrome's.
- `node tools/sizes.mjs <look>`: the type sizes, line length and chart height at the six screen sizes, as a table.

## Judged on

The list at the end of the brief, and two more. Does it honour the owner's words: minimal, dark, royal blue accents, easy to read, bold where the Student should focus, professional, interactive, every detail considered? Does it keep what the owner liked in Playful blocks?

## Outcome

Three takes on this section were started side by side: the most reduced one, one that treats the Widget as a lit object in a quiet dark room, and one with a measured scale and a level line across both stacks. The owner looked in while they were being built and chose the second. It is `royal/`, named **Royal blocks**, and it is the look for the Lesson screen. The other two were stopped unfinished and are not kept. [Its notes](royal/NOTES.md)
