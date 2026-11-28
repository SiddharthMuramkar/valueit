# Royal blocks

Playful blocks, made professional: a quiet dark room where the Widget is the one lit object, royal blue is the only colour in the frame, and the amounts are solid blocks the Student picks up.

The owner asked for this look on 2026-11-28 after trying the first three, and chose it while it was still being built. [The brief's second reaction](../BRIEF.md)

## Type

Inter sets everything: one variable file with a weight axis (100 to 900) and an optical-size axis (14 to 32), `fonts/InterVariable.woff2`, the official 4.1 build. SIL Open Font License 1.1; the full text is `fonts/Inter-LICENSE.txt`. It was picked by looking: twelve reading faces were set in this screen's real column on a dark ground, and Inter read most evenly at 17 px while its display cut gives a tight, confident headline. The file draws every arrow and tick the Lesson uses, so no fallback font appears on screen.

Reading text is weight 430 at line height 1.6. Labels are 520, strong words 640. The heavy weights, 740 and 760, are kept for what the Student should look at next: the idea title, the Widget title, the two totals, the question, the word being taught. Every amount uses tabular lining numerals, so digits hold still while a block moves.

| Screen | Chatbot | Idea title | Widget title | Totals | Longest opening line |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1470 × 840 | 18 px | 50 px | 30 px | 42 px | 67 characters |
| 1366 × 650 | 17.6 px | 46.8 px | 28.4 px | 39.3 px | 67 characters |
| 1180 × 750 | 16.9 px | 41.1 px | 25.5 px | 34.6 px | 63 characters |
| 1080 × 740 | 16.5 px | 38 px | 24 px | 32 px | 56 characters |
| 1180 × 353, keyboard up | 16.9 px | 25.5 px | 18.6 px | 18.6 px | 63 characters |
| 1080 × 348, keyboard up | 16.5 px | 24 px | 18 px | 18 px | 56 characters |

Measured with `node tools/sizes.mjs royal`. The smallest text is 12.5 px at every size and controls are 14 px. Type follows the screen's width and never its height. The conversation's column is capped at 31 em; across all nine moments the usual line runs 48 to 66 characters and the longest reaches 79.

## Colour

Three tones of one blue-black: canvas `#0a0f1c` (top bar and conversation), raised `#121929` (the Widget pane, the Notes sheet, the Student's words), sunken `#060a14` (text fields). Ink `#edf0f7`, quiet ink `#9da7bd`, hairline `#232b3e`, control edge `#5f697e`.

One accent, royal blue `#3d63db`: the primary button, the slider, the selected tab, the focus ring. It lightens to `#4d73ea` under the pointer and darkens to `#3152c0` when pressed. Small text and links on the dark ground use the lighter tint `#9bb6ff`.

**The blue block is the accent.** Left for Maya is drawn in the same royal blue, so the product's one colour is the owner's share. The data palette comes as two pairs and a neutral: the cool pair is Maya's own money (Cash `#0f7c55`, Left for Maya `#3d63db`), the warm pair is the loan (Coffee machine `#a8408f`, Owes the bank `#b73c1c`), and the Cart is grey `#5e6a79` because it never changes. Each block has a lit top and a shaded side, and each idea has a lighter tint for the Chatbot's words about it (`#9bb6ff`, `#76d6ad`, `#eba4d6`, `#f9a78d`, `#b9c5d5`).

A right answer is a calm green `#8fd98f` with a tick and the word "Right". A wrong one gets a broken edge, a cross and "Not this one"; there is no red. The measuring tool found no contrast failure at any of the six sizes.

## Widget kit

One routine, `instrument()` in `royal.js`, draws both Widgets from the plain data in `../../widgets.js`: labels, amounts, a maximum and the controls. Which blocks a control moves is worked out from that data too (the routine nudges each control one step and sees which amounts change), so nothing is wired by hand for one Widget.

- **Frame and tabs.** Text tabs with a royal blue underline that slides from one to the next; a Widget the Chatbot built wears a "Built for you" tag. Arrow keys, Home and End move between them, and each Widget keeps its amounts while it is behind.
- **The amounts block.** Two stacks of solid blocks on one scale. Each total rides on top of its stack and the equals sign sits between them at the same height, so both sides are seen to rise together. The floor is dotted, one dot to a step of the control. A block carries its name when it has room, and a grip mark if it can move.
- **Grabbing a block.** It follows the hand exactly, gives a little past either end, and on release keeps the hand's speed and settles on a spring to the nearest step. The blocks that move with it are outlined, and a small readout shows the amount and how much it changed. The Cart has no grip and does not move.
- **The ledger.** Every label and amount again, under the stacks. A row lights with its block.
- **Controls.** A native range control for every amount that can move, with the two colours of the blocks it moves, its value, and the change while it is moving.
- **One teacher.** The Chatbot's words about an amount carry that amount's colour. Hovering, focusing or tapping such a word puts the lamp on its block, its ledger row and its control, and the rest falls into shade. Moving a control lights the words about it.
- **The Chatbot's hand.** When the Chatbot sets an amount, the blocks move by themselves from the old value to the new, the numbers count, and a line says what it did. When it points, the control gets one ring and the words "The Chatbot is pointing here".
- **Test intuition.** The stacks lie down as two bars on the same scale, each with its own ledger, so the question can be the loudest thing. Four answers, lettered. The right one turns green and both bars give one small hop.
- **What to keep.** The four points as a numbered list, already saved, with a line of the Student's own and Finish.
- **Notes.** A sheet that slides in from the right: what was saved in this idea (answers and Widgets, each with its amounts in words), then what was saved earlier in the Lesson.
- **A Widget being built.** While the chart is away a dashed plan shows where the blocks will stand. Then the blocks land bottom first, the totals and equals sign follow, the ledger fills, and the controls rise. Both replays in the prototype bar use this.
- **Thinking.** Three small bars stack and clear, a clock counts the seconds, and the sentence says the wait can take half a minute and that the Widget still works.

## Motion

Presses answer in 90 ms, hovers in 140 ms, arrivals in 220 to 400 ms. Two springs written with `linear()`, one that lands a hair past and one that does not. The blocks themselves run on a real spring worked out frame by frame, firmer for the Student's hand and softer for the Chatbot's. With reduced motion every state shows finished at once and nothing is left running.

## Screens

On the short laptop the top bar and the frame tighten and the type stays. With the keyboard up the top bar slims to one line, the chart lies down as two bars, the Widget panel scrolls, and a "Test intuition ↓" link jumps to the question and back.

## Checks

`node tools/drive.mjs chrome royal` and `… firefox royal` pass all 64 checks. `node tools/arrival.mjs` passes in both browsers. `node tools/audit.mjs royal` at the six sizes finds the font loaded, the 48 / 52 split, no page scroll, no contrast failure, no cut text and nothing under 12.5 px. It lists the coloured words as small targets (each has a finger-sized hit area around it) and, at the short sizes, the tabs, which are 44 px tall and sit flush against the title below.

## Guides that shaped it

From `npx modern-web-guidance`, each with a phrase from the guide:

- **slider**: "Use a labeled `<input type="range">`". Every movable amount has a native range control; the WebKit and Firefox parts are styled in separate rules because "browsers drop the entire rule" otherwise.
- **drag**: "Default to `setPointerCapture()` and clear the dragging state on `lostpointercapture`". This is how a grabbed block keeps following a hand that leaves it.
- **physics-based-easing**: "provide a standard easing function as a fallback". The two `linear()` springs have `cubic-bezier` stand-ins.
- **motion**: "Prefer to animate `opacity` and `transform`", and "Keep the final state" when motion is turned off.
- **animate-to-from-top-layer**: "you must set `transition-behavior: allow-discrete`". The Notes sheet slides in and out with `@starting-style` and `overlay`; where a browser cannot, a short script waits for the exit.
- **anchor-positioning-tab-underline**: "Tether the underline to the active item anchor". Browsers without it get a plain underline on the selected tab.
- **dynamic-sibling-animations**: "feature-detect support so older browsers still receive staggered animations". Ledger rows stagger with `sibling-index()` or a number set by the script.
- **typography**: "Use unitless numbers for `line-height`", and fluid sizes whose largest is under 2.5 times their smallest.
- **color**: "Don't use color alone to indicate the presence of a user interface component or its state". Right and wrong carry a mark and a word; progress uses shape before colour.
- **natural-interactions**: "Make each interaction state look different". Hover lightens, press sinks, focus rings.
- **dark-mode**: "Apply the `color-scheme` property to the `html` element or the `:root` pseudo-class", so scrollbars and form controls are dark too.
- **browser-ui-theming**: "Use `scrollbar-color` to customize scrollbar colors", with the selection and accent colours set the same way.

## Still weak

- Not tried on a physical iPad in Safari. iPad sizes and keyboard heights were simulated in desktop Chrome and Firefox.
- Every coloured word is a keyboard stop. By moment 5 there are a dozen of them before the message box.
- The thinking mark loops for as long as the wait lasts and has no control to pause it.
- To a red-green colour-blind Student the Coffee machine, the Cart and the Cash come out as three close greys. Their names on the blocks and in the ledger carry the meaning, but the three colours could sit further apart.
- With the keyboard up the bars are short, so a finger moves an amount in coarse steps; the slider is the finer way.
- The blue block and the accent are one blue on purpose. If a Student ever reads a blue button as part of the chart, give the block its own blue.
- Two other takes on this brief (the most reduced one, and one with a measured scale and a level line) were stopped unfinished when the owner chose this one. They are not in the repository.
