// PROTOTYPE, throwaway. One made-up Lesson, shared by all three versions.
// Nothing here is real Lesson content.
window.P = { variants: {} };

// Tiny DOM helper.
P.h = (tag, attrs, ...kids) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'text') el.textContent = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid);
  return el;
};

P.lesson = {
  topic: 'Accounting 101',
  number: 1,
  title: 'What a company owns, owes and earns',
  ideas: ['What the cart owns', "What it owes, and what's left", 'What it earns', 'Where the cash went'],
  next: 'Lesson 2: The income statement',
};

P.testIntuition = {
  q: "Maya borrows 5,000 from the bank and buys a coffee machine with it. What happens to what's left for Maya?",
  answers: [
    'It goes up by 5,000. She has a new machine.',
    'It goes down by 5,000. She owes the bank.',
    'It stays the same. She owns 5,000 more and owes 5,000 more.',
    'It depends on how good the machine is.',
  ],
  right: 2,
};

P.keep = [
  "What a company owns always equals what it owes plus what's left for its owners.",
  'Borrowing grows both sides. On the day, it makes the owners neither richer nor poorer.',
  "When something it owns loses value, the loss comes out of what's left for the owners.",
  'What it earns is what came in, minus what it cost to bring it in. Cash can still fall in a year it earns money.',
];

// The whole conversation, in order. Each moment shows the first `upto` items.
// t: divider | bot | me | thinking | widget (a Widget enters) | use (the Chatbot uses a Widget again)
//    | act (something the Student pressed) | skip | summary
P.stream = [
  { t: 'divider', label: "Idea 2 of 4 · What it owes, and what's left" },
  { t: 'bot', id: 'b1', html: "Maya's coffee cart <b>owns</b> things: the cart itself and some cash. She paid for them with her own money. If she borrows, the cart also <b>owes</b> something. Whatever it owns and does not owe is <b>left for Maya</b>.<br>Drag the bank loan up and watch both bars." },
  { t: 'widget', w: 'lesson' },
  { t: 'me', id: 'm1', text: 'What if the machine gets old and is worth less?' },
  { t: 'thinking', id: 't1' },
  { t: 'bot', id: 'b2', save: true, html: "Then the cart owns less, but the loan stays the same. So the loss comes out of what's left for Maya. I built a Widget so you can watch it happen: drag the years." },
  { t: 'widget', w: 'built' },
  { t: 'me', id: 'm2', text: 'Is there a real company today with less than nothing left for its owners?' },
  { t: 'bot', id: 'b3', save: true, html: "Yes. Starbucks is one. On paper it owes more than it owns, so what's left for its owners is below zero. It keeps going because it brings in plenty of cash every year.", source: 'Starbucks annual report · sec.gov' },
  { t: 'bot', id: 'b4', html: "Let's check the idea has landed. There is a question inside the Widget. Take your time, and ask me for a hint if you want one." },
  { t: 'use', w: 'lesson' },
  { t: 'act', id: 'a1', text: "You pressed “I'm stuck”" },
  { t: 'bot', id: 'b5', html: 'No sums needed. Drag the bank loan to 5,000 and keep your eye on the blue block. Does it move?' },
  { t: 'act', id: 'a2', text: 'You picked “It goes up by 5,000”' },
  { t: 'bot', id: 'b6', html: "Not this one, and it is the most common slip. She does own a new machine. But she owes the bank the same 5,000. I've set the loan to 5,000 for you: both bars grew, and the blue block did not move. Have another go." },
  { t: 'use', w: 'lesson' },
  { t: 'act', id: 'a3', text: 'You picked “It stays the same”' },
  { t: 'bot', id: 'b7', go: 'Go on: What it earns', html: "Yes. Borrowing adds the same amount to both sides, so what's left for the owner does not change. Next: what the cart earns." },
  { t: 'skip', text: 'two more ideas: What it earns · Where the cash went' },
  { t: 'divider', label: 'What to keep' },
  { t: 'bot', id: 'b8', html: "That's the Lesson. Here is what to keep. Save it to your Notes if you like." },
  { t: 'summary' },
];

const s0 = { open: ['lesson'], focus: 'lesson', lesson: { own: 6000, loan: 0 }, built: { years: 0 }, ti: null, idea: 1 };
const sBuilt = { ...s0, open: ['lesson', 'built'], focus: 'built', lesson: { own: 6000, loan: 5000 } };
const sTI = { ...s0, open: ['lesson', 'built'], focus: 'lesson', ti: 'open' };

// The nine moments the owner steps through.
P.moments = [
  { title: 'The Chatbot opens an idea', upto: 3,
    says: 'The Chatbot opens the idea beside its first Widget. Drag the sliders to change the amounts.',
    stage: s0 },
  { title: 'The Student asks, the Chatbot thinks', upto: 5,
    says: 'At xhigh effort the wait before the first word was measured at 23 to 52 seconds. The Widget stays usable while it thinks.',
    stage: { ...s0, lesson: { own: 6000, loan: 5000 } } },
  { title: 'The Chatbot answers and builds a Widget', upto: 7,
    says: "An AI-built Widget appears. Look at where it lands, and what happens to the Lesson's own Widget.",
    stage: sBuilt },
  { title: 'A question about today', upto: 9,
    says: 'This answer used the web, so it shows a source link. No other answer shows a source.',
    stage: sBuilt },
  { title: 'Test intuition', upto: 11,
    says: "The question opens inside the Widget, with four answers. Click an answer, or “I'm stuck”.",
    stage: { ...sTI, changed: { w: 'lesson', what: 'the bank loan back to 0' } } },
  { title: "“I'm stuck”", upto: 13,
    says: "Before a pick the Chatbot gives a hint, never the answer, and points at the Widget. Compare where “I'm stuck” sits in each version.",
    stage: { ...sTI, point: { w: 'lesson', key: 'loan' } } },
  { title: 'A wrong pick', upto: 16,
    says: 'The pick is marked and the Chatbot explains by changing the Widget: it set the loan to 5,000.',
    stage: { ...sTI, lesson: { own: 6000, loan: 5000 }, ti: 'wrong', wrong: 0, changed: { w: 'lesson', what: 'the bank loan to 5,000' } } },
  { title: 'A right pick, and moving on', upto: 18,
    says: 'The idea is done. Look at how the Student steps on to the next idea.',
    stage: { ...sTI, lesson: { own: 6000, loan: 5000 }, ti: 'right', wrong: 0, ideaDone: true } },
  { title: 'What to keep, and saving a Note', upto: 22,
    says: 'The end of the Lesson. The Student saves the summary as a Note and can add a line of their own.',
    stage: { ...s0, open: ['summary'], focus: 'summary', idea: 4, noteOpen: true } },
];

// Where the Student is among the Lesson's ideas.
P.ideaStates = (stage) => {
  const L = P.lesson;
  const ideas = L.ideas.map((label, i) => ({
    label,
    state: i < stage.idea || (i === stage.idea && stage.ideaDone) ? 'done' : i === stage.idea ? 'now' : 'later',
  }));
  ideas.push({ label: 'What to keep', end: true, state: stage.idea >= L.ideas.length ? 'now' : 'later' });
  const now = stage.idea >= L.ideas.length
    ? 'What to keep'
    : `Idea ${stage.idea + 1} of ${L.ideas.length}: ${L.ideas[stage.idea]}`;
  return { ideas, now };
};
