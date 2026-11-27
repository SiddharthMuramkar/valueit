# How fast GPT-6.2 Sol is at each reasoning effort

Research for ticket #3. Desk research only: no API calls were made. Facts checked on 2026-11-27. This field changes monthly, so every number carries its date.

## The answer

**The name is right.** OpenAI released GPT-6.2 Sol on 17 November 2026. Its API id is `gpt-6.2-sol`. The earlier attempt used `gpt-6.1-sol`, which was the current Sol model until that date and still exists. GPT-6.2 Sol costs the same and is faster.

**What xhigh costs in waiting time.** At xhigh the model thinks before it writes anything. On OpenAI's own API, independent measurements between 18 and 27 November 2026 put that silent thinking at **23 to 52 seconds** before the first word of the answer. A short answer is then complete after roughly 26 to 57 seconds. A Widget of 1,000 to 3,000 tokens is complete after roughly 34 to 102 seconds. The earlier attempt was unusable at about 10 seconds a step. xhigh is three to five times slower than that before the Student sees a single word.

**Money is not the problem.** An xhigh answer costs roughly 3 to 5 cents. A medium answer costs roughly 1 to 2 cents. The cost of xhigh is the wait.

**What xhigh buys.** On an independent test of hard professional tasks, xhigh scores 56, high 55, medium 52 and low 41. The step from medium to xhigh is small. The step from low to medium is large. OpenAI's own guidance is to use xhigh for work that runs in the background and only when tests show a clear benefit.

### The four dials

There is no single setting to pick. Four things decide how long the Student waits, and each is set per request.

1. **Effort.** How long the model thinks before it writes. Low and medium start writing in about 2 to 4 seconds. High takes 8 to 20. xhigh takes 23 to 52.
2. **Length of the output.** The model writes at roughly 60 to 90 tokens a second on the standard lane. A token is about three quarters of a word. A 3,000-token Widget therefore takes 33 to 50 seconds to finish writing at any effort, low included. This matters as much as effort and nobody had it on the list.
3. **Lane.** OpenAI sells two faster lanes for the same model. Fast costs twice as much and measured about 1.9 times the speed. Ultrafast costs three times as much until 28 February 2027, then six times, and measured about 2.6 times the speed (OpenAI says up to 4.5 times). Both were measured at max effort only.
4. **What the Student sees while waiting.** Streaming shows words and Widget parts as they are written. A short summary of the model's thinking can be shown before the answer starts.

### The options

| Option | What the Student feels | Verdict |
| --- | --- | --- |
| A. xhigh for everything | 23 to 52 seconds of nothing, then the answer | Fails the 10-second bar by a wide margin |
| B. xhigh on the Ultrafast lane, with the thinking summary shown | An estimated 10 to 21 seconds before the answer starts, with progress text meanwhile | Still over the bar. Worth one run in the prototype so the owner can feel it |
| C. One model, effort set per job: medium for answers and Widgets, xhigh only for background work | First words in about 3 to 4 seconds | Meets the bar for answers. Meets it for Widgets only if the Widget is small or the lane is fast |
| D. A second, smaller model for quick jobs | No faster to the first word than Sol at low effort, and much weaker | Not worth a second model |

### Recommendation

1. **Use one model, `gpt-6.2-sol`, for both jobs.** Set the effort on every request.
2. **Job 1, the Chatbot answers a question: medium effort, standard lane, streamed.** First words in about 3 to 4 seconds. Drop to low if the prototype shows medium is slower than that.
3. **Job 2, the Chatbot generates a Widget: medium effort, a fast lane, a small payload, drawn as it arrives.** Aim for a Widget of under about 800 tokens, built from ready-made blocks. Test Fast and Ultrafast in the prototype and keep the cheaper one that finishes a Widget in under 10 seconds. A Widget of that size costs a few cents on any lane.
4. **Always show something at once.** The app draws its own "working on it" state the instant the Student asks. The model's first words or its thinking summary replace it.
5. **Keep xhigh for work no Student waits on**: checking answers, preparing Widgets ahead of time for the places Students usually get stuck, drafting Lesson material. That work can also run at half price.
6. **Do not go above high for anything live.**

### What it means for ValueIt

- The owner's wish for the best thinking and the wish for no waiting cannot both be met in the same request. They can both be met in the same product: xhigh prepares and checks material ahead of time, medium serves the Student live.
- The fixed path of a Lesson needs no model call, so it stays instant. That part of the map is confirmed by this research.
- How Widgets are built now matters for speed. A Widget that names ready-made blocks and fills in numbers is small and quick. A Widget described from scratch is large and slow at every effort.
- The prototype ticket (#15) should test more than effort. Section 8 lists what it most needs to measure.

## Evidence

"Independent" below means measured by someone other than OpenAI. "Estimate" means arithmetic done in this note from those measurements. OpenAI publishes no response times per effort for this model, so most timing figures are independent.

### 1. What OpenAI offers today

All from OpenAI's model pages, pricing page and changelog, read 2026-11-27.

| Model id | Released | Standard price per 1M tokens (input / cached input / output) | Efforts accepted | OpenAI's description |
| --- | --- | --- | --- | --- |
| `gpt-6.2-astra` | 17 Nov 2026 | $8 / $0.40 / $40 | low, medium, high, xhigh, max | Most capable model |
| `gpt-6.2-sol` | 17 Nov 2026 | $2 / $0.10 / $10 | low, medium, high, xhigh, max | "Our go-to model for everyday work" |
| `gpt-6.1-sol` | 29 Sep 2026 | $2 / $0.10 / $10 | low, medium, high, xhigh, max | Previous Sol |
| `gpt-6-sol` | 22 Sep 2026 | $2 / $0.20 / $10 | none, low, medium, high, xhigh, max | First GPT-6 Sol |
| `gpt-6.1-terra` | 26 Oct 2026 | $1 / $0.05 / $5 | none, low, medium, high, xhigh, max | "A fast, efficient model for visual reasoning, precise computer use, and clear, natural writing" |
| `gpt-6-luna` | 22 Sep 2026 | $0.10 / $0.01 / $0.50 | none, low, medium, high, xhigh, max | "Our most efficient model for focused, high-volume tasks" |

- Every model in the table has a 1,050,000-token context window, takes at most 922,000 input tokens and writes at most 128,000 output tokens. Sources: [GPT-6.2 Sol](https://developers.openai.com/api/docs/models/gpt-6.2-sol), [GPT-6.2 Astra](https://developers.openai.com/api/docs/models/gpt-6.2-astra), [GPT-6.1 Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol), [GPT-6 Sol](https://developers.openai.com/api/docs/models/gpt-6-sol), [GPT-6.1 Terra](https://developers.openai.com/api/docs/models/gpt-6.1-terra), [GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna), [models overview](https://developers.openai.com/api/docs/models).
- Release dates are from the [changelog](https://developers.openai.com/api/docs/changelog) and the [launch post](https://openai.com/index/introducing-gpt-6-2-astra-sol/).
- GPT-6.2 Sol has no "off" setting for thinking. "The API rejects requests that set reasoning effort to `none`." The lowest setting is low. Source: [GPT-6.2 Sol](https://developers.openai.com/api/docs/models/gpt-6.2-sol).
- GPT-6.2 Sol reads text and images and writes text. Its knowledge stops at 1 June 2026. It supports streaming, structured outputs, function calling and prompt caching. Source: [GPT-6.2 Sol](https://developers.openai.com/api/docs/models/gpt-6.2-sol).
- Tool calling on GPT-6.2 needs OpenAI's Responses API. The older Chat Completions API is supported but cannot call tools. The settings `temperature`, `top_p` and `logprobs` are not accepted. Source: [Using GPT-6.2](https://developers.openai.com/api/docs/guides/latest-model).
- No retirement date was found for any GPT-6 model on the [deprecations page](https://developers.openai.com/api/docs/deprecations). That page was searched, not read in full.

### 2. What OpenAI says about effort

- Effort is a setting on each request, `reasoning.effort`. Source: [reasoning guide](https://developers.openai.com/api/docs/guides/reasoning).
- "Lower effort favors speed and lower token usage, while at higher effort the model thinks more completely to provide higher quality responses. The models also reason adaptively across reasoning efforts, using fewer tokens for simpler tasks and thinking harder for complex tasks." Source: [reasoning guide](https://developers.openai.com/api/docs/guides/reasoning).
- OpenAI's own table of what each effort is for, shortened. Source: [reasoning guide](https://developers.openai.com/api/docs/guides/reasoning).

| Effort | OpenAI says it is best for |
| --- | --- |
| low | "Efficient reasoning with a modest latency increase." Named uses include "customer support / chat assistant workflows" |
| medium | "Default configuration for most workloads, and a well-balanced point on the pareto curve of latency, performance and cost" |
| high | "High-value tasks where quality and intelligence matters more than latency" |
| xhigh | "Deep research, asynchronous workflows and agentic tasks that require long runs. Only use when your evals show a clear benefit that justifies the extra latency and cost" |
| max | "Maximum reasoning for your most complex tasks" |

- "For most API workflows, start with GPT-6.2 Sol at medium reasoning effort." Source: [model selection guide](https://developers.openai.com/api/docs/guides/model-selection).
- "Start with `medium` for a new integration. If you currently use `none` or `minimal`, use `low` instead." Source: [Using GPT-6.2](https://developers.openai.com/api/docs/guides/latest-model).
- "Treat `reasoning.effort` as a tuning knob, not the primary way to recover quality." Source: [reasoning guide](https://developers.openai.com/api/docs/guides/reasoning).
- The API reference lists the default effort as medium. The reasoning guide says defaults depend on the model and does not name GPT-6.2 Sol's. Set it on every request. Sources: [Responses API reference](https://developers.openai.com/api/reference/resources/responses/methods/create), [reasoning guide](https://developers.openai.com/api/docs/guides/reasoning).
- Thinking is billed. Reasoning tokens "are billed as output tokens" although they are never shown. Source: [reasoning guide](https://developers.openai.com/api/docs/guides/reasoning).
- There is also a separate "pro" mode that does more work and takes longer. It is not for live use. Source: [reasoning guide](https://developers.openai.com/api/docs/guides/reasoning).

### 3. How long each effort takes

**Table A. GPT-6.2 Sol on OpenAI's standard lane.**

| Effort | Wait before the first word of the answer (independent, measured) | Short answer of about 300 tokens complete (estimate) | Widget of 1,000 to 3,000 tokens complete (estimate) | Score on hard tasks (independent) |
| --- | --- | --- | --- | --- |
| low | about 2 s (1.8 to 2.2) | 5 to 7 s | 13 to 52 s | 41 |
| medium | about 3 to 4 s (2.8 to 4.2) | 6 to 9 s | 14 to 54 s | 52 |
| high | 8 to 20 s | 11 to 24 s | 19 to 70 s | 55 |
| xhigh | 23 to 52 s | 26 to 57 s | 34 to 102 s | 56 |
| max | 62 to 121 s | 65 to 126 s | 73 to 171 s | 57 |

How to read Table A:

- **The first-word column** is Artificial Analysis's "time to first answer token" for `gpt-6.2-sol` on OpenAI's own API. The low end of each range is the reading published around 18 November 2026: 1.77 s, 2.81 s, 7.90 s, 22.98 s, 61.56 s. The high end is the reading in its leaderboard table on 27 November 2026: 2.15 s, 4.17 s, 19.51 s, 51.55 s, 121.26 s. The summary text on the model page that day gave 2.02 s, 4.11 s, 19.44 s, 51.46 s and 119.89 s. Other captures of the same page in between showed 27 s, 32 s and 35 s for xhigh. Sources: [Artificial Analysis, GPT-6.2 Sol](https://artificialanalysis.ai/models/gpt-6-2-sol), read 27 Nov 2026; the 18 Nov figures as recorded by [One AI API Key](https://oneaiapikey.com/resources/blog/gpt-6-2-reasoning-effort-tiers).
- **Method of that measurement.** Artificial Analysis sends prompts of about 1,000, 10,000 and 100,000 input tokens and multi-turn agent tasks, under concurrent load, every 6 hours. Each figure is an average over the past 5 days. The "first answer token" time includes the thinking. Source: [Artificial Analysis methodology](https://artificialanalysis.ai/methodology/performance-benchmarking).
- **Nothing is visible during that wait by default.** Artificial Analysis records the same value for "first token" and "first answer token" on this model. The thinking itself is not streamed. Source: [Artificial Analysis, GPT-6.2 Sol](https://artificialanalysis.ai/models/gpt-6-2-sol).
- **The two "complete" columns are estimates made in this note.** They add the first-word wait to the writing time at 60 to 90 tokens a second. That writing speed comes from three independent sources: Artificial Analysis measured 55 to 59 tokens a second on 27 November and 72 to 85 around 18 November; the two one-off tests below, both from 18 November, work out at 78 to 90.
- **The score column** is the Artificial Analysis Intelligence Index, a mix of hard knowledge-work, coding and science tasks, read 27 Nov 2026. Source: [Artificial Analysis, GPT-6.2 Sol](https://artificialanalysis.ai/models/gpt-6-2-sol).

**Table B. A second independent measurement: one question at each effort.** ComputingForGeeks, published 18 November 2026. One short debugging question, one run per effort, sent through OpenRouter and pinned to OpenAI's own endpoint. The time is from sending the request to receiving the whole answer. Source: [ComputingForGeeks](https://computingforgeeks.com/gpt-6-2-astra-sol-pricing-api).

| Effort | Total time | Thinking tokens | All output tokens | Billed cost |
| --- | --- | --- | --- | --- |
| low | 7.4 s | 38 | 576 | $0.0059 |
| medium | 10.3 s | 340 | 831 | $0.0084 |
| high | 16.0 s | 890 | 1,351 | $0.0136 |
| xhigh | 36.5 s | 2,783 | 3,215 | $0.0323 |
| max | 101.9 s | 8,792 | 9,149 | $0.0916 |

- These answers were 350 to 540 visible tokens, longer than the 300 assumed in Table A, and they fit the estimates.
- The spread between runs is wide. A second run at high took 22.3 s and cost 40% more. Source: same article.
- More thinking did not change the answer. "All five answers named the same two core causes." The higher efforts "added more confirmation commands and longer explanations, not different conclusions." Source: same article.

**A third independent measurement: a long output.** A public benchmark report dated 18 November 2026 timed one long coding prompt at each effort. At low effort the model wrote 3,896 tokens in 45.4 seconds, at 86 tokens a second. At xhigh it wrote 12,330 tokens, 7,844 of them thinking, in 138 seconds. The report does not say the calls went to OpenAI's own API, so treat it as a rough check on writing speed only. Source: [benchmark report on GitHub](https://github.com/turbo998/benchmark-harness-engineering/blob/main/docs/reports/gpt-6-2-sol-benchmark.en.md).

**Two cautions on all of these numbers.**

- They were measured on other people's questions. OpenAI says the model thinks less on easy questions. The same GitHub report timed a small decision at 8 to 9 seconds at low, medium and high alike. ValueIt's real waits at high and xhigh could be shorter than Table A. Only the prototype can say.
- They move from week to week. The xhigh wait more than doubled between 18 and 27 November on the same test.

**Comparison with the earlier attempt's model.** Around 18 November 2026, Artificial Analysis measured `gpt-6.1-sol` at 49 tokens a second and `gpt-6.2-sol` at 85, both at max effort. Source: [Emergent, citing Artificial Analysis](https://emergent.sh/learn/gpt-6-2-sol-vs-gpt-6-1-sol).

### 4. What it costs

Prices for `gpt-6.2-sol` per 1 million tokens, for requests of up to 272,000 input tokens. Source: [OpenAI pricing](https://developers.openai.com/api/docs/pricing), read 2026-11-27.

| Lane | Input | Cached input | Output | Note |
| --- | --- | --- | --- | --- |
| Standard | $2.00 | $0.10 | $10.00 | |
| Fast | $4.00 | $0.20 | $20.00 | Twice standard |
| Ultrafast, until 28 Feb 2027 | $6.00 | $0.30 | $30.00 | Three times standard |
| Ultrafast, from 1 Mar 2027 | $12.00 | $0.60 | $60.00 | Six times standard |
| Batch | $1.00 | $0.05 | $5.00 | Half price, not live |

- The price per token is the same at every effort. Higher effort costs more only because the model spends more thinking tokens, billed as output. Sources: [OpenAI pricing](https://developers.openai.com/api/docs/pricing), [reasoning guide](https://developers.openai.com/api/docs/guides/reasoning).
- Table B shows the size of it: about half a cent to one cent per answer at low and medium, 3 cents at xhigh, 9 cents at max, on a small prompt.
- Estimate for a Widget of 2,000 output tokens, before thinking tokens: 2 cents on standard, 4 cents on Fast, 6 cents on Ultrafast now, 12 cents on Ultrafast from March 2027.
- Requests over 272,000 input tokens cost double for input and one and a half times for output. ValueIt's requests should be far below that. Source: [GPT-6.2 Sol](https://developers.openai.com/api/docs/models/gpt-6.2-sol).
- The cheaper "Flex" lane does not exist for GPT-6.2. "GPT-6.2 Astra and Sol don't support Flex processing." For work that can wait, OpenAI offers Batch at half price and background requests at 30% off for a 2-hour window or 40% off for an 8-hour window. Sources: [Using GPT-6.2](https://developers.openai.com/api/docs/guides/latest-model), [background mode](https://developers.openai.com/api/docs/guides/background).

### 5. What softens the wait

**Effort per request.** Effort is a field on each request, so one job can run at medium and another at xhigh. It can also be changed part-way through a conversation without losing the saved prompt, by adding a `configuration_update` item. Source: [reasoning guide](https://developers.openai.com/api/docs/guides/reasoning).

**A faster lane per request.** The lane is also a field on each request, `service_tier`.

- Fast: "up to 2.5× faster speeds and more consistent latency." OpenAI says to use it "for user-facing applications with regular traffic where latency matters." It can be set per request or as the default for a project. If traffic rises too quickly, some requests are quietly served and billed at standard speed, and the response says so. Source: [Fast mode](https://developers.openai.com/api/docs/guides/fast-mode).
- Ultrafast: "the fastest service tier in the OpenAI API." It supports GPT-6.2 Sol. Source: [Ultrafast mode](https://developers.openai.com/api/docs/guides/ultrafast-mode). OpenAI's stated speed, from its ChatGPT and Codex documentation: "On GPT-6.2 Astra and GPT-6.2 Sol, Ultrafast generates tokens at up to 4.5 times the speed of Standard." Source: [Fast and Ultrafast modes](https://learn.chatgpt.com/docs/agent-configuration/speed).
- Independent, 27 November 2026, max effort only: standard 59 tokens a second and 121 s to the first word; Fast 114 tokens a second and 57 s; Ultrafast 153 tokens a second and 50 s. That is about 1.9 times and 2.6 times the standard speed. Source: [Artificial Analysis, GPT-6.2 Sol providers](https://artificialanalysis.ai/models/gpt-6-2-sol/providers).
- Estimate: if those ratios hold at other efforts, xhigh would start answering after about 10 to 24 seconds on a fast lane. Nobody has published that measurement.
- Ultrafast has its own rate limits. OpenAI publishes none for GPT-6.2 Sol and says to check the organisation's settings. For customers who need their data processed in a named region, Ultrafast on GPT-6.2 offers the United States only. Source: [Ultrafast mode](https://developers.openai.com/api/docs/guides/ultrafast-mode).

**Estimate: how big a Widget fits inside 10 seconds at low or medium effort.** This allows 2 to 4 seconds of thinking and 6 to 8 seconds of writing.

| Lane | Writing speed assumed | Widget size that fits |
| --- | --- | --- |
| Standard | 60 to 90 tokens a second | about 350 to 700 tokens |
| Fast | 115 to 170 | about 700 to 1,400 tokens |
| Ultrafast, at the measured 2.6 times | 155 to 230 | about 900 to 1,900 tokens |
| Ultrafast, at OpenAI's "up to 4.5 times" | 270 to 400 | about 1,600 to 3,200 tokens |

**Streaming.** OpenAI calls streaming "the single most effective approach, as it cuts the waiting time to a second or less." That holds once the model has started writing. It does not shorten the thinking. Source: [latency optimization](https://developers.openai.com/api/docs/guides/latency-optimization).

- Plain text arrives piece by piece as `response.output_text.delta` events. Source: [streaming guide](https://developers.openai.com/api/docs/guides/streaming-responses).
- Structured output streams the same way, as partial JSON. "This is particularly useful if you would like to display JSON fields one by one, or handle function call arguments as soon as they are available." OpenAI recommends its SDK's helpers for this. Source: [structured outputs, streaming](https://developers.openai.com/api/docs/guides/structured-outputs#streaming).
- Tool-call arguments stream piece by piece as `response.function_call_arguments.delta` events. Source: [function calling, streaming](https://developers.openai.com/api/docs/guides/function-calling#streaming).
- So whichever way the model emits a Widget (text, structured output or tool call), OpenAI delivers it as it is written. Whether the A2UI renderer can draw a half-received Widget is a question for the A2UI ticket (#2).
- OpenAI's structured outputs guide lists "UI Generation" as an example use. Source: [structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs).
- One catch: "the first request you make with any schema will have additional latency as our API processes the schema, but subsequent requests with the same schema will not." Source: [structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs).

**Showing the thinking.** Set `reasoning.summary` to `auto` and the API returns a summary of the thinking. It streams as `response.reasoning_summary_text.delta` events. OpenAI notes that an organisation "may need to complete organization verification" first. No source says how soon the first summary text arrives. Sources: [reasoning guide](https://developers.openai.com/api/docs/guides/reasoning), [streaming events reference](https://developers.openai.com/api/reference/resources/responses/streaming-events).

**A short opening line.** "For faster time to first visible token in latency-sensitive applications, ask the model to generate a short preamble before continuing with deeper reasoning." Source: [reasoning guide](https://developers.openai.com/api/docs/guides/reasoning). The guide does not say how well this works on GPT-6.2 Sol.

**Shorter output.** "Cutting 50% of your output tokens may cut ~50% of your latency." For structured output: "minimize your output syntax where possible." Source: [latency optimization](https://developers.openai.com/api/docs/guides/latency-optimization). This is the reason to build Widgets from ready-made blocks.

**Not calling the model at all.** OpenAI's guide lists pre-computing and plain interface components as faster than a model call. Source: [latency optimization](https://developers.openai.com/api/docs/guides/latency-optimization). For ValueIt this means Widgets prepared ahead of time for the usual sticking points.

**Two calls at once.** OpenAI's guide recommends running independent steps in parallel. Source: [latency optimization](https://developers.openai.com/api/docs/guides/latency-optimization). The Chatbot's text answer and the Widget could be two requests started together, so the words arrive while the Widget is still being built.

**Prompt caching.** It saves money more than time.

- Caching is automatic once the fixed start of the prompt is at least 1,024 tokens. Reused tokens cost 5% of the normal input price on GPT-6.2 Sol. Writing to the cache costs 1.25 times the input price for a 30-minute life, or 2.5 times for a 12-hour life. Source: [prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching).
- OpenAI says caching is "faster" but also that it "does not guarantee that every request reuses stored KV tensors or has lower latency." Source: [prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching).
- OpenAI's general rule: "cutting 50% of your prompt may only result in a 1–5% latency improvement." Source: [latency optimization](https://developers.openai.com/api/docs/guides/latency-optimization).
- Independent, 18 November 2026: a 21,042-token prompt cost $0.0530 the first time and $0.0025 the second, and both calls took 1.6 seconds. Source: [ComputingForGeeks](https://computingforgeeks.com/gpt-6-2-astra-sol-pricing-api).
- Two rules for GPT-6.2. Put the standing instructions in a `developer` message at the start of the input, because the separate `instructions` field is never cached on this model. Add new material to the end of a conversation and never edit what came before. Source: [Using GPT-6.2](https://developers.openai.com/api/docs/guides/latest-model).

**Things that do not help here.**

- WebSocket mode keeps one connection open. OpenAI reports "up to roughly 40% faster end-to-end execution" for runs with 20 or more tool calls. ValueIt's two jobs are one or two calls each. Source: [WebSocket mode](https://developers.openai.com/api/docs/guides/websocket-mode).
- Predicted outputs are not supported on GPT-6.2 Sol. Source: [GPT-6.2 Sol](https://developers.openai.com/api/docs/models/gpt-6.2-sol).
- Switching to a weaker model in the middle of one conversation makes the API drop the saved thinking, and "answer quality can decline." Keep each job in its own conversation. Sources: [Using GPT-6.2](https://developers.openai.com/api/docs/guides/latest-model), [reasoning guide](https://developers.openai.com/api/docs/guides/reasoning).

### 6. The smaller siblings are not a shortcut

Independent, Artificial Analysis, read 27 November 2026, each model on OpenAI's own API.

| Model and effort | Wait before the first word | Writing speed, tokens a second | Score on hard tasks |
| --- | --- | --- | --- |
| GPT-6.2 Sol, low | 2.2 s | 55 | 41 |
| GPT-6.2 Sol, medium | 4.2 s | 57 | 52 |
| GPT-6.1 Terra, thinking off | 2.5 s | 59 | 30 |
| GPT-6.1 Terra, low | 3.0 s | 58 | 29 |
| GPT-6.1 Terra, medium | 5.9 s | 59 | 38 |
| GPT-6 Luna, thinking off | 1.3 s | 102 | 9 |
| GPT-6 Luna, low | 2.0 s | 105 | 10 |
| GPT-6 Luna, medium | 5.1 s | 116 | 18 |

Sources: [GPT-6.2 Sol](https://artificialanalysis.ai/models/gpt-6-2-sol), [GPT-6.1 Terra](https://artificialanalysis.ai/models/gpt-6-1-terra), [GPT-6 Luna](https://artificialanalysis.ai/models/gpt-6-luna).

- Terra is no faster than Sol on this test and scores lower.
- Luna writes about twice as fast and costs a twentieth as much, but scores far lower. It could suit a trivial job such as sorting a question into a category. It is not a substitute for either of ValueIt's two jobs.
- A second model also adds a second thing to test and keep working. One model with the effort set per request is the simpler design.

### 7. Rate limits

- Limits rise with the total amount of credit bought. $5 reaches the Build tier, $100 Launch, $500 Grow. Source: [rate limits](https://developers.openai.com/api/docs/guides/rate-limits).
- At Build, `gpt-6.2-sol` allows 5,000 requests and 1,000,000 tokens a minute. The model page lists no limits below Build. Source: [GPT-6.2 Sol](https://developers.openai.com/api/docs/models/gpt-6.2-sol).
- That is far more than an invite-only group of Students will use.
- Fast shares the standard limit. Ultrafast has a separate limit, unpublished for GPT-6.2 Sol. Sources: [Fast mode](https://developers.openai.com/api/docs/guides/fast-mode), [Ultrafast mode](https://developers.openai.com/api/docs/guides/ultrafast-mode).

### 8. What the prototype most needs to measure

Ticket #15 should use a real stuck question from Cost of Capital, with the real instructions and material in the prompt, and time it from the Student's screen.

1. **Seconds until the first visible thing**, at low, medium, high and xhigh. Record three moments separately: the first thinking-summary text, the first word of the answer, the first Widget part drawn on screen.
2. **Seconds until the Widget is complete**, and **how many tokens the Widget is**. The size decides more than the effort does.
3. **The same Widget on standard, Fast and Ultrafast** at the chosen effort. Check the `service_tier` field in the response to confirm which lane served it. Confirm the account has an Ultrafast limit for `gpt-6.2-sol`.
4. **Thinking tokens used at each effort** on ValueIt's own questions, and whether the Widget or answer is any better at high or xhigh. The owner judges.
5. **Each case at least five times, at different hours.** Record the middle result and the worst.
6. **The first call against a later call**, to see the one-off delay for a new structured-output schema and any effect of the cache.
7. **xhigh on Ultrafast with the thinking summary shown**, once, so the owner can feel option B before ruling it out.

## Open questions and what could not be confirmed

- **OpenAI publishes no response times per effort for GPT-6.2 Sol.** Every timing figure here is independent or an estimate. None was checked against a live call.
- **The estimates assume a writing speed of 60 to 90 tokens a second.** One routing service reported 145 tokens a second once the model starts answering, over its own traffic in the week to 25 November 2026, with the effort settings unknown. If that is closer to the truth, Widgets finish in about half the estimated time. Source: [OrcaRouter](https://www.orcarouter.ai/models/openai/gpt-6.2-sol).
- **Fast and Ultrafast were measured independently at max effort only.** Their effect at low, medium and xhigh is an estimate.
- **One user's report of Ultrafast on GPT-6.2 Sol** gave 126 tokens a second on average and 252 at peak, well below "up to 4.5 times". It was a single task with no comparison run. Source: [OrcaRouter blog](https://www.orcarouter.ai/blog/gpt-6-2-sol-ultrafast-tokens-per-second).
- **Thinking summaries on `gpt-6.2-sol`.** OpenAI's example uses `gpt-6.2-astra`. Support on Sol, the need for organisation verification, and how soon the first summary text arrives were not confirmed.
- **The short opening line.** OpenAI recommends it in general. Whether GPT-6.2 Sol writes one before it thinks was not confirmed.
- **Whether Fast carries a speed guarantee for GPT-6.2 Sol.** OpenAI says Fast "for GPT-6 Astra does not include a latency SLA" and is silent on GPT-6.2 Sol. Source: [Fast mode](https://developers.openai.com/api/docs/guides/fast-mode).
- **Searching Damodaran's material adds time.** The figures here are for one model call with the material already in the prompt. If the Chatbot has to call a search tool first, add the search and a second round of thinking. That belongs to the search ticket (#4).
- **One page of OpenAI's reference is out of date.** The API reference still says Ultrafast is "currently available for `gpt-5.6-sol`." The Ultrafast guide and the pricing page both list GPT-6.2 Sol and are taken as correct.
- **Tavily was not available in this session.** Searches ran on the other three providers.
