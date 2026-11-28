# Playful blocks

Two stacks of solid blocks stand on a dotted board and grow together. Drag a block itself: borrowing grows the machine and the bank debt together while Maya's blue block stays exactly where it was.

## Type and colour

Bricolage Grotesque sets everything: conversation, headings, totals and controls. One variable file, weights 200 to 800, self-hosted as `fonts/bricolage.woff2`. Licensed under the SIL Open Font License 1.1; the full text sits beside it as `fonts/OFL-Bricolage.txt`. Figures use lining, tabular numerals, so amounts do not jiggle as a slider moves. Body text is weight 480 at line height 1.48, with optical sizing on; conversation paragraphs run to 60ch at line height 1.54.

| Viewport | Chatbot | Idea title | Widget title | Totals | Longest opening line |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1470 × 840 | 17.9 px | 57.0 px | 33.6 px | 43.4 px | 72 characters |
| 1366 × 650 | 17.5 px | 54.6 px | 32.4 px | 41.6 px | 68 characters |
| 1180 × 750 | 16.8 px | 50.3 px | 30.2 px | 38.5 px | 63 characters |
| 1080 × 740 | 16.5 px | 48.0 px | 29.0 px | 36.8 px | 57 characters |
| 1180 × 353, keyboard up | 16.8 px | 30.2 px | 18.9 px | 16.0 px | 63 characters |
| 1080 × 348, keyboard up | 16.5 px | 29.0 px | 18.9 px | 16.0 px | 57 characters |

Chatbot and longest-line figures are measured; title and totals figures are computed from the fluid scale in `play.css`. The smallest text is fixed at 12.25 px (`--micro`) at every size: captions, tabs, legend labels and Test intuition verdicts. It never shrinks with the screen. Controls are 14 px (`--ui`).

Warm paper `#fffdf7` on canvas `#f7f3eb`, ink `#252038`, quiet ink `#595468`, rule `#ccc4d4`. The Widget board is lilac: field `#e5d9fc`, tray `#f3edfc`, dot grid `#bdacd5`, accent violet `#5836be` with soft fill `#e5ddfe`. Data colours, one per idea everywhere including the Chatbot's words: Cash mint `#51d5ae`, Cart orange `#ffa740`, Coffee machine pink `#ec80dc`, Owes the bank coral `#ff775e`, Left for Maya blue `#4463df`. Darker inks carry the words: Maya blue ink `#2944ab`, bank ink `#9b351f`, right-answer green `#14543c` on `#c5f4d4`. Spacing follows a 4 px unit (4, 8, 12, 16, 24, 32, 48) with gutters of `clamp(24px, 3vw, 52px)`. Corners are 5, 10 and 16 px with a pill for tags and slider tracks.

## Widget kit

One drawing routine builds both Widgets from the shared data in `../../widgets.js`: labels, amounts, a fixed maximum and the controls. Nothing is drawn for one Widget that the other could not reuse.

- **Frame, tabs and the Note button.** The frame holds one Widget at a time. A second Widget arrives as a "Built for you" tab and takes the front; tabs use arrow keys, Home and End, and each Widget keeps the Student's slider values while hidden. "Save as Note" sits in the frame header, flips to "Saved to Notes ✓" and back, and updates the Notes count in the top bar. The Notes list lives only for the visit.
- **The amounts block: totals, stacks and ledger.** Two totals sit over two stacks, joined by an equals badge. Both sides share one fixed maximum (16,000 for the cart, 12,000 for the machine), so equal totals mean equal heights: the two sums are added from the same numbers that size the blocks, and they cannot drift apart. Under the board, a two-column ledger repeats every block's label and amount in words; the board, ledger and totals always agree. Block faces carry their name when the face is at least 24 px tall and 94 px wide; smaller blocks speak only through the ledger.
- **Variable blocks, fixed cart.** Cash, Coffee machine, Owes the bank and Left for Maya move; the Cart block is fixed at 4,000 in every state. It has no slider, no drag and no grab cursor. In the second Widget, years of use shrink the machine and Maya's share together while Cash, Cart and the bank stay put.
- **Controls, two ways to use each.** Every movable block maps to a native range control: Cash and Maya's share to "Maya's own money", machine and bank debt to the bank loan, machine and Maya's share in the second Widget to years of use. Grabbing a block drags that same control, so the slider, its readout and the keyboard all stay in step. Dragging is vertical, snapped to the control's steps, and the slider remains the keyboard route. Touch targets are at least 44 px.
- **The Chatbot's hand.** When the Chatbot sets an amount, a line under the board says so ("The Chatbot set the bank loan back to 0") and the changed blocks grow from their old height. When it points, the loan control gets a violet outline and the same line. The thinking state shows three hopping blocks beside an honest half-minute warning; the Widget stays live throughout.
- **Test intuition.** The question and four answers move into the Widget. The board compacts: totals drop to one line at 20 px and the stacks shorten, so the answers fit without scrolling at full sizes. A wrong pick is marked "Not this one" and stays visible; the right one turns green, marked "Right ✓".
- **What to keep.** The four Lesson points as a list, already saved to Notes, with a strip to add a line of the Student's own. The line is editable: Done folds it into an edit button showing the line, and it joins the saved Note. Finish marks the prototype Lesson as finished.

## Motion

New messages rise into place over 260 ms. Block arrivals are staggered by 45 ms. A grabbed face tips briefly and gains a white outline. Totals update immediately during a drag. When the Chatbot changes the loan, the affected blocks grow from their earlier heights over 310 ms. A correct answer gives the letter tile a brief bounce. Reduced motion shows each settled state immediately.

The typography guide’s “Use unitless numbers for `line-height`” keeps the reading rhythm as text scales. The slider guide’s “Use a labeled `<input type="range">`” gives each movable part a keyboard equivalent. The motion guide says “Prefer to animate `opacity` and `transform`”, which shaped how messages arrive and how the changed blocks settle.

## Keyboard up, and what is still weak

With the keyboard up there are about 350 px. The conversation keeps its full size: type is driven by width, not height, so the Chatbot still reads at 16.8 or 16.5 px. The Widget pays instead. The panel scrolls; the board becomes a fixed 74 px strip with totals at 16 px and the stacks as shallow bands; a "Test intuition ↓" shortcut appears, flipping to "Widget ↑", so all four answers are one press away. The full amounts block (totals, stacks and ledger) measures 100 px at 1180 wide and 119 px at 1080 wide, against 392 and 385 px at full height. On the small iPad the ledger wraps to an extra line, which accounts for the taller 119 px.

Trade-offs accepted: at keyboard height the stacks are symbolic and the ledger does the real reading; drag travel is short, so the loan jumps in coarser steps by finger than by slider; face labels vanish on small blocks, leaving the legend. Still unchecked: a physical iPad in Safari, and how the squash-and-grab feels under a real finger rather than a mouse.
