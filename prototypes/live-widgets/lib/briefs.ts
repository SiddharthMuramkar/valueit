/** Illustrative briefs for the throwaway Widget experiment, not the finished Lesson Plan. */
export const briefs = [
  {
    id: 'balance-sheet',
    shortTitle: 'Balance sheet',
    topic: 'Accounting 101',
    title: 'Where does the money come from?',
    opening: 'Maya starts a coffee cart with $1,000 of her own money. She buys a cart for $600 and keeps $400 in cash. Next, she borrows money from the bank to buy equipment. What changes on both sides of her balance sheet?',
    challenge: 'Try increasing the bank loan. Does Maya’s own share of the business change, or do both sides of the balance sheet grow together?',
    inputLabel: 'Bank loan',
    inputKey: 'loan',
    expected: 'At a $400 loan, assets = $400 cash + $600 cart + $400 equipment = $1,400. Liabilities + equity = $400 loan + $1,000 equity = $1,400. At $600, each total is $1,600.',
    ask: 'What is the bank loan set to right now? Tell me that value, then set the bank loan to $800 and explain why both sides still balance.',
    brief: `Build a Widget for the Student to understand why a business's balance sheet balances when it borrows to buy an asset. The example is Maya's coffee cart. Fixed figures: owner's equity is $1,000; cart purchased outright cost $600; cash remaining is $400. Adjustable bank loan initially $400, min 0, max 800, step 100, dollars; bind the NumberInput to /loan. The entire loan is used immediately to buy equipment, so equipment value equals current loan; cash, cart and owner's equity remain unchanged. Total assets equals cash + cart + loan-funded equipment. Total liabilities plus equity equals bank loan + owner's equity. When loan is $400, both totals must be $1,400. Use Royal blocks Building blocks to contrast the two stacks on the same scale (assets: cash, cart, equipment; liabilities and equity: bank loan, owner's equity). Label amounts clearly and make totals reactive with the supplied sum function, not hard-coded calculated results. Add a concise formula view or ledger as appropriate and one directly bound adjustable control. Make the visual pattern that both sides grow together, not merely the formula, the main idea. Every affected value must update locally when /loan changes. No extra assumptions; the user must see exact fixed figures and the adjustable quantity.`
  },
  {
    id: 'profit',
    shortTitle: 'Profit',
    topic: 'Accounting 101',
    title: 'Sales are not the same as profit.',
    opening: 'The coffee cart made $1,200 in sales today. But keeping a business running costs money. After $800 in expenses, Maya has $400 left as profit.',
    challenge: 'Increase the expenses until the cart loses money. Where is the point at which the business breaks even?',
    inputLabel: 'Expenses',
    inputKey: 'expenses',
    expected: 'Sales $1,200 − expenses $800 = $400 profit. At $1,200 in expenses, profit is $0; at $1,400, loss is $200.',
    ask: 'What amount are expenses set to right now? Tell me, then set expenses to $1,400 and explain what that means for profit.',
    brief: `Build a Widget teaching the difference between sales and profit for Maya's coffee cart. Sales/revenue is fixed at $1,200. Expenses are the only adjustable amount, initially $800, min 0, max 1600, step 100, dollars; bind NumberInput to /expenses. Profit = revenue - expenses using the supplied subtract function. Initial profit must be $400; as expenses reach $1,200 it is $0, and at $1,400 it is -$200 (a loss). Use a compact chart and/or a ledger to compare the three values, with a formula view showing the live result and the one adjustable control. If using a profit bar, make its negative values legible. Teach the intuition that more sales do not necessarily imply profit, and that costs exceeding sales mean a loss. Never change sales, never clamp negative results to zero, and never hard-code computed profit. Every derived value must update locally with /expenses. Keep the explanation short and clear.`
  },
  {
    id: 'present-value',
    shortTitle: 'Present value',
    topic: 'Fundamentals of Finance',
    title: 'What is money in the future worth today?',
    opening: 'Suppose Maya could receive $1,210 in two years. The amount is fixed, but what it is worth to her today depends on the rate at which money can grow.',
    challenge: 'Raise the discount rate. Does the future amount change? What happens to its value today?',
    inputLabel: 'Annual discount rate',
    inputKey: 'rate',
    expected: 'At 10%, $1,210 ÷ (1 + 0.10)² = $1,000. At 0%, the present value is $1,210; at 20%, it is $840.28 (rounded).',
    ask: 'Tell me the discount rate I currently set, then set it to 20% and explain what happened to the value today.',
    brief: `Build a Widget teaching present value: how much a fixed future cash amount is worth today. Fixed future cash amount is $1,210, payable exactly two years from now. Adjustable annual discount rate is 10 percent initially, min 0, max 20, step 1, in percentage points (10 means 10%, not 0.10); bind NumberInput to /rate. Calculate present value using the supplied presentValue function: futureValue = 1210, ratePercent = /rate, years = 2. Initial answer must be $1,000 and 20% gives about $840.28. At 0% equals future amount. Use a clear chart or adjacent totals contrasting money today with the fixed future amount, and a formula view exposing the math and reactive result. Student must see a genuinely adjustable rate and notice future cash stays exactly $1,210 while present value decreases with the rate. Use at most two decimal places for money. No fixed value for the computed answer, no other financial assumptions. Compose a minimal, excellent teaching Widget with the supplied Building blocks.`
  },
] as const;

export type BriefId = typeof briefs[number]['id'];
export type Brief = typeof briefs[number];
