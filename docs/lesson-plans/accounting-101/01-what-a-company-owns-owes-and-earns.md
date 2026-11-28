# Accounting 101, Lesson 1: What a company owns, owes and earns

This is the model Lesson Plan: the other eleven copy its shape. It was decided with the owner in [The first Accounting 101 Lesson Plan](https://github.com/SiddharthMuramkar/valueit/issues/22) on 28 November 2026.

| | |
|---|---|
| Topic | Accounting 101, Lesson 1 of 12 |
| Built on | Damodaran's Accounting Class: the preview and Session 1, "Financial Statements: An Overview" |
| Length | about 25 minutes, in one sitting |
| Running example | Maya's coffee cart, a made-up company |
| Test intuitions | 3 |
| Widget briefs | 5 for the Lesson, 2 more for wrong answers |
| Next | Lesson 2: How profit is counted |

## What the Student can do at the end

Before this Lesson, a Student with no finance background cannot read a company's accounts. Afterwards, without the Chatbot, they can:

1. Say which of the three statements answers which question: what a company owns and owes (balance sheet), what it earned (income statement), where its cash went (cash flow statement).
2. Put a simple item on the right statement and the right side: a coffee machine, a bank loan, a year's sales, a loan repayment.
3. Work out what is left for the owners from what a company owns and owes, and say what happens to it when the company borrows, or when something it owns loses value.
4. Read an income statement from sales down to net income, and say which profit figures a given cost lowers.
5. Explain why a year's profit and the year's change in cash differ.

## The running example: Maya's coffee cart

Maya sets up a small company to sell coffee from a cart. The figures are round and the same in every Widget. Amounts are in dollars.

**Day one.** Maya puts in 6,000 of her own money, and the company buys the cart for 4,000. The bank lends the company 5,000 at 10% a year, and the company buys a coffee machine with it.

| Owns, on day one | | Owes, and what's left, on day one | |
|---|---:|---|---:|
| Cart | 4,000 | Owes the bank | 5,000 |
| Coffee machine | 5,000 | Left for Maya | 6,000 |
| Cash | 2,000 | | |
| **Total** | **11,000** | **Total** | **11,000** |

**The first year.**

| The year's income statement | |
|---|---:|
| Sales (coffee sold) | 40,000 |
| minus the cost of the coffee sold (beans, milk, cups) | 14,000 |
| **Gross profit** | **26,000** |
| minus pitch rent and permit | 8,500 |
| minus marketing | 1,000 |
| minus wear on the cart and the machine (1,000 each) | 2,000 |
| **Operating profit** | **14,500** |
| minus interest (10% of 5,000) | 500 |
| **Taxable income** | **14,000** |
| minus tax at 25% | 3,500 |
| **Net income** | **10,500** |

| The year's cash flow statement | |
|---|---:|
| Cash at the start | 2,000 |
| Cash from operations: net income 10,500, plus wear added back 2,000 | +12,500 |
| Cash for investing: a new grinder | −3,000 |
| Cash for financing: 1,000 of the loan repaid, 5,000 paid to Maya | −6,000 |
| **Cash at the end** | **5,500** |

| Owns, at the year's end | | Owes, and what's left, at the year's end | |
|---|---:|---|---:|
| Cart (4,000 less 1,000 of wear) | 3,000 | Owes the bank | 4,000 |
| Coffee machine (5,000 less 1,000 of wear) | 4,000 | Left for Maya (6,000 + 10,500 − 5,000) | 11,500 |
| Grinder | 3,000 | | |
| Cash | 5,500 | | |
| **Total** | **15,500** | **Total** | **15,500** |

**Kept simple on purpose.** Nothing is sold on credit, the stock of beans is the same at both ends of the year, interest and tax are paid within the year, and the grinder is bought at the year's end, so it has no wear yet. Working capital therefore stays at zero until it is taught in Lessons 5 and 7.

**Checks.** Both balance sheets balance. Cash at the start plus the three flows equals cash at the end: 2,000 + 12,500 − 3,000 − 6,000 = 5,500. Left for Maya grows by net income less what was paid to her: 6,000 + 10,500 − 5,000 = 11,500.

**Reused later.** Lessons 2, 3, 5 and 7, where Damodaran uses no companies, grow Maya's cart. His real companies come in from Lesson 4, as in his Class.

## Damodaran's views

Parts of Session 1 are his opinion, not accounting fact: an accountant is a historian; the cash flow statement is "the most honest"; fair value pushes accountants into valuing things, which he thinks is not their job. The Chatbot says when it is giving his view, for example: "That's Damodaran's view; many accountants disagree."

## Ideas, in order

Each idea runs the same way: the Chatbot opens it beside its Widget, the Student plays with the Widget, a Test intuition follows where there is one, and the Chatbot explains the answer using the Widgets. The Chatbot words everything itself. The lines below say what must land, not what to say.

### 1. A company, and who pays for it (about 5 minutes)

**What the Student must understand.**

- A company is a business set up as its own thing, separate from the people who own it. Maya's company owns the cart; Maya owns the company.
- Its money comes from two kinds of people. Owners put money in and get whatever is left after everyone else is paid: a lot in a good year, nothing in a bad one. Lenders lend money for a fixed promise, interest each year and their money back, and are paid before the owners get anything.
- Because the company is separate, the most Maya can lose is what she put in.
- Accountants record what has already happened; they do not predict or value (his view). Their statements answer three questions about a company: what does it own, what does it owe, and how much did it make?

**Widget:** [W1 · Who paid for the cart](#w1--who-paid-for-the-cart).

**Where a Student gets stuck, and how the Chatbot helps.**

- *Thinks Maya and her company are the same, so the company's loan is Maya's own debt.* The Chatbot sets W1's sale price to 3,000: the bank takes the 3,000, and Maya loses her 6,000 and owes nothing more.
- *Thinks owners are paid a fixed amount, like lenders.* The Chatbot slides W1's sale price from 20,000 down to 3,000: the bank's share barely moves, while Maya's swings.
- *Hears "accountants record the past" as a complaint.* The Chatbot says it is what makes the numbers checkable; judging what a company is worth is the Student's job, later in the Course.

### 2. What it owns and owes on one day: the balance sheet (about 6 minutes, with Test intuition 1)

**What the Student must understand.**

- The balance sheet is a photo taken on one day: what the company owns (its assets) and what it owes (its liabilities) on that day.
- What it owns falls into four groups: things that last for years (fixed assets: the cart, the machine), things that turn over within a year (current assets: cash, stock), investments in other companies (financial assets), and things you cannot touch, such as a brand (intangible assets). Maya's cart has only the first two.
- What it owes: bills due within a year (current liabilities), loans (debt), and other promises.
- Whatever is left after taking what it owes from what it owns belongs to the owners. This is equity, "Left for Maya". It is a leftover, which is why the two sides always balance, and it is not a pile of cash.
- When something the company owns loses value, the loss comes out of what is left for the owners; the bank is still owed the same.

**Widget:** [W2 · The cart's balance sheet](#w2--the-carts-balance-sheet).

**Test intuition:** [Test intuition 1](#test-intuition-1-after-idea-2-in-w2).

**Where a Student gets stuck, and how the Chatbot helps.**

- *Thinks equity is money in the bank.* The Chatbot points at Cash (2,000) and Left for Maya (6,000) in W2: different amounts, on different sides. Most of Maya's 6,000 became the cart.
- *Thinks the sides balance by luck, or because someone fiddled them.* The Chatbot moves any control in W2 and shows Left for Maya resizing itself: it is defined as the difference.
- *Stumbles on the words "assets" and "liabilities".* The Chatbot says "owns" and "owes" first, then brings in the words.
- *Reads "current" as "now".* The Chatbot: here, current means "within a year".

### 3. What it earned over the year: the income statement (about 6 minutes, with Test intuition 2)

**What the Student must understand.**

- The income statement covers a period, here a year, where the balance sheet covers a single day: a video, not a photo.
- It starts with sales (revenue) and takes away costs in layers. Each layer leaves a profit figure that answers a different question:
  - Gross profit: sales minus the cost of what was sold. How profitable is making the coffee?
  - Operating profit: minus the other costs of running the business, here rent, marketing and wear. How profitable is the business?
  - Taxable income: minus interest, the cost of borrowing.
  - Net income: minus tax. What is left for the owners.
- Interest comes after operating profit because it depends on how the company was paid for, not on how well it sells coffee. Two identical carts, one bought with a loan, have the same operating profit.
- Wear (depreciation) spreads the cost of the cart and the machine over the years they are used. Lesson 2 goes further.

**Widget:** [W3 · The cart's year, line by line](#w3--the-carts-year-line-by-line).

**Test intuition:** [Test intuition 2](#test-intuition-2-after-idea-3-in-w3).

**Where a Student gets stuck, and how the Chatbot helps.**

- *Confuses sales with profit: "the cart made 40,000".* The Chatbot points at the two ends of W3: 40,000 at the top, 10,500 at the bottom.
- *Gets lost in the layers.* The Chatbot names only three at first, sales, operating profit and net income, then fills in the rest.
- *Thinks interest is a cost of making coffee.* The Chatbot builds [W7 · Two carts, two ways of paying](#w7--two-carts-two-ways-of-paying).
- *Asks why wear is a cost when no money left.* The short answer for now: the machine was paid for on day one, and its cost is spread over its life. Idea 4 comes back to it.

### 4. Where the cash went: the cash flow statement, and how the three connect (about 6 minutes, with Test intuition 3)

**What the Student must understand.**

- The cash flow statement covers the same year and records cash in and cash out, in three groups:
  - operations: cash from selling coffee, after paying running costs, interest and tax;
  - investing: cash spent on things that last, here the grinder;
  - financing: cash from and to lenders and owners, here the loan repayment and the payment to Maya.
- Money in is shown as a plus and money out as a minus. Accounting rules cannot change cash in and cash out, which is why Damodaran calls it the most honest of the three statements (his view).
- Profit is not cash. Wear is a cost with no cash leaving, so it is added back. Buying a grinder, repaying a loan and paying Maya all use cash, but none is a cost of this year.
- The three statements are linked. Profit kept in the company adds to Left for Maya. Wear lowers the cart and the machine. The grinder appears as something owned. The repayment lowers what is owed. The year's change in cash is the change in the Cash block.

**Widget:** [W4 · First day to last day](#w4--first-day-to-last-day).

**Test intuition:** [Test intuition 3](#test-intuition-3-after-idea-4-in-w4).

**Where a Student gets stuck, and how the Chatbot helps.**

- *Thinks a profitable company must have more cash.* The Chatbot sets W4's grinder, repayment and payment to Maya to zero: cash rises by 12,500, more than the profit. Then it puts them back.
- *Thinks repaying the loan is a cost.* The Chatbot moves W4's repayment and shows that net income does not move.
- *Gets lost with three statements at once.* The Chatbot changes one number, the grinder's price, and follows it to the two places it lands.
- *Counts the payment to Maya as a cost.* The Chatbot: a payment to the owner is a share of the profit, not a cost of earning it.

### 5. The rules behind the numbers (about 2 minutes)

**What the Student must understand.**

- Accounting follows written rules, so that companies can be compared and the numbers measure what they claim to.
- Two sets cover most companies: GAAP in the United States and IFRS in about 90 other countries (his 2020 figure). They have grown alike.
- Read the statements by asking "what does this mean in accounting?" rather than "does this make sense?". The two answers are not always the same.
- Accounting is being pushed to show what things are worth today (fair value), not only what they cost. Damodaran thinks this asks accountants to forecast, which is not their job (his view).

**Widget:** [W5 · What it cost, or what it might sell for now](#w5--what-it-cost-or-what-it-might-sell-for-now).

No Test intuition here: Lesson 1 has three, one each after ideas 2, 3 and 4.

**Where a Student gets stuck, and how the Chatbot helps.**

- *Wonders whether to learn the rules.* No: this Topic teaches reading the statements, not writing them, as Damodaran says in his preview.
- *Takes fair value as plainly better: "surely today's value is more useful".* The Chatbot uses W5: the estimate is a guess, and Left for Maya moves with the guess.

## Widget briefs

The Chatbot builds every Widget live from Building blocks, in the Royal blocks look. Amounts are in dollars. A Widget's controls move it in the browser with no call to the Chatbot. The Chatbot reads the settings when the Student writes or answers, and can set any control itself.

### W1 · Who paid for the cart

- **The Student must see** the two sources of the company's money as two blocks, Maya's 6,000 and the bank's 5,000, and then what each gets if the company is sold: the bank first, up to what it is owed; Maya whatever is left, which can be nothing.
- **Fixed figures.** Maya's money: 6,000. The loan's interest, 10% a year, is paid yearly and is not part of the sale.
- **The Student can change** the bank loan, 0 to 8,000 in steps of 1,000 (starts at 5,000), and the price the company sells for, 0 to 20,000 in steps of 500 (starts at 11,000).
- **The maths.** The bank gets the smaller of the price and the loan. Maya gets the price minus the bank's share. Beside Maya's share sits her gain or loss against the 6,000 she put in.
- **Settings the Plan uses.** Price 20,000: the bank still gets 5,000, and Maya gets 15,000. Price 3,000: the bank gets 3,000 and loses 2,000; Maya gets nothing and loses her 6,000, but no more.

### W2 · The cart's balance sheet

This is the Widget from the Lesson screen prototype, extended.

- **The Student must see** two stacks of blocks on one scale, "Owns" and "Owes + what's left", with their totals level, dated "Day one". Owns: Cart, Coffee machine, Cash. Owes + what's left: Owes the bank, Left for Maya. Each block carries its group as a small label: fixed asset, current asset, debt, equity.
- **Fixed figures.** Cart: 4,000.
- **The Student can change**
  - the bank loan, 0 to 8,000 in steps of 1,000 (starts at 5,000). Borrowed money buys the coffee machine, so the machine starts at the size of the loan;
  - Maya's own money, 4,000 to 8,000 in steps of 1,000 (starts at 6,000). Whatever is not spent on the cart is cash;
  - value lost on the machine in a breakdown, 0 to 5,000 in steps of 500 (starts at 0), never more than the machine.
- **The maths.** Coffee machine = loan − value lost. Cash = Maya's money − 4,000. Owns = Cart + Coffee machine + Cash. Owes the bank = loan. Left for Maya = Owns − Owes the bank. It can go below zero, and is then drawn below the floor and labelled "below zero".
- **Settings the Plan uses.** Day one: loan 5,000, Maya's money 6,000, nothing lost. For Test intuition 1, the Chatbot first sets the loan to 0.

### W3 · The cart's year, line by line

- **The Student must see** the year's income statement as a cascade, dated "Over the year": Sales at the top, each cost a block stepping down, and each profit figure (gross profit, operating profit, taxable income, net income) as a bar with one line on what it measures. When a control moves, the lines that change light up and the others are marked "unchanged".
- **Fixed figures.** Marketing 1,000. Wear 2,000. Loan 5,000. Tax: 25% of taxable income, and none when taxable income is below zero.
- **The Student can change** sales, 20,000 to 60,000 in steps of 1,000 (starts at 40,000); the cost of the coffee sold, 8,000 to 20,000 in steps of 500 (starts at 14,000); pitch rent and permit, 4,000 to 12,000 in steps of 500 (starts at 8,500); and the interest rate on the loan, 0% to 20% in steps of 1% (starts at 10%).
- **The maths.** Gross profit = sales − cost of the coffee sold. Operating profit = gross profit − rent − marketing − wear. Interest = rate × 5,000. Taxable income = operating profit − interest. Tax = 25% of taxable income when above zero. Net income = taxable income − tax.
- **Settings the Plan uses.** The year as in the table. For Test intuition 2, an interest rate of 20%: interest 1,000, taxable income 13,500, tax 3,375, net income 10,125, with gross and operating profit unchanged.

### W4 · First day to last day

- **The Student must see** the day-one balance sheet on the left and the year-end balance sheet on the right, both as block stacks on one scale. Between them sits the year: net income from the income statement, and the cash flow statement as a bridge from cash at the start to cash at the end, with money in as a plus and money out as a minus. Each link lights up when its number changes:
  - profit kept → Left for Maya;
  - wear → the Cart and Coffee machine blocks, and the add-back in operations;
  - the grinder → a new Grinder block, and investing;
  - loan repaid → Owes the bank, and financing;
  - paid to Maya → financing, and Left for Maya;
  - the change in cash → the Cash block.
- **Fixed figures.** Day one as above. Cost of the coffee sold 14,000, rent 8,500, marketing 1,000, wear 2,000 (1,000 each on the cart and the machine), interest 500, tax 25%.
- **The Student can change** sales, 20,000 to 60,000 in steps of 1,000 (starts at 40,000); the grinder's price, 0 to 6,000 in steps of 500 (starts at 3,000); loan repaid, 0 to 5,000 in steps of 500 (starts at 1,000); and paid to Maya, 0 to 10,000 in steps of 500 (starts at 5,000).
- **The maths.** Net income as in W3 at a 10% rate. The loan is repaid at the year's end, so interest stays 500. Cash from operations = net income + 2,000. Investing = − the grinder's price. Financing = − loan repaid − paid to Maya. Cash at the end = 2,000 + the three. At the year's end: Cart 3,000; Coffee machine 4,000; Grinder = its price; Cash = cash at the end; Owes the bank = 5,000 − loan repaid; Left for Maya = 6,000 + net income − paid to Maya. If cash at the end falls below zero, the Cash block drops below the floor, labelled "Overdrawn: the cart would have to borrow". Both sides always balance.
- **Settings the Plan uses.** The year as in the tables. For Test intuition 3, the grinder, the repayment and the payment to Maya all set to 0, which shows cash rising by 12,500; then back.

### W5 · What it cost, or what it might sell for now

- **The Student must see** the year-end balance sheet with the coffee machine recorded one of two ways: at what it cost less wear (4,000), or at an estimate of what it would sell for today. Left for Maya moves with the estimate; at cost it does not.
- **Fixed figures.** The year-end balance sheet from W4 at its starting settings.
- **The Student can change** a switch, "What it cost" or "Today's estimate" (starts at "What it cost"), and the estimate, 1,000 to 8,000 in steps of 500 (starts at 4,000).
- **The maths.** Coffee machine = 4,000 at cost, or the estimate. Left for Maya = 11,500 + (Coffee machine − 4,000).
- **Accuracy note for the Chatbot.** Under US rules a machine stays at cost; fair value applies mostly to financial investments, and IFRS lets a company revalue equipment. The machine is used only to make the idea visible. If the Student asks what gets fair value, the Chatbot says so.

### W6 · Two carts, two machines

For a wrong answer to Test intuition 1.

- **The Student must see** two carts side by side, each borrowing 5,000 for a coffee machine: one a top model, one that often breaks down. Both balance sheets record the machine at 5,000, what was paid, so both Left for Maya blocks are 6,000.
- **Fixed figures.** For both: cart 4,000, coffee machine 5,000, cash 2,000, owes the bank 5,000, Left for Maya 6,000. Under each machine, a label: "Top model" and "Breaks down often".
- **The Student can change** what a buyer would pay for each machine today, 0 to 10,000 in steps of 500. The balance sheets do not move, and a note says "Recorded at what it cost".

### W7 · Two carts, two ways of paying

For a wrong answer to Test intuition 2.

- **The Student must see** two income statements side by side for identical carts: one paid for with Maya's money only, one with a 5,000 loan. Sales, costs and operating profit are the same, 14,500; interest and net income differ.
- **Fixed figures.** The year as in W3. Cart A, no loan: interest 0, taxable income 14,500, tax 3,625, net income 10,875. Cart B: the year's figures, net income 10,500.
- **The Student can change** the loan on cart B, 0 to 10,000 in steps of 1,000, at 10%. Only the lines below operating profit move.

## Test intuitions

Each Test intuition is shown inside its Widget, with four answers. The wrong answers are common mistakes. Before a pick, the Chatbot gives hints, never the answer. After a pick, it explains using the Widget named below.

### Test intuition 1, after idea 2, in W2

Before showing it, the Chatbot sets W2's bank loan to 0.

**Maya's company borrows 5,000 from the bank and buys a coffee machine with it. What happens to what's left for Maya?**

| | Answer | The mistake | What shows why |
|---|---|---|---|
| a | It goes up by 5,000. The company has a new machine. | Owning more makes the owner richer. | W2: the Chatbot moves the loan from 0 to 5,000. Both stacks grow by 5,000; Left for Maya does not move. |
| b | It goes down by 5,000. The company owes the bank. | Any debt makes the owner poorer. | W2, the same move, with the Chatbot pointing at the machine that arrived with the debt. |
| c ✓ | It stays the same. The company owns 5,000 more and owes 5,000 more. | | W2 with the loan at 5,000. |
| d | It depends on how good the machine is. | The balance sheet shows what things are worth. | W6: two machines, the same 5,000 on both balance sheets. |

### Test intuition 2, after idea 3, in W3

**Maya's bank doubles the interest on the loan, from 500 to 1,000 a year. Nothing else changes. Which profit figures go down?**

| | Answer | The mistake | What shows why |
|---|---|---|---|
| a | All of them, from gross profit down. | Every cost lowers every profit figure. | W3: the Chatbot moves the interest rate from 10% to 20%. Gross and operating profit stay still; only the bars below interest move. |
| b ✓ | Only taxable income and net income. Operating profit stays at 14,500. | | W3 at 20%. |
| c | Operating profit and everything below it. Interest is a cost of running the cart. | Interest is a running cost. | W7: two identical carts, one with a loan, with the same operating profit. |
| d | None of them. Interest is just paying the bank back. | Interest is the same as repaying the loan. | W3 at 20%: net income falls to 10,125. Then W4, where repaying the loan sits in financing and does not touch profit. Interest is the price of borrowing; a repayment gives back the bank's own money. |

### Test intuition 3, after idea 4, in W4

**This year the cart made a profit of 10,500, yet its cash rose by only 3,500. Why?**

| | Answer | The mistake | What shows why |
|---|---|---|---|
| a | The accounts must be wrong. Profit and the rise in cash should match. | Profit is cash. | W4: the Chatbot sets the grinder, the repayment and the payment to Maya to 0. Cash rises by 12,500, more than the profit, and every step of the bridge is in view. Then it puts them back. |
| b | Tax still had to be paid out of the profit. | Profit is counted before tax. | W3, pointing at the tax of 3,500 above net income: the 10,500 is already after tax. |
| c | The 2,000 of wear on the cart and the machine was paid out in cash. | Wear is a cash payment. | W4, pointing at "wear added back, +2,000" in cash from operations: the cart and the machine were paid for on day one, and no cash left for wear this year. |
| d ✓ | Cash went on things that are not this year's costs: the new grinder, repaying part of the loan, and paying Maya. | | W4 at the year's figures. |

## What to keep

The summary the Student can save as a Note.

1. A company gets its money from owners and lenders. Lenders are promised a fixed amount and are paid first; owners get whatever is left.
2. The balance sheet shows, on one day, what a company owns and what it owes. What's left is the owners' share, equity. It is a leftover, not a pile of cash.
3. The income statement shows what the company earned over a year: sales minus costs, layer by layer. Interest comes after operating profit, because it is the cost of borrowing, not of running the business.
4. The cash flow statement shows where the cash came from and where it went: operations, investing, financing. Profit is not cash.
5. Accountants record what already happened, by rules that make companies comparable, and the three statements are linked.

## Terms the Chatbot explains the first time they appear

company · owner (shareholder) · lender · equity · debt · interest · asset · liability · fixed asset · current asset · financial asset · intangible asset · current liability · balance sheet · income statement · cash flow statement · revenue (sales) · cost of goods sold · gross profit · operating expenses · operating profit · depreciation (wear) · taxable income · net income · dividend (a payment to owners) · capital expenditure · cash flow from operations, investing and financing · GAAP · IFRS · fair value

Damodaran names these in Session 1 but they are taught later. The Chatbot gives a one-line meaning only if the Student asks: working capital (Lessons 5 and 7) · amortisation (Lesson 2) · accounts receivable and payable (Lesson 5) · pension obligations (Lesson 6) · investments in other companies and consolidation (Lessons 3 and 5) · buybacks (Lessons 5 and 7).

## Damodaran's material behind this Lesson

All of it comes from his Accounting Class (2020) except where marked. Timestamps are estimates from the automatic captions, assuming an even pace through the video; the import check confirms them ([Check the first Accounting 101 import](https://github.com/SiddharthMuramkar/valueit/issues/29)). Only a few identifying words are quoted here, because this repository is public; the passages themselves live in ValueIt's private store.

| Idea | Source | What it holds |
|---|---|---|
| 1 | Preview video, ≈0:26–1:40 | "just enough accounting"; no debits and credits; reading statements, not writing them |
| 1 | Session 1, slide 2; video ≈0:00–1:00 | the accountant's role: check, record, report; "an accountant is a historian" |
| 1 | Session 1, slide 3; video ≈1:00–1:45 | the three questions: what do you own, what do you owe, how much did you make |
| 1 | Foundations of Finance Class, Session 2; video ≈1:30 and ≈6:05–8:00 | debt and equity as the two ways to fund a business; debt as a contractual commitment; equity as a residual claim |
| 2 | Session 1, slide 4; video ≈1:45–3:10 | the three statements, and what each measures |
| 2 | Session 1, slide 5; video ≈3:14–4:48 | the balance sheet's groups; equity as a "plug" (≈4:38) |
| 3 | Session 1, slide 6; video ≈4:49–6:20 | the income statement, item by item: gross profit (≈5:07), operating profit (≈5:28), net income (≈6:00) |
| 4 | Session 1, slide 7; video ≈6:20–8:50 | the cash flow statement; "the most honest" (≈6:25); signs kept (≈8:11) |
| 4 | Session 1, slide 8; video ≈8:50–9:35 | how the three statements connect |
| 5 | Session 1, slides 9, 10 and 11; video ≈9:37–12:30 | the rules; GAAP and IFRS (≈10:20); slide 10 is a world map of where IFRS is required; "accounting sense" (≈11:39); fair value (≈12:00) |

Links: [Class page](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/webcastacctg.htm) · [Preview video](https://youtu.be/Jbp3-AU9v_g) · [Session 1 video](https://youtu.be/7rW7lpQZpqY) · [Session 1 slides](https://pages.stern.nyu.edu/~adamodar/pdfiles/Accounting101/slides/session1.pdf) · [Foundations of Finance, Session 2 video](https://youtu.be/TKoLoLVI_Js)

Session 1 has no post-class test; his tests start at Session 2. Lesson 1's after-Lesson check needs its own new questions.
