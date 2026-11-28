# The Lesson looks: screens, sizes and tokens

**Royal blocks is the chosen look.** The other three are the looks it was chosen over. In all four, the Chatbot takes the left 48% and the Widget the right 52%. Start at **1180 × 750**, the landscape iPad size, and use the short laptop to see what happens when the question and the chart compete for height.

## What the screen sizes taught

The table uses Royal blocks. "Longest line" counts characters on the longest line of the Chatbot's opening paragraph. All dimensions are CSS pixels.

| Screen | Chatbot | Longest line | Smallest text | Amounts block, opening → Test intuition | What changes |
| --- | ---: | ---: | ---: | ---: | --- |
| Full laptop, 1470 × 840 | 18 px | 67 characters | 12.5 px | 531 → 311 px | Everything at full size. Tall stacks, room to spare. |
| Short laptop, 1366 × 650 | 17.6 px | 67 characters | 12.5 px | 378 → 163 px | Top bar and Widget frame tighten. Stacks shorten; type barely moves. |
| Landscape iPad, 1180 × 750 | 16.9 px | 63 characters | 12.5 px | 436 → 194 px | The size to design for first. Nothing is cramped yet. |
| Small iPad, 1080 × 740 | 16.5 px | 56 characters | 12.5 px | 429 → 185 px | Slightly smaller type, shorter lines. Stacks still tell the story. |
| iPad, keyboard up, 1180 × 353 | 16.9 px | 63 characters | 12.5 px | 108 → 108 px | Conversation unchanged. The stacks lie down as two bars; the Widget panel scrolls; a "Test intuition ↓" shortcut appears. |
| Small iPad, keyboard up, 1080 × 348 | 16.5 px | 56 characters | 12.5 px | 108 → 108 px | The same. |

Amounts block means the whole instrument: totals, blocks and ledger together. At Test intuition the question takes space, so in Royal blocks the stacks lie down as two bars on the same scale, each with its own ledger beside it. With the keyboard up they already lie down, so nothing changes. Measured with `node tools/sizes.mjs royal`. The earlier looks, measured the same way: Playful blocks runs 72 down to 57 characters with 12.25 px smallest text, Night glow 72 down to 60 with 12 px, Bold paper 72 down to 57 with 11.5 px, dropping to 10 px with the keyboard up.

**Scaling rule.** Scale type with screen width, never with height. Hold the Chatbot between 16.5 px and 18 px, cap its column near 31 em so the usual line is about 60 characters, and keep the smallest text fixed instead of shrinking it. Let the Widget's stacks absorb lost height. When the question arrives, or below about 490 px of height, stop shrinking and switch: lay the stacks down, scroll the panel, and give Test intuition a jump link. Build at 1180 × 750 first, then check 1366 × 650 and the two keyboard-up sizes. The table records measurements from Chrome. The same six viewport sizes were checked in Firefox. A physical iPad Safari check is still open.

## The looks

### Royal blocks, the chosen look — [notes](royal/NOTES.md) · [royal.css](royal/royal.css)

- **Type.** Inter for everything, one variable file with weight and optical-size axes, self-hosted under the SIL Open Font License 1.1. Chatbot measures 18 px on the big laptop down to 16.5 px on the small iPad, unchanged with the keyboard up. The idea title reaches 50 px and the totals 42 px. Heavy weights are kept for what the Student should look at next.
- **Palette.** Blue-black canvas `#0a0f1c`, raised surface `#121929`, sunken `#060a14`, ink `#edf0f7`, quiet ink `#9da7bd`, royal blue accent `#3d63db` with a lighter tint `#9bb6ff` for small text. Data: Cash `#0f7c55`, Cart `#5e6a79`, Coffee machine `#a8408f`, Owes the bank `#b73c1c`, Left for Maya `#3d63db`, which is the accent itself.
- **Space and corners.** 4 px spacing grid (4 to 64 px), gutters 24 to 40 px. Corners 4, 8, 12 and 16 px; pills for tags and slider grooves.
- **Motion.** 90 ms presses, 140 ms hovers, arrivals in 220 to 400 ms. Blocks ride a real spring: firm under the Student's hand, softer when the Chatbot moves them. Reduced motion shows each settled state at once.

### Night glow — [notes](night/NOTES.md) · [night.css](night/night.css)

- **Type.** Geist for words, Geist Mono for amounts and labels, both variable and self-hosted under the SIL Open Font License 1.1. Chatbot measures 18.3 px on the big laptop down to 16.5 px on the small iPad, unchanged with the keyboard up. Totals reach 53 px at full size.
- **Palette.** Blue-black canvas `#0c1018`, surface `#111824`, ink `#edf4fc`, quiet ink `#b0bfd0`, mint accent `#a1f6d0`. Data: Cash `#41f3b5`, Cart `#c198ff`, Coffee machine `#ffd050`, Owes the bank `#ff966d`, Left for Maya `#71a6ff`.
- **Space and corners.** 4 px spacing grid (8 to 40 px steps), fluid gutters 24 to 52 px. Corners 5, 9 and 16 px, pills for progress.
- **Motion.** 340 ms spring arrivals, stacks lighting from the left, a brief light trace when the Chatbot changes the Widget. Reduced motion settles at once. With the keyboard up the stacks become compact horizontal meters; legends keep every amount readable.

### Bold paper — [notes](paper/NOTES.md) · [paper.css](paper/paper.css)

- **Type.** Fraunces for chapter heads, Widget titles and totals; DM Sans for conversation and ledger. Both variable, self-hosted, SIL Open Font License 1.1. Chatbot measures 18.9 px down to 16.7 px; totals reach 58 px at full size and drop to 19 px with the keyboard up.
- **Palette.** Paper `#fcfaf3`, leaf `#f1eee4`, ink `#20231e`, quiet ink `#52564b`, cobalt accent `#1849b3`, gold chart `#ffdb82`. Data: Cash `#16836d`, Cart `#d44429`, Coffee machine `#f38fac`, Owes the bank `#7c2545`, Left for Maya `#204ac5`. Opposite hatching links the machine and the debt that bought it.
- **Space and corners.** Spacing in quarter-rem steps (4 to 48 px), wide page edges. Corners almost square at 2 px; pills only for progress marks.
- **Motion.** 320 ms print-like unfolding, blocks rising in register, totals flicking as they change. Reduced motion respected throughout. With the keyboard up the Widget scrolls and the question gets the same jump shortcut in both directions.

### Playful blocks — [notes](play/NOTES.md) · [play.css](play/play.css)

- **Type.** Bricolage Grotesque for everything, variable 200 to 800, self-hosted, SIL Open Font License 1.1. Chatbot measures 17.9 px down to 16.5 px; smallest text fixed at 12.25 px at every size, keyboard up included.
- **Palette.** Paper `#fffdf7`, ink `#252038`, quiet ink `#595468`, lilac Widget field `#e5d9fc`, violet accent `#5836be`. Data: Cash `#51d5ae`, Cart `#ffa740`, Coffee machine `#ec80dc`, Owes the bank `#ff775e`, Left for Maya `#4463df`.
- **Space and corners.** 4 px spacing unit (4 to 48 px), gutters `clamp(24px, 3vw, 52px)`. Corners 5, 10 and 16 px; pills for tags and slider tracks.
- **Motion.** 260 ms springs: blocks stack in with a stagger, a grabbed face tips and highlights, the changed blocks regrow when the Chatbot acts. Drag a movable block directly, or use its slider; the fixed Cart never moves. Reduced motion shows the final state plainly.

All four looks use tabular, lining numerals, keep touch targets at 44 px or more, honour reduced motion, and work opened straight from the file with nothing loaded from the network.
