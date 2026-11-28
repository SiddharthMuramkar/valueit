# Night glow

Two stacks of light share a baseline. Borrowing lights up the machine and the bank together while Maya’s blue block stays still.

## Type and colour

Geist for the conversation and controls. Geist Mono for readings, counters and small labels. Both variable Latin fonts ship here under the SIL Open Font License 1.1, with their licences in `fonts/`.

| Viewport | Conversation | Idea title | Full Widget reading | Opening paragraph |
| --- | ---: | ---: | ---: | ---: |
| 1470 × 840 | 18.3 px | 46.9 px | 53.3 px | 68 characters per line |
| 1366 × 650 | 17.8 px | 44.9 px | 51.1 px | 68 characters per line |
| 1180 × 750 | 16.9 px | 41.3 px | 47.2 px | 53 characters per line |
| 1080 × 740 | 16.5 px | 39.3 px | 45.1 px | 53 characters per line |
| Keyboard up | Same as corresponding iPad | Same as corresponding iPad | 23.2 / 22.4 px | 53 characters per line |

The figures use tabular lining numerals. The opening paragraph widths are estimates from the audit. Captions are 12 px and controls 14 px. The body scale combines rem and viewport width. The short laptop places the controls side by side. Test intuition turns the tall columns into two compact horizontal meters and keeps their labels in place. With the keyboard up the frame keeps its header in view and its body scrolls. The Test intuition link jumps between the question and the instrument.

Blue-black canvas `#0c1018`, surface `#111824`, bright ink `#edf4fc`, quiet ink `#b0bfd0`, rule `#344254`, mint accent `#a1f6d0`. Cash is mint `#41f3b5`, cart violet `#c198ff`, machine gold `#ffd050`, bank loan coral `#ff966d`, Maya blue `#71a6ff`. Each part has a written label and amount. Spacing follows a four-pixel grid, with fluid outer gutters. Corners use 5, 9 and 16 px.

## Widget kit

- **Frame, tabs and Note button.** The frame holds one Widget. Tabs use arrow keys and preserve current slider values when switching. Save toggles the Note and its count.
- **Paired readings, meters and ledgers.** One renderer reads the two arrays from the shared Widget model. Both stacks use the same fixed maximum for that Widget. Each coloured segment, legend label and amount comes from the same record, including zeroes.
- **Controls.** Native sliders update both sides immediately. Grab a changing segment to move its corresponding control. The fixed pieces keep their shape. Years of use reduce machine value and Maya’s share together.
- **Chatbot marks.** A reset badge connects the Chatbot’s words to a brief transfer of light and a changing amount. The hint outlines the relevant slider. The thinking signal pulses briefly beside the half-minute explanation. Reduced motion settles directly on the new state.
- **Test intuition.** Four labelled choices share the Widget frame. A wrong choice stays visible with feedback. A correct choice lights up and reveals Go on in the conversation.
- **What to keep.** The four Lesson points, Note button, optional line and Finish action use the same frame. Notes and edits last for the current visit.

The small horizontal meters have less room to show the individual segments. Their legends keep every value readable. The board remains a simulated landscape iPad in desktop browsers. Physical iPad Safari and touch feedback have yet to be checked.
