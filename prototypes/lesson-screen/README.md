# PROTOTYPE: the Lesson screen

Throwaway. Not the product, and nothing here is carried into it. It lives on the `prototype/lesson-screen` branch only and is never merged.

## The question

What does a Student see on a landscape screen during a Lesson, and how does it move? (Ticket: [How the Lesson screen looks and moves](https://github.com/SiddharthMuramkar/valueit/issues/14).)

## How to open it

Double-click `index.html`. It opens in the browser; there is nothing to install or start.

Everything is driven from the dark bar at the bottom:

- **Version** (or the ← → keys): three different screens, A, B and C.
- **Moment** (or the ↑ ↓ keys): nine moments of one made-up Lesson, the same in every version.
- **Screen**: this window, a big or small laptop, an iPad held sideways, a smaller iPad.
- **iPad keyboard up**: shows what is left of the screen while a Student types on an iPad.

The buttons inside the screen work too: drag the sliders, press "I'm stuck", pick an answer, press "Go on". In version A, drag the line between the two panes to change the split; the bar shows the numbers.

The address bar keeps the view, so a copied link reopens the same version, moment and screen.

## The three versions

| | A · Two panes | B · One stream | C · Widget as the stage |
|---|---|---|---|
| Layout | Chatbot left, Widget right | Words and Widgets in one flow down the middle | Widget fills the screen; the Chatbot speaks in a band underneath |
| What stays fixed | Top bar, message box, the Widget | Top bar, message box | The Widget, the band |
| What scrolls | The conversation | Everything else | Nothing; earlier messages are behind "Earlier" |
| Stepping through | Idea markers in the top bar, "Go on" in the conversation | List of ideas down the left, scrolling, "Go on" | Progress line across the top, "Go on" in the band |
| Test intuition | Under the chart, inside the Widget | Under the chart, inside the Widget, in the flow | Beside the chart, inside the Widget |
| "I'm stuck" | Beside the message box | On the Widget itself | One fixed button in the band |
| An AI-built Widget | Opens as a tab on the right | Appears in the flow, under the answer | Opens beside the Lesson's own Widget |
| Saving a Note | Button on each Widget, under an answer, on "What to keep" | Same | Same |
| Web source link | Under the answer that used the web | Same | In the band, under the answer |

## The nine moments

1. The Chatbot opens an idea, with a ready-made Widget.
2. The Student asks a question; the Chatbot thinks.
3. The Chatbot answers and builds a Widget.
4. A question about today: the answer shows its web source link.
5. Test intuition opens inside the Widget.
6. The Student presses "I'm stuck": a hint, never the answer.
7. A wrong pick: the Chatbot explains by changing the Widget.
8. A right pick, and moving on to the next idea.
9. "What to keep", and saving it as a Note with a line of the Student's own.

## What is made up

All of it: the coffee cart, the numbers, the Chatbot's words, the question and its answers, the source link. Colours and type are placeholders; look and feel is a later question.

## Files

`index.html` (the page and the bar), `lesson.js` (the made-up Lesson and the nine moments), `widgets.js` (the made-up Widgets and shared pieces), `variant-a.js`, `variant-b.js`, `variant-c.js` (one file per version), `harness.js` (the bar, screen sizes, fake keyboard), `proto.css`.
