# How Damodaran's Cost of Capital spreadsheets work

Research for ticket #7. Facts checked on 2026-11-27. He revises these files, most of them every January, so every number below is tied to a dated file version (section 1). His next full update is due in January 2027.

## The answer

### How the sheets work out cost of capital

Cost of capital is the yearly return a company has to earn to satisfy everyone who funds it. His sheets build it from three prices and a set of weights.

1. **What shareholders want (cost of equity).** Start with the risk-free rate. Add a reward for risk: the equity risk premium, scaled by the company's beta. The premium depends on which countries the company sells in. The beta comes from the industry the company is in, then is adjusted upward for the company's own debt.
2. **What lenders want (cost of debt).** Start with the same risk-free rate. Add a default spread that depends on the company's credit rating. If the company has no rating, the sheet invents one from a single ratio (operating income divided by interest expense). Interest is tax-deductible, so the cost is reduced by the tax rate.
3. **The weights.** How much of the company is funded by each, measured at market value, not at the value in the accounts. Equity is shares times price. Debt is the accounting debt re-priced as if it were one bond.
4. **The answer.** Each cost times its weight, added up.

On the main path, every number that is not typed in comes from one of three tables he publishes each January: risk premiums by country, betas by industry, and default spreads by rating. A fourth table, tax rates by country, is there for the user to read the tax rate from.

### Which sheet to rebuild

Twelve of his files work out cost of capital or a piece of it (section 2). Only four were changed in 2026: the simple valuation model `fcffsimpleginzu.xlsx` (file dated 12 April 2026), the full model `fcffginzu.xlsx`, the capital structure model `capstru.xlsx`, and the small rating sheet `ratings.xls`. The first three carry his 1 January 2026 tables inside them.

The file offered on his page as the cost of capital calculator, `wacccalc.xls`, was last changed in January 2015. Its tables are eleven years old and two of its cells are broken. **The live version of that calculator is the sheet named `Cost of capital worksheet` inside `fcffsimpleginzu.xlsx`.** It is the same layout, grown and kept up to date. That worksheet, with the two small sheets it leans on (`Synthetic rating` and `Operating lease converter`), is the thing to rebuild.

### What a rebuild takes

- **It is small.** About 30 distinct formulas, five lookup tables, and five choices the user makes from menus. The worksheet has 217 formula cells, but most are the same three formulas repeated down table rows.
- **It is ordinary arithmetic.** No macros anywhere in the four current files. No spreadsheet engine is needed. For this research the worksheet was re-written from its formulas as about 150 lines of plain code, and that code matched the original on its default inputs to all 16 digits (section 6).
- **One loop.** If the user turns on operating leases and asks for an invented rating, the answer feeds back into itself: the rating sets the interest rate, the interest rate sets the lease debt, the lease debt changes the ratio that sets the rating. Excel handles this by repeating the calculation. A rebuild repeats until the rating stops changing, which took two passes in the test case.
- **The tables are the real dependency.** 192 countries, 94 industries, 15 rating bands. They are small enough to ship as plain data files, but they go stale: the industry and rating tables every January, the country premiums three times in 2026 (January, April, July), and the base risk premium every month.
- **The original has loose ends.** Eight places where a note on the sheet and the formula beside it disagree, or where a constant was left over from last year (section 8). A rebuild has to choose, case by case, between matching his file exactly and doing what his teaching says.

### What it means for ValueIt

- The calculator can be built as normal code and tested number for number. Section 6 gives the test cases. This part of the plan carries no technical risk.
- The check numbers only hold for the file version named here. His site appears to serve only the latest version of each spreadsheet (open question 6), so ValueIt needs its own private copy of the 12 April 2026 file if it wants to re-run these checks later.
- "Where the numbers come from" (ticket #16) is the larger question. The worksheet expects a person to bring about a dozen facts from a company's annual report and a share price, and to take everything else from his tables. Section 3 lists exactly which is which.
- The sample company in his file is not usable as a Lesson example. Its figures are leftovers from more than one company (section 8). The Lesson needs its own worked company.
- The steps a beginner finds hardest are known and are few (section 9): the risk-free rate, where a company's risk really comes from, why beta is taken from the industry, inventing a rating, and why market values are used. These are the natural places for a Student to get stuck, so they are where a Widget or the Chatbot earns its place.
- A sensible first version is narrower than the worksheet. The worksheet offers four ways to get a cost of capital, five ways to get a beta, four ways to get a risk premium and three ways to get a cost of debt. One path through it (industry beta, one country, rating given or invented) covers the teaching. Leases, convertible debt, preferred stock, many businesses and many regions are extras that can come later. This is a suggestion for the Lesson ticket (#18), not a decision.

## Evidence

"Cached" below means the value stored in his file by the Excel that last saved it. "Recalculated" means the value produced after changing inputs, by the method described in section 6.

### 1. Files read, and how

All downloaded on 2026-11-27 from the links on his [spreadsheet page](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/spreadsh.htm) and [data page](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datacurrent.html). "Last changed" is the date the web server reports for the file. The checksum identifies the exact version.

| File | Last changed | SHA-256 (first 12) | Note |
| --- | --- | --- | --- |
| [fcffsimpleginzu.xlsx](https://pages.stern.nyu.edu/~adamodar/pc/fcffsimpleginzu.xlsx) | 12 Apr 2026 | `d6ffb67d965d` | Tables marked "Updated January 1, 2026". Full checksum: `d6ffb67d965dc22463e4d013636befab3da431e7fc608936a82612fa73198e72` |
| [fcffginzu.xlsx](https://pages.stern.nyu.edu/~adamodar/pc/fcffginzu.xlsx) | 16 Feb 2026 | `df8f9e91cc53` | Same January 2026 tables |
| [capstru.xlsx](https://pages.stern.nyu.edu/~adamodar/pc/capstru.xlsx) | 26 Jan 2026 | `32ccdad0e50d` | Same January 2026 tables |
| [ratings.xls](https://pages.stern.nyu.edu/~adamodar/pc/ratings.xls) | 26 Jan 2026 | `45d1f61c67f0` | Also the download behind the data page's ratings table |
| [pvtdiscrate.xls](https://pages.stern.nyu.edu/~adamodar/pc/pvtdiscrate.xls) | 22 Jan 2025 | `0c2690b1bbb8` | |
| [levbeta.xls](https://pages.stern.nyu.edu/~adamodar/pc/levbeta.xls) | 7 Mar 2018 | `cd77662a6642` | |
| [wacccalc.xls](https://pages.stern.nyu.edu/~adamodar/pc/wacccalc.xls) | 18 Jan 2015 | `03ee0cb2fbc9` | Stale |
| [oplease.xls](https://pages.stern.nyu.edu/~adamodar/pc/oplease.xls) | 13 Feb 2015 | `4097d74cea26` | |
| [riskchecker.xls](https://pages.stern.nyu.edu/~adamodar/pc/riskchecker.xls) | 28 Feb 2013 | `fea7463edc8c` | |
| [fcffginzulambda.xls](https://pages.stern.nyu.edu/~adamodar/pc/fcffginzulambda.xls) | 2 Jan 2013 | `ab649be22d54` | |
| [implprem.xls](https://pages.stern.nyu.edu/~adamodar/pc/implprem.xls) | 24 Apr 2007 | `7039d23862cd` | Contains a macro project. Not opened in any spreadsheet program; stored values read only |
| [risk.xls](https://pages.stern.nyu.edu/~adamodar/pc/risk.xls) | 17 Jan 2002 | `f596e6f17dd2` | |

Data tables read: `ctryprem.xlsx` (16 Feb 2026, `b5200e8abcb0`), `ctrypremJuly26.xlsx` (10 Jul 2026, `8d7237c432bc`), `betas.xls` (12 Apr 2026, `fa5d91af5804`), `betaGlobal.xls` (8 Jan 2026), `wacc.xls` (12 Jan 2026, `d38b149c731b`), `countrytaxrates.xls` (8 Jan 2026), `histimpl.xls` (8 Jan 2026), `taxrate.xls` (8 Jan 2026), `totalbeta.xls` (8 Jan 2026), and last year's archived `wacc24.xls`. All under `https://pages.stern.nyu.edu/~adamodar/pc/datasets/` except the archive, which is under `pc/archives/`.

How they were read:

- Formulas and cached values of `.xlsx` files with openpyxl 3.1.5. Cached values of `.xls` files with xlrd 2.0.2.
- xlrd cannot show formulas, so each `.xls` (except `implprem.xls`) was converted to `.xlsx` with LibreOffice 26.8 running without a screen and with macros switched off, and the formulas were read from the copy. The values in every converted copy matched the original cached values (0 differences across 1,402 formula cells).
- Drop-down lists were read from the raw file, because openpyxl drops the kind this file uses.
- Nothing was opened in Excel. No macro was run.

The slide guide linked next to `fcffsimpleginzu.xlsx` on his page (`fcffsimpleginzuguide.pptx`) returns "404 Not Found". The file itself points to a [video guide](https://youtu.be/kyKfJ_7-mdg) instead, which was not watched.

### 2. The sheets that work out cost of capital

| File | What it works out | Kept current? |
| --- | --- | --- |
| `fcffsimpleginzu.xlsx`, sheets `Cost of capital worksheet`, `Synthetic rating`, `Operating lease converter`, `Country equity risk premiums`, `Industry Averages(US)`, `Industry Averages (Global)` | The whole thing: beta, risk premium, rating, cost of debt, weights, cost of capital. Feeds the valuation | Yes, 2026 |
| `fcffginzu.xlsx`, sheets `Cost of capital worksheet`, `Ratings estimator` | A shorter version of the same worksheet (no menus for approach), plus a rating estimator | Yes, 2026 |
| `capstru.xlsx` | Cost of capital at every debt level from 0% to 90%, to find the cheapest mix. Circular by design | Yes, 2026 |
| `ratings.xls` | Invented ("synthetic") rating and cost of debt from interest coverage | Yes, 2026 |
| `wacccalc.xls` | The standalone cost of capital calculator | No, 2015 |
| `levbeta.xls` | Strip debt out of a beta and put a different amount back | No, 2018, but the formula has not changed |
| `risk.xls`, `riskchecker.xls` | Beta from a regression of past share prices | No, 2002 and 2013 |
| `implprem.xls` | The equity risk premium implied by today's share prices | No, 2007. Superseded by a monthly file, section 5 |
| `pvtdiscrate.xls` | Cost of equity for a private business whose owner is not diversified ("total beta") | 2025 |
| `fcffginzulambda.xls` | A variant where country risk gets its own multiplier ("lambda") | No, 2013 |
| `oplease.xls` | Turns lease commitments into debt, which changes the debt weight | No, 2015. Same logic lives inside the Ginzu files |

His own index of the topic, [Cost of Capital Central](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/wacccentral.html), lists the same standalone files against eight teaching sessions: `risk.xls`, `riskchecker.xls` and `levbeta.xls` under beta, `ratings.xls` under cost of debt, and `wacccalc.xls`, `oplease.xls` and the capital structure model under "Weighting and Summing up".

### 3. The cost of capital worksheet in `fcffsimpleginzu.xlsx`

Cell addresses are given so a rebuild can be checked against the file. `Input!` means the sheet `Input sheet`. A bare address means `Cost of capital worksheet`.

#### 3.1 What a person types

From the company's accounts and the market, typed on the `Input sheet` and shared with the rest of the valuation:

| Cell | Input | His note on it |
| --- | --- | --- |
| `Input!B7` | Country of incorporation (menu of 192) | |
| `Input!B8`, `B9` | Industry, US list and Global list (menus of 94, same names) | "If you are in multiple businesses, make your judgment on the one industry group that it most falls into" |
| `Input!B12` | Operating income (EBIT), last 12 months | |
| `Input!B13` | Interest expense | |
| `Input!B15` | Book value of debt | Interest-bearing debt only. "Do not include accounts payable, supplier credit" |
| `Input!B17` | Operating leases to convert? Yes/No | Warns against double counting if the accounts already treat leases as debt |
| `Input!B21`, `B22` | Shares outstanding, share price | Same units as everything else |
| `Input!B24` | Marginal tax rate | "This is a statutory tax rate. I use the tax rate of the country the company is domiciled in" |
| `Input!B34` | Risk-free rate | "today's long term riskfree rate". For a currency whose government can default, subtract the government's default spread |

Typed on the worksheet itself:

| Cell | Input |
| --- | --- |
| `B11` | Which approach: `I will input`, `Detailed`, `Industry Average`, `Distribution` |
| `B12` | Cost of capital, if typing it directly |
| `B21` | Beta approach: `Direct input`, `Single Business(US)`, `Single Business(Global)`, `Multibusiness(US)`, `Multibusiness(Global)` |
| `B22` | Beta, if typing it directly |
| `B25` | Risk premium approach: `Will input`, `Country of incorporation`, `Operating countries`, `Operating regions` |
| `B26` | Risk premium, if typing it directly |
| `G5:H15`, `G16:I17` | Revenue by country (11 rows from the menu, 2 free rows where the premium is typed too) |
| `H21:H29`, `G30:I31` | Revenue by region (9 fixed regions, 2 free rows) |
| `B32` | Average maturity of debt, in years. "If you cannot find it, enter zero" |
| `B33` | Cost of debt approach: `Direct input`, `Synthetic rating`, `Actual rating` |
| `B34` | Pre-tax cost of debt, if typing it directly |
| `B35` | Actual rating (menu of 15) |
| `B36` | Type of company for an invented rating: 1 large and safe, 2 small or risky |
| `B40:B43` | Convertible debt: book value, interest, maturity, market value |
| `B48:B50` | Preferred stock: number of shares, price, yearly dividend |
| `G36:H47`, `G52:H63` | Revenue by business, against the US or the Global industry list (12 rows each) |
| `B66` | Industry choice for the industry-average approach |
| `B70`, `B71` | Region and risk group for the distribution approach |

#### 3.2 What it looks up

| Lookup | Table | Returns |
| --- | --- | --- |
| Industry name | `Industry Averages(US)` or `(Global)`, rows 2 to 95 | Unlevered beta (column G), cost of capital (M), EV/Sales (O) |
| Country name | `Country equity risk premiums`, rows 5 to 196 | Default spread (C), equity risk premium (D), tax rate (F) |
| Region name | Same sheet, rows 201 to 209 | Regional equity risk premium (B) |
| Actual rating | `Synthetic rating!G42:H56` | Default spread |
| Interest coverage ratio | `Synthetic rating!A22:D36` (type 1) or `A41:D55` (type 2) | Rating and default spread |
| Region and risk group | `A75:F79` on the worksheet | Cost of capital at the 10th, 25th, 50th, 75th or 90th percentile |

Every one of these lookups uses Excel's "nearest match below" mode, which only works on a sorted list. The four long name lists in this file are sorted, and for every name in them the nearest match and the exact match land on the same row (checked for all 94 + 94 + 192 + 15 names). The five-row region list for the distribution approach is sorted too. A rebuild should use exact matching for names and "largest lower bound not above the ratio" for the coverage bands.

#### 3.3 The calculations, in order

```
1. Unlevered beta (B23)
   Single business:  the industry's unlevered beta from the US or Global table
   Many businesses:  for each business,  value = revenue × industry EV/Sales
                     unlevered beta = sum of (value / total value) × industry unlevered beta

2. Equity risk premium (B27)
   Will input:                the typed number
   Country of incorporation:  that country's premium from the table
   Operating countries:       sum of (revenue / total revenue) × country premium     (K18)
   Operating regions:         sum of (revenue / total revenue) × regional premium    (K32)
   Every country premium in the table = mature market premium (4.23%) + that country's risk premium

3. Pre-tax cost of debt (B37)
   Direct input:      the typed number
   Actual rating:     risk-free rate + spread for that rating
   Synthetic rating:  EBIT*     = EBIT + lease adjustment (if leases are on)
                      interest* = interest expense + lease debt × pre-tax cost of debt (if leases are on)
                      coverage  = 1,000,000 if interest* is zero
                                  −100,000 if EBIT* is negative
                                  otherwise EBIT* / interest*
                      rating and spread = the band whose lower bound is the largest one not above coverage
                      cost of debt = risk-free rate + company spread + default spread of the country of incorporation

4. Market value of debt (C53)
   interest × (1 − (1 + cost of debt)^−maturity) / cost of debt  +  book debt / (1 + cost of debt)^maturity
   The same formula, with the convertible's own numbers, gives the debt part of a convertible (C54).
   Total debt (C60) = straight debt + debt part of convertible + lease debt

5. Market values (row 60)
   Equity = shares × price        Preferred = preferred shares × preferred price
   Capital = equity + total debt + preferred

6. Levered beta (C57)
   Direct input:  the typed beta
   Otherwise:     unlevered beta × (1 + (1 − marginal tax rate) × total debt / equity)

7. Costs (row 62)
   Cost of equity          = risk-free rate + levered beta × equity risk premium
   After-tax cost of debt  = pre-tax cost of debt × (1 − marginal tax rate)
   Cost of preferred       = preferred dividend / preferred price

8. Cost of capital (E62)
   (equity / capital) × cost of equity + (debt / capital) × after-tax cost of debt + (preferred / capital) × cost of preferred
```

The lease converter (used only when `Input!B17` is Yes), with commitments for years 1 to 5 and one lump for "year 6 and beyond":

```
years in lump    = lump / average of the five yearly commitments, rounded to a whole number (0 if no lump)
lease debt       = each yearly commitment discounted at the pre-tax cost of debt
                   + the lump spread evenly over those years, as an annuity, discounted back five more years
                     (if the rounding gives zero years, the lump is one payment in year 6)
depreciation     = lease debt / (5 + years in lump)
lease adjustment = this year's lease expense − depreciation      (added to EBIT)
```

The other three approaches:

```
I will input:      B13 = the typed number
Industry Average:  B13 = industry cost of capital from the table (or the business-weighted one)
                         + (risk-free rate typed on the Input sheet − 4.58%)
Distribution:      B13 = the chosen percentile for the chosen region
```

#### 3.4 What comes out, and where it goes

`B13` is the cost of capital. `Input!B35` copies it, with the note "Do not input. Go to cost of capital sheet." The valuation then uses it for years 1 to 5 and moves it in five equal steps to a different number for year 10 onward: the risk-free rate plus the mature market premium (`Valuation output!M12`), unless the user overrides that. So the cost of capital a Student computes is only the starting rate in his valuation.

### 4. The standalone sheets

Each is one idea from section 3 on its own.

**`ratings.xls` (2026).** Types: firm type (1 large non-financial, 2 smaller or riskier, 3 financial service), leases yes/no, EBIT, interest expense, long-term government bond rate. Works out: coverage = EBIT / interest (100,000 if no interest); looks up rating and spread in the table for that firm type; cost of debt = bond rate + spread. With leases on, coverage uses lease-adjusted EBIT over interest plus lease debt times the cost of debt, which is circular. Unlike the Ginzu version it adds no country spread and has a third table for financial firms.

**`wacccalc.xls` (2015).** Same inputs, lookups and order as section 3, without the industry-average and distribution approaches. Do not use it as the reference: its tables are from January 2015; the tax rate the formulas use is a plain 40% sitting in the cell, while the tax-choice cells beside it say "Will input" and 35% and are connected to nothing; and the cell meant to weight betas across global businesses instead looks up the word "Company" in the industry list.

**`levbeta.xls` (2018).** Types: current beta, marginal tax rate, average debt/equity over the regression period, and optionally the numbers to price debt. Works out:

```
unlevered beta = beta / (1 + (1 − tax) × average D/E)
levered beta   = unlevered beta × (1 + (1 − tax) × D/E)       for the current D/E and for 0% to 90% debt
```

**`risk.xls` (2002) and `riskchecker.xls` (2013).** Regression beta from a column of share prices and index levels: beta = covariance of the two return series / variance of the index returns. Then expected return = risk-free rate + beta × premium, and a range of beta plus or minus one and two standard errors. He teaches this as the method to avoid (section 9).

**`pvtdiscrate.xls` (2025).** For a private firm: total beta = (unlevered beta / correlation with the market) × (1 + (1 − tax) × D/E); cost of equity = risk-free rate + premium × total beta; then the usual weighting with a debt ratio borrowed from the industry.

**`fcffginzulambda.xls` (2013).** Cost of equity = risk-free rate + beta × mature market premium + lambda × country risk premium.

**`capstru.xlsx` (2026).** Runs a version of steps 3 to 8 of section 3 ten times, once for each debt level from 0% to 90% in steps of 10. At each level the debt sets the interest, the interest sets the coverage, the coverage sets the rating and the rating sets the interest rate. His note: "This spreadsheet includes circular references, by design."

**`implprem.xls` (2007).** Finds the return that makes the present value of expected market cash flows equal today's index level, and subtracts the bond rate. It tells the user to "Go under Tools and choose Solver": this is a search for a number, not a formula. A rebuild would need a root-finder. The cost of capital worksheet does not do this; it takes the result as a number from a table.

**`fcffginzu.xlsx` (2026).** Its `Cost of capital worksheet` is steps 1 to 8 with no approach menus: beta is always the business-weighted US figure and the premium always the regional one. The cost of debt is typed.

### 5. The lookup tables

His data page states: "Data of last full update: January 9, 2026; Country risk premiums last updates: January 5, 2026", and "The data, with a couple of exceptions, gets updated once a year, at the start of the year". His [home page](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/home.htm) adds: "my next one update will be on January 2027".

| What | Source file | How often | Size and shape |
| --- | --- | --- | --- |
| Equity and country risk premiums | [ctryprem.xlsx](https://pages.stern.nyu.edu/~adamodar/pc/datasets/ctryprem.xlsx), sheet `ERPs by country`. [Web version](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/ctryprem.html) | January and July by his own description. In 2026 also April: the data page lists 1 Jan, 1 Apr and 1 Jul 2026 files | 157 rated countries, plus unrated ones scored another way. Columns: country, region, Moody's rating, default spread, total premium, country premium, and the same from credit-default-swap prices. The copy inside the Ginzu is 192 rows by 6 columns, then 10 regions and 11 other groupings |
| The base ("mature market") premium | One number. In the Ginzu it is cell `B1` of the country sheet: 4.23%, "Updated January 1, 2026". Yearly history in [histimpl.xls](https://pages.stern.nyu.edu/~adamodar/pc/datasets/histimpl.xls); monthly in [ERPbymonth.xlsx](https://pages.stern.nyu.edu/~adamodar/pc/implprem/ERPbymonth.xlsx) | Monthly. The Ginzu's note: "I update the ERP for the S&P 500 at the start of every month on my website ... you can change this number to the most recent update" | `histimpl.xls`: 66 years (1960 to 2025) by 19 columns. Monthly workbook for the current month: `ERPNov26.xlsx`, last changed 2 Nov 2026 |
| Industry betas | [betas.xls](https://pages.stern.nyu.edu/~adamodar/pc/datasets/betas.xls) (US) and [betaGlobal.xls](https://pages.stern.nyu.edu/~adamodar/pc/datasets/betaGlobal.xls), plus Europe, Japan, emerging markets, China, India | Yearly, January. Internal date 5 Jan 2026 | 94 industries plus two totals, 16 columns. The Ginzu uses the column "Unlevered beta corrected for cash" |
| Industry cost of capital | [wacc.xls](https://pages.stern.nyu.edu/~adamodar/pc/datasets/wacc.xls) and regional versions | Yearly, January | 96 rows by 12 columns. Built on a 3.95% risk-free rate and a 4.46% premium for the US |
| Industry table inside the Ginzu | Sheets `Industry Averages(US)` and `(Global)`; a merge of the files above with margins and multiples | Whenever he reissues the Ginzu | 96 rows by 27 columns each |
| Coverage to rating to spread | [ratings.xls](https://pages.stern.nyu.edu/~adamodar/pc/ratings.xls). [Web version](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/ratings.html): "Data used is as of January 2026" | Yearly, January | 15 bands by 4 columns, three times over (large firms, smaller or riskier firms, financial firms). The Ginzu carries the first two, plus a 15-row list for actual ratings |
| Tax rate by country | [countrytaxrates.xls](https://pages.stern.nyu.edu/~adamodar/pc/datasets/countrytaxrates.xls); also column F of the Ginzu's country sheet | Yearly, January | 251 countries by 3 columns. The file names the Tax Foundation as its source |
| Distribution of cost of capital | Typed into the worksheet (`A75:F79`) | When he reissues the Ginzu | 5 regions by 5 percentiles |

Three facts about the 2026 tables that a rebuild and a Lesson both need:

- **The United States is no longer treated as risk-free.** Moody's cut its US rating to Aa1 on 16 May 2025. Since then he subtracts a US default spread of 0.23% from the Treasury bond rate to get a dollar risk-free rate. For 1 January 2026: Treasury bond 4.18%, risk-free rate 3.95%. Source: `ctryprem.xlsx` notes; his post of 23 January 2026, [Data Update 2 for 2026](https://aswathdamodaran.blogspot.com/2026/01/data-update-2-for-2026-equities-get.html).
- **The base premium and the US premium are now two different numbers.** Base (mature market) 4.23%; United States 4.46%. Up to his January 2025 update they were the same number. In the Ginzu's table the US row reads Aa1, spread 0.23%, premium 4.46%.
- **A country's premium = 4.23% + its default spread × 1.52.** The 1.52 is how much more share prices move than government bond prices in emerging markets. The United States is the one exception: its 0.23% is added without the multiplier. The multiplier was 1.5234 in January and 1.5545 in the July 2026 file, where the base premium is 4.20% and the US premium 4.42%.

The numbers behind the tables come from commercial data services. His [data page notes](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datahistory.html): "I am dependent upon my data sources for my data, and I draw on many: Bloomberg, Morningstar, Capital IQ and Compustat."

### 6. Check numbers

How the outputs were obtained:

- **Case A** is the file's own default inputs. Outputs are cached values, as stored by his Excel.
- **Case B** changes inputs. Outputs were recalculated two ways that agree: LibreOffice 26.8 recalculating a copy of the workbook, and an independent re-write of the formulas in plain code. Before trusting LibreOffice, an unchanged copy was recalculated in it: all 217 formula cells of the worksheet, and 1,227 of the workbook's 1,231, matched the Excel cached values. The four that differed are in the circular employee-options sheet.
- **Cases D1 and D2** change one menu. Outputs were recalculated in LibreOffice. Their cost of capital equals two values that are also cached in the original file (cells `B67` and `B72`).
- **Case C** is the circular case. Its outputs are from the independent code only. See the warning under the case.
- The independent code matched Case A to a relative difference of 7 × 10⁻¹⁸ and Case B to 3 × 10⁻¹⁵.

A rebuild should match A, B, D1 and D2 to at least 12 significant digits.

#### Case A: the file's defaults (cached)

Inputs: country Saudi Arabia; industry Food Processing (US and Global); EBIT 3060.9; interest expense 493.4; book debt 45063; leases No; shares 4315; price 72.28; marginal tax rate 0.25; risk-free rate 0.0458. On the worksheet: approach `Detailed`; beta `Single Business(US)`; premium `Operating regions`; maturity 3; cost of debt `Actual rating`, rating `A1/A+`; company type 2 (unused on this path); no convertible; preferred shares 0 (price 70, dividend 5).

Regional revenue: Asia 5455; Central and South America 5830; North America 16774; free row "EMEA" 8078 with premium 0.0587 typed; free row "Rest of the World" 10924 with premium 0.055 typed. Total 47061.

| Output | Cell | Value |
| --- | --- | --- |
| Unlevered beta | `B23` | 0.46942377677075875 |
| Regional premiums looked up | `I22`, `I25`, `I28` | 0.057223235648452254, 0.08462849620618983, 0.04446474878479404 |
| Equity risk premium | `B27` | 0.05580814643676354 |
| Spread for A1/A+ | `Synthetic rating!H42` | 0.007003 |
| Pre-tax cost of debt | `B37` | 0.052803 |
| Market value of debt | `C53` | 39953.64461186393 |
| Market value of equity | `B60` | 311888.2 |
| Capital | `E60` | 351841.84461186395 |
| Weight of equity, of debt | `B61`, `C61` | 0.8864443066573306, 0.11355569334266931 |
| Levered beta | `C57` | 0.5145245310221007 |
| Cost of equity | `B62` | 0.07451466037258848 |
| After-tax cost of debt | `C62` | 0.039602250000000006 |
| **Cost of capital** | `E62`, `B13` | **0.0705501574064654** |

Also cached on the same defaults, though not on the chosen path: invented rating with coverage 6.203688690717471 gives `A2/A`, spread 0.007751, country spread 0.0051, cost of debt 0.058651. Business-weighted beta (Computers/Peripherals 195010, Electronics (General) 43000, Entertainment 15000) 1.2644905962260036 and cost of capital 0.0942423938135254. Country-weighted premium (United States 193636, China 500, free row at 0.0641 with 31335) 0.04732510655472323. Downstream: year-10 cost of capital 0.0881; value per share 7.187840270062114.

#### Case B: one country, global industry, invented rating (recalculated)

Made-up inputs, not a real company. Changes from Case A: country India; industry Healthcare Products (both lists); EBIT 1500; interest expense 250; book debt 4000; shares 500; price 40; marginal tax rate 0.30; risk-free rate 0.042; beta `Single Business(Global)`; premium `Country of incorporation`; maturity 5; cost of debt `Synthetic rating`; company type 1.

| Output | Value |
| --- | --- |
| Unlevered beta | 1.1165102988785227 |
| Equity risk premium (India) | 0.0708 |
| Interest coverage | 6.0 |
| Rating, company spread | `A1/A+`, 0.007003 |
| Country default spread (India) | 0.0187 |
| Pre-tax cost of debt | 0.067703 |
| Market value of debt | 3914.1392888333135 |
| Market value of equity, capital | 20000, 23914.139288833314 |
| Weight of equity, of debt | 0.8363253119186682, 0.16367468808133176 |
| Levered beta | 1.2694664878314836 |
| Cost of equity | 0.13187822733846905 |
| After-tax cost of debt | 0.0473921 |
| **Cost of capital** | **0.11804998679914544** |

#### Cases D1 and D2: the other approaches (recalculated)

Case A with only `B11` changed.

| Case | `B11` | Cost of capital `B13` | Value per share that follows |
| --- | --- | --- | --- |
| D1 | `Industry Average` (with `B66` left at `Multibusiness(US)`) | 0.0942423938135254 | 6.13210051767413 |
| D2 | `Distribution` (US, Median) | 0.077903913191275 | 6.84163692140151 |

In Case B the industry-average figure, had it been chosen, is 0.0904423938135254: the same 0.0942423938135254 plus (0.042 − 0.0458).

#### Case C: leases on, invented rating, the loop (independent code only)

Case A with these changes: leases Yes (the lease sheet's own numbers: this year's expense 295; commitments 287, 235, 194, 151, 98; beyond year five 605); beta `Multibusiness(US)`; premium `Operating countries`; cost of debt `Synthetic rating`, type 2; convertible debt book 1000, interest 20, maturity 5, market value 1200; preferred 10 shares at 70 paying 5.

| Output | Value |
| --- | --- |
| Unlevered beta | 1.2644905962260036 |
| Equity risk premium | 0.047325106554723224 |
| Years in the lease lump | 3 |
| Lease debt | 1239.481358977298 |
| Lease adjustment to EBIT | 140.06483012783775 |
| Interest coverage | 5.640603031529121 |
| Rating, company spread, country spread | `A3/A-`, 0.008872, 0.0051 |
| Pre-tax cost of debt | 0.059772 |
| Market value of straight debt | 39179.609674087056 |
| Debt part of convertible | 832.3619027980525 |
| Equity part of convertible (computed, not used) | 367.6380972019475 |
| Total debt, preferred, capital | 41251.452935862406, 700, 353839.6529358624 |
| Weights: equity, debt, preferred | 0.8814393678385543, 0.11658233494633151, 0.0019782972151142233 |
| Levered beta | 1.3899251453322 |
| Cost of equity | 0.11157835560593551 |
| After-tax cost of debt, cost of preferred | 0.044829, 0.07142857142857142 |
| **Cost of capital** | **0.10371713166700702** |

Warning. These are the numbers at which the loop is consistent with itself. Starting the loop from each of the 15 ratings in turn always ends here, so there is only one such answer. The lease arithmetic was checked against cached Excel values in two files (lease debt 1271.9380360057448 at a 5.2803% rate in the Ginzu; 1127.920536988687 at 3.5% in `wacccalc.xls`). But Excel itself was not run on this case. LibreOffice was, and it stopped early: it reported the right rating but a lease debt of 1244.32 and a cost of capital of 0.103716940011646, which do not agree with each other. It made the same kind of error on the workbook's other loop, employee options. There Excel's answer is known, because it is cached in the file, and it equals the self-consistent answer to all 16 digits, while LibreOffice's is off in the fourth digit. So Excel very probably gives the numbers above for Case C too. Treat a match to 6 significant digits as a pass until someone confirms it in Excel, and do not use LibreOffice to produce check numbers for any circular case.

#### Standalone sheets, their own defaults (cached)

| File | Inputs | Outputs |
| --- | --- | --- |
| `ratings.xls` | Type 2; no leases; EBIT 50; interest 8; bond rate 0.03 | Coverage 6.25; `A2/A`; spread 0.0078; cost of debt 0.0378 |
| `ratings.xls`, recalculated | Type 1; EBIT 300; interest 100; bond rate 0.042 | Coverage 3; `A3/A-`; spread 0.0089; cost of debt 0.0509 |
| `ratings.xls`, recalculated | Type 2; EBIT −10; interest 8; bond rate 0.03 | Coverage −1.25; `D2/D`; spread 0.19; cost of debt 0.22 |
| `levbeta.xls` | Beta 1.4; tax 0.36; average D/E 0.14; equity 50889.038; book debt 12342; maturity 5; interest 876.282; market rate 0.075; target D/E 0.35 | Unlevered beta 1.2848751835535976; market value of debt 12142.262754158139; beta at current D/E 1.4810829981796703; beta at 0.35 D/E 1.5726872246696035 |
| `wacccalc.xls` | Shares 2407; price 37.53; Advertising, Global; risk-free 0.025; regional revenue Asia 56, Caribbean 100, Middle East 631, North America 374, Western Europe 168; book debt 1000; interest 56; maturity 3; cost of debt typed 0.035; tax 0.4; leases: expense 180, commitments 156, 150, 145, 143, 140, then 600 | Unlevered beta 1.0965182129122983; premium 0.07127351392024078; lease debt 1127.920536988687; total debt 2186.7549135878735; levered beta 1.112444427253992; cost of equity 0.10428782337138168; cost of capital 0.10231930658266122 |
| `fcffginzu.xlsx`, cost of capital sheet | Shares 950.41; price 804.14; Drugs (Pharmaceutical); risk-free 0.045; regional revenue Asia 7440, North America 21791, Western Europe 6175, two free rows 1673 and 1540 at 0.0563; book debt 25226; interest 486; maturity 3; cost of debt typed 0.0365; tax 0.25 | Unlevered beta 0.915135973481584; premium 0.04921860682334804; market value of debt 24011.472745307412; levered beta 0.9366996608369831; cost of equity 0.09110305231829893; cost of capital 0.08916184398076038 |
| `pvtdiscrate.xls` | Unlevered beta 1.02; correlation 0.45; risk-free 0.06; premium 0.055; cost of debt 0.07; tax 0.4; debt to capital 0.15 | Total beta 2.506666666666667; cost of equity 0.19786666666666666; cost of capital 0.17448666666666665 |
| `fcffginzulambda.xls` | Risk-free 0.05; beta 1.5; mature premium 0.06; lambda 0.25; country premium 0.0263 | Cost of equity 0.146575 |
| `riskchecker.xls` | Weekly; risk-free 0.0206; premium 0.0578; beta 1.192 | Expected return 0.08949759999999998 |
| `capstru.xlsx` | Its Disney sample, dated 26 Feb 2023 | Current debt ratio 0.19664174049407343 and cost of capital 0.09567120276370804; lowest cost of capital 0.09521199524948196 at 20% debt |

### 7. What a rebuild needs beyond arithmetic

**Iteration.** The workbook is saved with Excel's "iterative calculation" switched on. His first instruction on the `Input sheet` is to check that box: "If there is not, you will get circular reasoning errors." There are two loops in the simple Ginzu. One is in the employee-options sheet and does not touch cost of capital. The other is the lease-and-rating loop of Case C, which exists only when leases are Yes and the cost of debt approach is `Synthetic rating`. `ratings.xls` has the same loop. `capstru.xlsx` has one at every debt level. A rebuild repeats the calculation until the rating stops changing. Because ratings move in steps, a company sitting on a band edge could in principle flip between two ratings for ever, so the loop needs a cap on passes and a rule for which rating wins.

**Macros.** None in the three current workbooks. `implprem.xls` (2007) carries a macro project and asks for Excel's Solver. Nothing in the cost of capital worksheet depends on it.

**Choices that change which formula applies.** Five menus: approach (4 options), beta (5), premium (4), cost of debt (3), company type (2), plus leases Yes/No. Their effects are in section 3.3.

**Excel behaviours the formulas quietly rely on.**

- Text comparison ignores capitals. The menu offers `Will input`, `Direct input`, `Synthetic rating`, `Country of incorporation`; the formulas test for `Will Input`, `Direct Input`, `Synthetic Rating`, `Country of Incorporation`. It works only because Excel treats them as equal. A rebuild should use fixed codes, not text.
- The coverage tables show two columns, "greater than" and "less than or equal to", but the lookup uses only the first. A coverage of exactly 3 is rated in the band that starts at 3 (confirmed by recalculation: `A3/A-`), although the heading says "greater than".
- Rounding of the lease-lump years is half-away-from-zero. Many programming languages round halves to the even number instead.
- A menu value that a formula does not name falls through to the formula's last branch. For example, any unrecognised text in the beta menu is treated as `Multibusiness(Global)`, and any unrecognised approach as `Distribution`.
- Empty revenue rows count as zero. A cost of debt of exactly zero, or a share count of zero, divides by zero.

**Units.** His note: "if you enter numbers in millions, stay with millions all the way through, including on share count." The sheet cannot check this. Shares times price must be in the same units as debt.

### 8. Places where the original disagrees with itself

All in `fcffsimpleginzu.xlsx` unless stated. Each was read from the formula, not inferred.

1. **A constant left over from last year.** The industry-average approach adds (typed risk-free rate − 4.58%) to the industry figure. The note beside it says the industry figure is "in US dollars, using the riskfree rate at the start of the year. It will be adjusted for the difference in riskfree rates". The January 2026 industry file was built on 3.95%. 4.58% is the rate in last year's archived file. As written, the approach returns a number 0.63 percentage points lower than the note describes.
2. **The distribution approach is not adjusted at all**, although its note says "I will adjust the rate by the difference in riskfree rates". Case D2 confirms the raw table value is used.
3. **The global industry-average lookup reads the US industry cell.** With `Single Business(Global)` chosen for the industry-average approach, the formula takes the name from `Input!B8` (the US menu) and looks it up in the Global table. Harmless only if both menus are set to the same industry.
4. **A typed beta is used as it is.** The comment on the unlevered beta cell says "If you input a beta directly, I will unlever that beta using the current debt to equity ratio." The formula does not; it uses the typed beta as the levered beta.
5. **The equity inside a convertible is worked out and then dropped.** His slides say the option part of a convertible "gets added to the market capitalization". The worksheet computes it (`C56`) but equity stays at shares times price.
6. **A third company type that leads nowhere.** The rating formula has a branch for type 3 that points at an empty range, and the notes refer to a "special cases worksheet" that is not in the file. The menu allows only 1 and 2.
7. **A note with an old number.** The `Input sheet` says the long-run cost of capital is "riskfree rate + 4.5%". The formula adds the mature market premium cell, 4.23%.
8. **The country spread is added on one path only.** An invented rating gets the country's default spread on top; an actual rating does not. This may be intended (an actual rating already reflects the country), but nothing on the sheet says so.

Across files:

- `ratings.xls` rounds the same spreads to two decimals (0.78% where the Ginzu has 0.7751%). The two give slightly different costs of debt for the same company.
- `fcffginzu.xlsx` labels the three lowest non-default bands in a different order (16% is `Caa/CCC` there and `C2/C` in the simple Ginzu). The spreads are the same.
- The default inputs of the simple Ginzu are not one company. The `Input sheet` shows revenue of 21,765; the regional revenue table on the worksheet sums to 47,061, the country table to 225,471 and the business table to 253,010. The share count and price give a market value of 311,888 against that revenue, and the model's own answer is 7.19 a share against a typed price of 72.28. The arithmetic is still a valid check; the example is not a sensible valuation.
- His notes describe the step from the US premium to the base premium two ways: once as subtracting the US default spread (4.46% − 0.23% = 4.23%, which matches the tables), and once as subtracting the spread times 1.52, with figures that do not add up to 4.23%.

### 9. What a beginner finds hardest

Judged from where the sheet carries its longest warnings and from what he repeats in class.

1. **The risk-free rate, and keeping one currency throughout.** The sheet: "This should be today's long term riskfree rate. If you are working with a currency where the government has default risk, clean up the government bond rate". His class recap of cost of equity begins: "Has to be in the same currency as cash flows" ([valuation class, session 7 slides](https://pages.stern.nyu.edu/~adamodar/podcasts/valspr24/session7slides.pdf)). Since May 2025 he applies this to the US dollar too: the Treasury bond rate is no longer his risk-free rate (section 5).
2. **Risk comes from where a company does business, not where it is registered.** The longest note on the worksheet is about this: what to do when a company reports "Rest of the World" as a region, with a workaround involving a second sheet. The comment on the premium cell: "If your company has risk exposure in emerging markets, incorporate that risk premiums here."
3. **Beta comes from the industry, not from the company's own share price.** He gives three reasons ("more precise", business mix changes, debt changes) in [Ten Questions about Bottom-up Betas](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/TenQs/TenQsBottomupBetas.htm). The idea of removing debt from a beta and putting the company's own debt back is the least intuitive step, and with several businesses the weights are estimated values (revenue times a multiple), not revenues.
4. **Inventing a rating.** Which of the two tables applies is a judgment ("If company has volatile earnings or is in risky business, use 2, even if large market cap"). Loss-making companies get a default rating, with the sheet's opening warning: "Do not use that rating as your cost of debt for a going concern." In class he shows the invented rating disagreeing with the real one (Disney: invented AAA, actual A) and lists why ([corporate finance class, session 11 slides](https://pages.stern.nyu.edu/~adamodar/podcasts/cfspr24/session11slides.pdf)).
5. **Market values, not accounting values, for the weights.** He sets it as a quiz question in the valuation class and names "three specious arguments used against market value" in the corporate finance class (both decks linked above). Pricing the debt needs its average maturity, which is in a footnote of the accounts; his class instruction is "If you cannot find the average maturity of your debt, use 3 years", while the worksheet says to enter zero, which leaves debt at its accounting value.
6. **Two tax rates.** The valuation uses the effective rate for cash flows and the marginal rate for the cost of debt and for beta. The sheet's two comments spell out the difference; his recap: "Marginal tax rate, reflecting tax benefits of debt".
7. **What counts as debt.** Interest-bearing debt only; leases count, once.
8. **Units and the iteration switch.** Both warnings sit above the first input on the `Input sheet`. A first-time user who misses either gets wrong answers or error cells before reaching any finance.

### 10. Method notes

- An earlier internal read of the same file version (same checksum) agrees with every cost of capital number above. Two corrections to it: the unlevered beta cell does hold a stored value (0.4694...), and the workbook has a second circular loop besides the employee-options one (section 7).
- Web search was run across Parallel, Octen, Firecrawl and Tavily. The Tavily connector was not available in this session, so its command-line tool was used instead. The Firecrawl command-line tool was not signed in, so a planned site-wide listing of his file directory was not done; the inventory in section 2 rests on his spreadsheet page and his Cost of Capital Central page.
- His slides were read through search-tool extracts of the PDF text, not page by page.
- Tool documentation for openpyxl was taken from Context7.

## Open questions

1. **Match the file or match the teaching?** For each item in section 8, should ValueIt reproduce his file exactly, or do what his notes and slides say? Matching the file keeps the check numbers simple. Matching the teaching means a Student who compares against his spreadsheet sees a different answer in those cases.
2. **Is the 4.58% in the industry-average approach really a leftover?** The evidence says yes. Only he can confirm.
3. **What does Excel give for the circular case?** Needs one run of Case C on a machine with Excel, iteration switched on.
4. **Which table version does the Lesson ship, and when does it change?** His January 2027 update is about six weeks away. The country premiums and the base premium move during the year as well. This belongs to ticket #16.
5. **Which company does the Student work on?** The worksheet assumes the user brings about a dozen figures from an annual report and a live share price. His sample is not coherent. This also belongs to ticket #16.
6. **Older versions of the spreadsheets.** No archive of past spreadsheet versions was found on his site, though past data tables are archived. Not searched exhaustively.
7. **The video guide** to the simple Ginzu was not watched. It may show which inputs he expects people to stumble on, and would be the best check on section 9.
