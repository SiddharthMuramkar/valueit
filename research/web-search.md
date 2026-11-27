# Which web search lets the Chatbot bring in today's events

Research for [Which web search lets the Chatbot bring in today's events](https://github.com/SiddharthMuramkar/valueit/issues/24). Checked on 2026-11-27 against the vendors' own documentation and pricing pages. Desk research only: no search was run against either product to time it, so every speed figure is the vendor's own or somebody else's measurement and is marked as such.

## The answer

**OpenAI does have its own built-in web search. It works with `gpt-6.2-sol` and, by its docs, can sit in the same request as the search of Damodaran's material.** It is the simplest option by a wide margin: no new vendor, key or bill, and one line of setup.

**Recommendation: use Parallel's Search API all the same, called by one small function in the app, with its key installed through the Vercel Marketplace.** Three facts decide it, and each is about what this feature is for.

1. **Recent dates.** Parallel can be told "nothing published before this date", and it returns a page's date when it knows it. OpenAI's tool has no date setting and returns no dates. A feature whose point is today's events needs that control. One caution: how often Parallel knows a page's date is unproven (see Open questions).
2. **What a Student can be shown.** Parallel hands the app the title, the link, the date and the actual passages from the page. OpenAI hands back a link and a title, pinned to the sentence they support. Only Parallel lets ValueIt show a Student the words a fact rests on.
3. **Speed that is known.** Parallel publishes about 0.7 seconds a search, and an outside benchmark measured about 1 second. OpenAI publishes nothing, and the outside reports are poor. A Parallel search is also an ordinary call the app can make whenever it likes, which allows two faster designs that OpenAI's tool cannot offer (see "Three ways to wire it").

**What it costs against the stack test.** One more vendor, one more key, and a small piece of code that is ValueIt's to fix. Bought through the Vercel Marketplace it adds no new bill. If the owner ranks "fewest vendors" above the three points, OpenAI's tool is a fair choice, and with search kept behind one small function the switch is a change in one place.

### The options side by side

| | OpenAI built-in web search | Parallel Search API, run by the app (recommended) | Parallel through its MCP server |
|---|---|---|---|
| **New vendors / keys / bills** | 0 / 0 / 0 | 1 / 1 / 0 through the Vercel Marketplace (1 bill if bought direct) | Same as the middle column |
| **Time added per answer** | Not published. Outside reports: slower than most, with one account of timeouts | Search itself about 0.7 s (Parallel) or about 1 s (outside benchmark). Plus one more thinking pass by the model if the Chatbot decides to search: about 4 to 5 s in all (estimate). About 1 s if the app searches first. Nothing if fetched ahead | Not published. The same search, plus a tool-listing step and a hop between two vendors |
| **How a Student is shown the source** | Link and page title, pinned by OpenAI to the exact sentence. No date. No quoted text | Link, title, date when known, and the quoted passage. Tying each sentence to its source is ValueIt's code | Same data as the middle column, arriving as text ValueIt must still sort out |
| **Hold search to trusted sites** | Yes, up to 100 sites | Yes, up to 200 entries, down to one section of a site | Yes, same settings |
| **Hold search to recent dates** | No setting. Only a request in the prompt | Yes: an earliest publication date | Yes |
| **Cost at 600 searches a month** (20 Students) | About $16 (estimate) | About $8 (estimate) | About $8 (estimate) |
| **Cost at 6,000 searches a month** | About $156 (estimate) | About $80 (estimate) | About $80 (estimate) |
| **Who fixes a fault** | OpenAI | Parallel fixes its search. The small function that calls it is ValueIt's | A fault can sit with OpenAI, with Parallel or between them |
| **Ease for AI coding agents** | Least code: one entry in a list, in the SDK already in use. Cannot be tested apart from the model | A second small SDK and about one file of code. Plain data in and out, so tests can replay a saved result | Little code, but the hardest to see inside and to test |

A fourth route exists and is not recommended: Parallel inside Vercel's AI Gateway. It needs no key and is free in one mode until 31 January 2027, but every model call would then pass through Vercel, which cuts across the locked choice of OpenAI's own SDK.

### Three ways to wire it

These apply to Parallel only, because its search is a plain call the app makes itself. OpenAI's search runs only inside a model request.

- **A. The Chatbot decides.** The Chatbot is told a search function exists. When it wants one, it asks, the app runs the search and gives back the results, and the Chatbot then writes its answer. This is the standard pattern. It costs one extra thinking pass by the model plus the search: about 4 to 5 seconds added (estimate).
- **B. The app searches first.** When the app already knows a search is wanted (the Student pressed a "show me a real example from this week" button, or the Lesson Plan marks the spot), it searches first and hands the results to the Chatbot with the question. One model pass. About 1 second added (estimate).
- **C. Once a day per Lesson.** A Lesson Plan is written ahead and is the same for every Student. A daily search per Lesson could fetch the day's events for its ideas, and every Student that day would get them with no wait at all. The cost stops growing with the number of Students.

Which of these fits belongs to [What the Chatbot does and never does](https://github.com/SiddharthMuramkar/valueit/issues/10) and to the speed test in [Whether answers and generated Widgets arrive fast enough](https://github.com/SiddharthMuramkar/valueit/issues/15). The point for this ticket: only a search the app can call directly keeps B and C open.

### What it means for ValueIt

- **Accounts and keys.** One Parallel install from the Vercel Marketplace, the route the database research also recommended for Neon. Vercel creates the key and stores it in the project's settings, where every other key lives. The charge appears on the Vercel invoice.
- **Who fixes what.** If Parallel's search is down or wrong, Parallel fixes it. The function that calls it, the rule for what happens when it fails, and the matching of sentences to sources are ValueIt's. If search fails, the Chatbot should simply teach without it.
- **What the Student sees.** Under a sentence about today: the source's name, its date, a link, and if wanted the passage it came from. With OpenAI's tool it would be the link and the page title only.
- **A trusted-site list is the owner's to write.** Both options obey a list. A short list of sites the owner would be happy to see quoted to a Student is the main guard on quality. Parallel warns that a tight list can thin out results, so the list needs a test.
- **Speed.** A live answer at medium effort starts in about 3 to 4 seconds without search, by the [earlier speed research](https://github.com/SiddharthMuramkar/valueit/issues/3). Design A roughly doubles that. Designs B and C nearly keep it. None of this is measured yet.
- **Money does not decide this.** Either option is under about $20 a month at invite-only scale. The model reading the search results costs more than the search fee under both.
- **What is given up.** OpenAI's ready-made link between a sentence and its source, and the one-line setup.
- **Privacy.** Whatever is typed into a search goes to the search vendor. A search must never carry a Student's name or anything personal. Designs B and C make that easy, because the app writes the search.
- **Web pages can carry instructions.** Text from the web is read by the Chatbot under either option, and a page can be written to mislead a model. The trusted-site list is the main defence. OpenAI gives this warning itself.
- **This repo is public.** The Parallel key lives only in the Vercel project's settings.

### What would change the recommendation

1. **The speed test shows OpenAI's tool is no slower** than Parallel's best path, and it finds this week's events without a date setting. Then take OpenAI's tool and drop the vendor.
2. **The owner decides a link and a title are enough** for a Student, and that no date control is needed. Then the two main reasons for Parallel fall away.
3. **Matching sentences to sources proves unreliable** in ValueIt's own code (the Chatbot points to the wrong source). OpenAI does that matching itself.
4. **Parallel is slow to pick up same-day news.** By default it answers from pages it has already collected. Asking it to fetch pages live is slower.
5. **Parallel changes its price or terms, has a bad run of faults, or leaves the Vercel Marketplace.** It is a young company: its products first launched in August 2025, and its search API was reworked during 2026.
6. **OpenAI adds a date setting, dates and quoted text** to its tool. It has added controls to this tool before, such as the site list.
7. **Model calls move to Vercel's AI Gateway** for another reason. Parallel is built into it with no key.

### What stays unproven without a live test

The numbers the speed prototype should measure, on `gpt-6.2-sol` at medium effort, from a deployed Vercel function, with the same ten or so questions each time:

1. **Seconds to the first word** with no search, with OpenAI's tool, and with Parallel in designs A and B. The typical case and the slowest one in twenty.
2. **Seconds for the Parallel search alone**, from Vercel to Parallel and back, in `fast` and `turbo` mode. Compare with the published 0.7 and 0.2 seconds.
3. **How many searches and page-opens OpenAI's tool makes per answer** when left alone, and when capped at one.
4. **What each answer costs:** search fee plus the extra text the model reads, for both options, with 5 results and with 10.
5. **Whether adding web search slows answers that need no web search,** when it shares a request with the search of Damodaran's material. Also how often the Chatbot searches the web when it should have used the material.
6. **Freshness.** For ten events from the last 48 hours, how many each option finds. For Parallel, the share of results that carry a date.
7. **The trusted-site list.** With the list on, how often a search comes back empty or thin.
8. **Whether the sources are right.** For twenty cited facts, does the linked page really say it, for OpenAI's built-in links and for ValueIt's own matching.
9. **Failures.** Errors and timeouts in about a hundred searches each, and whether the Chatbot carries on cleanly when search fails.

---

## Evidence

"Third party" below means measured or claimed by someone other than the vendor. "Estimate" means arithmetic done in this note.

### 1. OpenAI's built-in web search

**It exists, and it fits the locked stack**

- Web search is a hosted tool in the Responses API: "use the web search tool in the Responses API". New work should use `{ "type": "web_search" }`; the older `web_search_preview` lacks the newer controls. [Web search guide](https://developers.openai.com/api/docs/guides/tools-web-search)
- GPT-6.2 Sol lists `web_search`, `file_search` and `mcp` among "Tools supported by this model when using the Responses API". [GPT-6.2 Sol model page](https://developers.openai.com/api/docs/models/gpt-6.2-sol)
- Same request as `file_search`: tools are passed as a list and "the model automatically decides whether to use a configured tool". [Using tools](https://developers.openai.com/api/docs/guides/tools). The setting that caps tool use "applies across all built-in tool calls, not per individual tool", which only makes sense when several built-in tools share one request. [Responses API reference](https://developers.openai.com/api/reference/resources/responses/methods/create). No page read says the two cannot be combined. Not tested here.
- A catch in that cap: `max_tool_calls` counts web searches and searches of the material together. A cap of two cannot promise one of each.
- GPT-6.2 Sol always thinks before it writes (the earlier research found it has no "off" setting). With a thinking model the tool can do more than search: it can open a page (`open_page`) and look inside it (`find_in_page`), and "can refine its searches as it reads results". So one answer may hold several steps. [Web search guide](https://developers.openai.com/api/docs/guides/tools-web-search)
- "With `tool_choice: "auto"`, search is optional." It can also be forced. [Web search guide](https://developers.openai.com/api/docs/guides/tools-web-search)

**What comes back**

- The answer text, with a `url_citation` for each cited source. It holds four things: the link, the page title, and the start and end position in the answer that the source supports. No date. No quoted passage from the page. [Web search guide](https://developers.openai.com/api/docs/guides/tools-web-search), [API reference](https://developers.openai.com/api/reference/resources/responses/methods/create)
- A record of each step: the search words used ("usually (but not always)") and, if asked for with `include: ["web_search_call.action.sources"]`, the full list of pages consulted. That list is links only. [Web search guide](https://developers.openai.com/api/docs/guides/tools-web-search), [API reference](https://developers.openai.com/api/reference/resources/responses/methods/create)
- A rule that comes with the tool: "When your interface displays web results or information from them, you must show inline citations as prominent, clickable links." [Web search guide](https://developers.openai.com/api/docs/guides/tools-web-search)
- While it runs, the stream sends an event "when a web search call is executing", so the screen can say "searching the web". [Streaming events reference](https://developers.openai.com/api/reference/resources/responses/streaming-events)
- "Real-time third-party feeds" also appear among the sources, labelled `oai-sports`, `oai-weather` or `oai-finance`. What the finance feed holds is not described. [Web search guide](https://developers.openai.com/api/docs/guides/tools-web-search)

**Controls**

- Sites: "up to 100 `allowed_domains` or up to 100 `blocked_domains`", subdomains included. Set by the app on each request, so the Chatbot cannot wander off the list. [Web search guide](https://developers.openai.com/api/docs/guides/tools-web-search)
- Dates: none. Neither the guide nor the API reference has a setting for recency or publication date. The only lever is the wording of the prompt. [Web search guide](https://developers.openai.com/api/docs/guides/tools-web-search), [API reference](https://developers.openai.com/api/reference/resources/responses/methods/create)
- Place: `user_location` takes a country, city, region and timezone. "If omitted or null, defaults to the United States." [API reference](https://developers.openai.com/api/reference/resources/responses/methods/create)
- Amount of text read: `search_context_size` is `low`, `medium` (default) or `high`. It "does not set an exact token count". [Web search guide](https://developers.openai.com/api/docs/guides/tools-web-search)
- Live or stored pages: `external_web_access` is on by default; off means "offline/cache-only mode". [Web search guide](https://developers.openai.com/api/docs/guides/tools-web-search)
- A gap between the docs and the SDK: the API reference lists only `allowed_domains` under filters, and OpenAI's own TypeScript sample marks blocked sites with the note "The published SDK omits this documented API filter." [Web search guide](https://developers.openai.com/api/docs/guides/tools-web-search), [API reference](https://developers.openai.com/api/reference/resources/responses/methods/create)

**Price**

- "$10.00 / 1k calls + Search content tokens billed at model rates." Each search step is a call: "Search actions incur a tool call cost". Whether opening a page is charged is not stated. [Pricing](https://developers.openai.com/api/docs/pricing), [Web search guide](https://developers.openai.com/api/docs/guides/tools-web-search)
- "Search content tokens" are the text the search feeds to the model. For GPT-6.2 Sol that is $2 per million tokens. How much text one search feeds in is not published for this model. For two small older models OpenAI bills "a fixed block of 8,000 input tokens per call". [Pricing](https://developers.openai.com/api/docs/pricing)
- Third party: one developer saw the input for the same short question grow from 101 to 4,615 tokens once the tool was switched on (March 2026, an older model). [Forum thread](https://community.openai.com/t/web-search-tool-frequently-timing-out-other-issues/1376113)

**Speed**

- No official figure. The docs say only that a search across several sources "might take several minutes" and should then run in the background. [Web search guide](https://developers.openai.com/api/docs/guides/tools-web-search)
- OpenAI's standard lane "does not have guaranteed latency". [OpenAI help centre](https://help.openai.com/en/articles/1000499-troubleshooting-api-errors-and-latency)
- Third party: Artificial Analysis timed OpenAI's tool on hard research questions (data to 19 November 2026). A task took 31.6 seconds with the tool against 23.4 without, so about 8 seconds more. That is across about four searches per task (estimate: $40.19 of search fees per 1,000 tasks at $10 per 1,000 calls). It used a different OpenAI model, GPT-5.6 Luna, and the testers call their search time "an upper limit" because "OpenAI does not report search time". They rate the tool "slower than average". [Artificial Analysis, OpenAI Web Search](https://artificialanalysis.ai/agents/search-api/openai), [method](https://artificialanalysis.ai/methodology/search-api)
- Third party: a developer reported in March 2026 that the tool "has been timing out on nearly every request" on simple questions at medium effort, and moved to an outside search service. OpenAI closed the thread in August without naming a fix. [Forum thread](https://community.openai.com/t/web-search-tool-frequently-timing-out-other-issues/1376113)
- Third party, a consultancy's blog with no method given: "10-30 seconds" for search with a thinking model, "too slow" for a conversation (April 2026). [Team 400 blog](https://team400.ai/blog/2026-04-openai-web-search-tool-agents-guide)

**Limits**

- "Responses API web search uses the underlying model's tiered rate limits." For GPT-6.2 Sol that starts at 5,000 requests a minute. [Web search guide](https://developers.openai.com/api/docs/guides/tools-web-search), [model page](https://developers.openai.com/api/docs/models/gpt-6.2-sol)
- "The web search context window is limited to 128k, even when the underlying model has a larger context window." [Web search guide](https://developers.openai.com/api/docs/guides/tools-web-search)

### 2. Parallel's Search API

**What it is and what comes back**

- One call, `POST /v1/search`, takes a goal in plain words (`objective`) and one to five short keyword searches (`search_queries`). It returns a ranked list. Each result has `url`, `title`, `publish_date` and `excerpts`. [Search quickstart](https://docs.parallel.ai/search/search-quickstart), [API reference](https://docs.parallel.ai/api-reference/search/web)
- The date is the "Estimated publish date of the webpage in YYYY-MM-DD format, if available". In Parallel's own sample reply, nine results of ten have no date. [API reference](https://docs.parallel.ai/api-reference/search/web), [Search quickstart](https://docs.parallel.ai/search/search-quickstart)
- The excerpts are passages of the page's own text, picked for the goal given. Ten results by default, twenty at most; total length is set with `max_chars_total`. [Advanced settings](https://docs.parallel.ai/search/advanced-search-settings), [Best practices](https://docs.parallel.ai/search/best-practices)
- It does not write an answer and does not tie a sentence to a source. That step is the app's.

**Modes, with Parallel's published speed and price**

| Mode | Parallel's stated speed | Price per 1,000 searches | Parallel's stated use |
|---|---|---|---|
| `turbo` | about 0.2 s | $1 | "Latency-sensitive, high-volume workloads (e.g. voice, chat...)". English and Japanese only |
| `fast` | about 0.7 s | $1 | "Recommended default for most agents" |
| `basic` | about 1 s | $5 | Longer passages per source |
| `advanced` (the default if none is set) | about 3 s | $5 | Background research |

- Source: [Search modes](https://docs.parallel.ai/search/modes), [Pricing](https://docs.parallel.ai/getting-started/pricing). "Excerpt length doesn't affect the price." Results past the first ten cost $1 per 1,000.
- Third party: Openbenchmarks, which describes itself as independent, measured on 17 November 2026: `fast` 0.95 to 1.08 seconds a search, `turbo` 0.33, `basic` 1.59, `advanced` 2.77 to 3.11. A `fast` search returned about 6,200 tokens of text for ten results. [Openbenchmarks web search](https://openbenchmarks.com/web-search)
- Third party: on Artificial Analysis's index of 14 search services (data to 19 November 2026), Parallel `advanced` scores 83 and `fast` 82; OpenAI's tool scores 74. Hard research questions on a different model, so a rough signal only. [Artificial Analysis search index](https://artificialanalysis.ai/agents/search-api)

**Free allowance**

- A direct Parallel account with a card gets $5 of free use each month, which is 5,000 `fast` searches. "Marketplace and postpaid organizations are not currently eligible." [Parallel blog, 9 July 2026](https://parallel.ai/blog/free-tier-parallel), [Parallel pricing](https://parallel.ai/pricing)

**Controls**

- Sites: `include_domains` and `exclude_domains`, up to 200 entries in total. An entry can be a whole site or one section of it, such as a newspaper's markets pages (section entries do not work in `turbo` mode). `include_domains` is "a hard allow list". [Source policy](https://docs.parallel.ai/resources/source-policy), [Advanced settings](https://docs.parallel.ai/search/advanced-search-settings)
- Parallel's own warning: "Source policies can significantly reduce result quality by excluding relevant pages from retrieval." [Source policy](https://docs.parallel.ai/resources/source-policy)
- Dates: `after_date` is the "Earliest publication date to return". [Source policy](https://docs.parallel.ai/resources/source-policy)
- Place: a country code, from a list of 37 countries. [Advanced settings](https://docs.parallel.ai/search/advanced-search-settings)
- All of these are set by the app in its own call, so the Chatbot cannot change them.

**Freshness**

- "By default, Search returns excerpts from pages Parallel has already indexed." Results "can omit pages that aren't in the index or show excerpts from an older version". A setting (`fetch_policy`) can force a fresh fetch, and "enabling live fetch significantly increases search latency". [Advanced settings](https://docs.parallel.ai/search/advanced-search-settings), [API reference](https://docs.parallel.ai/api-reference/search/web)
- How quickly Parallel collects same-day news is not published.

**Limits, support and record**

- 600 searches a minute on the pay-as-you-go plan. [Rate limits](https://docs.parallel.ai/getting-started/rate-limits)
- Support on the pay-as-you-go plan is documentation and a Discord group. The 99.9% uptime promise applies only to enterprise customers with a signed agreement. [Parallel pricing](https://parallel.ai/pricing), [Support plan](https://parallel.ai/legal/support-plan)
- Its status page lists four short faults across its services between August and November 2026, the latest a "brief increase in 5xx errors" on 5 November. [Status history](https://status.parallel.ai/history)
- Data: Parallel says its standard terms "let us use inputs and outputs, not linked to any individual, to train and improve the models behind our services". Keeping nothing ("zero data retention") comes only with the $1,000-a-month plan or an enterprise contract. It holds a SOC 2 Type II security report. [Parallel blog on EU residency](https://parallel.ai/blog/eu-data-residency), [Parallel pricing](https://parallel.ai/pricing)
- Age: Parallel "first launched its products in August 2025" and raised $100 million in November 2025. [Reuters, 12 November 2025](https://www.reuters.com/business/ex-twitter-ceo-agrawals-ai-search-startup-parallel-raises-100-million-2025-11-12/). During 2026 its search moved from a beta address to `/v1/search` with different modes and field names. [Migration guide](https://docs.parallel.ai/search/search-migration-guide)

### 3. How Parallel is given to an OpenAI model

**As a function tool the app runs (recommended)**

- OpenAI's own five steps: "1. Make a request to the model with tools it could call 2. Receive a tool call from the model 3. Execute code on the application side with input from the tool call 4. Make a second request to the model with the tool output 5. Receive a final response from the model". [Function calling guide](https://developers.openai.com/api/docs/guides/function-calling)
- Step 4 is the extra model pass in design A. OpenAI's speed advice includes "Make fewer requests" where steps can be joined, which is design B. [Latency guide](https://developers.openai.com/api/docs/guides/latency-optimization)
- Parallel publishes the tool description to copy (`search_web`, with `objective` and `search_queries`) and a TypeScript SDK, `parallel-web`. [Best practices](https://docs.parallel.ai/search/best-practices), [Search quickstart](https://docs.parallel.ai/search/search-quickstart)
- A trap for coding agents: Parallel's "OpenAI" snippet is in the older Chat Completions shape. The Responses API, which the earlier research found GPT-6.2 needs for tools, writes it slightly differently. [Best practices](https://docs.parallel.ai/search/best-practices), [Function calling guide](https://developers.openai.com/api/docs/guides/function-calling)
- Count: 1 vendor, 1 key, and the bill as chosen below.

**Through Parallel's MCP server and OpenAI's remote-MCP tool**

- MCP is a standard way for a model to reach an outside service. OpenAI calls Parallel's server itself, inside one request, so the app runs no search code. Parallel documents this exact pairing. [Parallel, programmatic use](https://docs.parallel.ai/integrations/mcp/programmatic-use)
- The Parallel key is sent to OpenAI with every request, and OpenAI passes it on to Parallel. [Parallel, programmatic use](https://docs.parallel.ai/integrations/mcp/programmatic-use). OpenAI says it does not store a token given in its `authorization` field; whether that also covers the header Parallel's example uses was not confirmed. [OpenAI MCP guide](https://developers.openai.com/api/docs/guides/tools-connectors-mcp)
- The server offers several tools; the list can be cut to search alone. Site and date settings can be pinned in a header, and "the server applies `override` last, so the model can't change these values". [Parallel MCP server](https://docs.parallel.ai/integrations/mcp/quickstart)
- OpenAI charges no fee per MCP call, only for the text. [OpenAI MCP guide](https://developers.openai.com/api/docs/guides/tools-connectors-mcp)
- Extra steps: OpenAI first asks the server for its tool list, unless that list is kept in the conversation "to optimize for latency". [OpenAI MCP guide](https://developers.openai.com/api/docs/guides/tools-connectors-mcp)
- OpenAI's warning: "Only use remote MCP servers you trust". [OpenAI MCP guide](https://developers.openai.com/api/docs/guides/tools-connectors-mcp)
- OpenAI's sentence-to-source links are described only for its own web search. Through MCP the results arrive as the tool's text, so ValueIt would still do the matching. Not tested.
- Why it is not the first choice: it saves little code, it is harder to time and to test, designs B and C are not possible through it, and a fault can sit with either vendor.

**The three ways to buy it on Vercel**

- **Vercel Marketplace (recommended).** Parallel is a "Vercel Native" integration. It "provides a single API key that works across all Parallel products, with billing handled directly through your Vercel account". Listed as pay as you go. [Vercel changelog, 4 February 2026](https://vercel.com/changelog/parallel-joins-the-vercel-agent-marketplace), [Marketplace listing](https://vercel.com/marketplace/parallel)
- **Direct account.** Same product, a separate bill, and the $5 monthly allowance. [Parallel pricing](https://parallel.ai/pricing)
- **Vercel AI Gateway (not recommended).** Parallel search is a built-in Gateway tool with no key. It costs $5 per 1,000 searches in every mode, and `fast` mode is free "through January 31, 2027". It works by routing the model call through Vercel's Gateway, which the locked stack does not do. [Vercel AI Gateway web search](https://vercel.com/docs/ai-gateway/models-and-providers/web-search)

### 4. Time added per answer, put together

- Starting point: a live answer at medium effort begins in about 3 to 4 seconds (third-party figures, from the [earlier speed research](https://github.com/SiddharthMuramkar/valueit/issues/3)).
- **Parallel, design A.** One more model pass (about 3 to 4 seconds on the same figures; possibly less, since the first pass only writes a short search request) plus a search of about 1 second. Estimate: 4 to 5 seconds added.
- **Parallel, design B.** The search, about 1 second, plus a few thousand more tokens for the model to read. Estimate: about 1 second added.
- **Parallel, design C.** Nothing added for the Student.
- **OpenAI's tool.** The model still thinks, searches, reads and thinks again, all inside OpenAI, which saves the app one round trip. The length of the search step is unpublished, and a thinking model may take several steps. The only measurements are the third-party ones in section 1.
- **Parallel through MCP.** Not published and not measured by anyone found.

### 5. Cost at invite-only scale and at ten times

Assumptions are mine. 20 Students, 10 Lessons each a month, 3 web searches a Lesson: 600 searches a month. Ten times that: 6,000. One search step per search. The model reads the results at $2 per million tokens.

| | 600 searches a month | 6,000 searches a month |
|---|---|---|
| OpenAI: search fee at $10 per 1,000 | $6.00 | $60 |
| OpenAI: text read, if 8,000 tokens a search (a yardstick, not a published figure for this model) | $9.60 | $96 |
| **OpenAI total (estimate)** | **about $16** | **about $156** |
| Parallel `fast`: search fee at $1 per 1,000 | $0.60 | $6 |
| Parallel: text read, at about 6,200 tokens a search (third-party measurement, ten results) | $7.44 | $74 |
| **Parallel total (estimate)** | **about $8** | **about $80** |

- Both text figures can be cut: OpenAI's with `search_context_size: low`, Parallel's with fewer results or a length cap.
- If OpenAI's tool takes several search steps per answer, its fee multiplies. The benchmark in section 1 saw about four per task on hard questions.
- A direct Parallel account would pay no search fee at 600 a month, inside the free allowance. Through the Marketplace the fee is the 60 cents shown.
- Under design C the number of searches follows the number of Lessons, not the number of Students.
- For scale: the earlier research put one medium-effort answer at roughly 1 to 2 cents.

### 6. Ease for AI coding agents

- **OpenAI's tool.** One entry in a list, documented in the SDK the stack already uses. Three catches. The documented options run ahead of the SDK's own types (see section 1). Nothing runs offline. The search cannot be tested apart from the model's answer, so a test of "did it find the right page" needs a full, paid model call.
- **Parallel as a function.** A second small SDK and about one file of code. Parallel publishes its docs as plain text with an index for agents, and a Next.js starter on Vercel. [Search modes](https://docs.parallel.ai/search/modes), [Marketplace listing](https://vercel.com/marketplace/parallel). A search is data in and data out, so a test can replay a saved result with no model and no network. Two catches: old samples from the beta are still around (Vercel's own February announcement uses the old call), and the tool snippet is in the older shape (section 3).
- **Parallel through MCP.** Least code of the Parallel routes, but the search happens between two vendors where a test cannot reach it.

---

## Open questions

Things this research could not confirm:

1. **The time OpenAI's tool adds for one search on `gpt-6.2-sol`.** No official figure. The third-party numbers are for other models and harder questions.
2. **The time design A really adds.** The second model pass is an estimate from the earlier research, not a measurement.
3. **Web search and the search of Damodaran's material in one request.** The docs allow it. Nobody found has reported how the two behave together.
4. **How much text one OpenAI search feeds to GPT-6.2 Sol,** and whether opening a page is charged.
5. **Whether OpenAI's blocked-sites setting works** from the TypeScript SDK, given the note in OpenAI's own sample.
6. **How fresh Parallel's collection is for same-day news,** and how often its results carry a date. The one sample seen had a date on one result in ten. The date filter may be weaker than it sounds if many pages have no date.
7. **Whether the Marketplace install has the same prices and limits** as a direct account, and whether it asks for a plan choice.
8. **Parallel's terms on showing its passages to a Student and on keeping a day's results** (design C). Not read.
9. **Search quality on finance news.** No option was tried on ValueIt's kind of question.
10. **Speed through MCP.**

Questions this raises for the map:

- Who decides a search is wanted: the Chatbot, the Student, or the Lesson Plan? That choice sets the wait more than the vendor does.
- Which sites go on the trusted list, and who keeps it?
- What does a Student see when a source is shown: a link, a date, the quoted passage?
- Does a Lesson Plan carry a "today" spot with its search written ahead?

## How this was researched

Vendor documentation and pricing pages read on 2026-11-27, plus OpenAI's developer forum, two benchmark sites and Parallel's status page for behaviour in use. Searches went through Parallel, Octen, Tavily and Firecrawl; Context7 was used first for the OpenAI and Parallel docs. All providers answered. Tavily was reached through its command-line tool. No account was touched and no search was run against either product to time it. Parallel is one of the two options compared and also one of the research tools used; its claims about itself are marked as its own, and the comparison rests on OpenAI's and Parallel's own pages and on outside measurements.
