# How to search Damodaran's material with pgvector on Neon and Voyage

This recipe updates the [retrieval research](https://github.com/SiddharthMuramkar/valueit/issues/27) for the choices in [Lock the stack](https://github.com/SiddharthMuramkar/valueit/issues/17) and [What the Chatbot does and never does](https://github.com/SiddharthMuramkar/valueit/issues/10). It describes a proposed build. ValueIt's corpus, search quality, ingestion and live response times still need verification.

## What happens during a Lesson

1. The server checks the Student's sign-in and current approval, then reads the current Lesson, idea, and named passage references from its Lesson Plan. Fetch those exact passages from Neon in plan order before sending the teaching request to OpenAI. This lookup uses passage IDs and source revisions. It requires no Voyage call. Validate every reference when publishing the plan. If a required passage is missing or unreadable at runtime, keep the idea in place and give the Student a retry message.
2. For a question beyond those passages, the Chatbot can request an additional search. It supplies a short finance query and chooses Lesson or Topic scope. The app derives the actual Lesson and Topic IDs from the authorized conversation. Matched passages are internal teaching context. Students see the Chatbot's explanation.
3. Offer OpenAI's web tool only on a Student message asking how the concept applies today, including equivalent phrasing. Lesson openings, automatic Widget events and ordinary finance questions have no web tool. Determine eligibility from the Student's intent before offering tools; on ambiguity, ask for clarification. Where an answer uses web information, preserve the provider's citation annotations and display prominent clickable inline source links. [OpenAI web search](https://developers.openai.com/api/docs/guides/tools-web-search)

## Prepare and load material

1. Create a private Neon bucket. Pin each original, including each spreadsheet, under a key containing its SHA-256. Record its original filename, source URL, acquisition date, full digest and immutable object key in a private manifest. Verify the downloaded bytes against the manifest before use. A revised file gets a new entry and key. The Cost of Capital worksheet already has a [reference digest](https://github.com/SiddharthMuramkar/valueit/blob/research/cost-of-capital-spreadsheets/research/cost-of-capital-spreadsheets.md#L45-L52).
2. Run production ingestion inside a deployed Vercel job restricted to the owner. Check owner authorization on the server before enqueueing work. Bind storage and database credentials to the selected environment. Send the job a manifest ID and read originals from the private bucket inside the deployment. Keep the production database, bucket, OpenAI and Voyage secrets in their deployed runtime. A local `vercel env run` cannot retrieve Vercel Secret values. Local testing can use fixtures and mocks. A preview can use its own credentials, test data and target branch. [Vercel Secret behavior](https://vercel.com/changelog/environment-variables-now-use-config-and-secret-types) · [CLI implementation](https://github.com/vercel/vercel/blob/main/packages/cli/src/commands/env/run.ts#L168-L214)
3. Prepare one candidate passage per slide or worked test question. Extract the slide text and, where a visual contributes teaching content, send the page to a supported OpenAI vision model to describe its axes, units, values and conclusion. Verify those descriptions against the original before publishing. Keep the prepared records private. The initial corpus, lecture and spreadsheet extraction rules, and who reviews prepared text belong to [How Damodaran's material becomes something the Chatbot can search](https://github.com/SiddharthMuramkar/valueit/issues/21).
4. Enable the extension with a migration containing `CREATE EXTENSION IF NOT EXISTS vector`. Give each passage a stable reference comprising source revision, kind and position; store the exact text, text hash, source locator, labels, document model and vector. Store Lesson and Topic memberships separately or as explicit links so changing a label does not re-embed text. A Lesson Plan pins the revision and the passage. Optional similarity search reads only published, active material.
5. Validate a complete staged revision before activating it. Validate expected item count, source digests, references and vectors. Deduplicate embedding work by text hash, model and dimensions. Apply membership changes even when text is unchanged. Publish in one database transaction per source, checking that the active revision still matches the job's expected predecessor. Retrying the same prepared revision has no effect; a conflicting revision needs a fresh comparison. Preserve older revisions referenced by Lesson Plans. A partial load or failed API call must leave the previous revision readable.

## Embed and search

Use an Atlas model API key on its matching endpoint. For an unscoped Atlas key, send `POST https://ai.mongodb.com/v1/embeddings` with bearer authentication. The self-serve trial allows three requests and 10,000 tokens per minute before a payment method is added. Configure the organization’s training opt-out before submitting real course content or Student-derived queries. It requires a valid payment method. Verify the setting with the owner; this research has made no account change. An opt-out covers training use. Verify retention separately if a retention guarantee is required. [Atlas API overview](https://www.mongodb.com/docs/voyageai/api-reference/overview/) · [Atlas organization settings](https://www.mongodb.com/docs/atlas/tutorial/manage-organization-settings/#manage-data-collection-for-voyage-ai-model-training)

Use separate document and query model settings, initially both `voyage-4-large`, at 1,024 dimensions. Use `input_type: "document"` when embedding the prepared passages and `"query"` when embedding a short model-written finance query. A query can reflect a Student's words. Send only the query text to Voyage; keep identifiers, conversations and source files out of query requests. Ingestion separately sends prepared passage text. OpenAI receives the teaching context required for its response. Neon remains the canonical conversation store. OpenAI's `store: false` governs Responses application state; provider data controls and retention have their own terms. [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data)

Validate the response count, indices, dimensions and finite coordinates before accepting a batch. Start with exact cosine distance in Postgres. Filter by active revision, compatible stored document model, authorized Topic and, for Lesson scope, Lesson membership. Order by distance and stable passage ID to break ties and return up to six. There is no approximate vector index at this size. Matching dimensions and a **documented compatible embedding space** permit switching the query encoder within the Voyage 4 family without rewriting existing passages. Evaluate the change on representative questions. For incompatible spaces or dimensions, stage new vectors for every active passage and swap the active configuration after verification. [MongoDB migration guide](https://www.mongodb.com/docs/voyageai/tutorials/migrate-embedding-model/) · [pgvector](https://github.com/pgvector/pgvector#querying)

## Route example

The following JavaScript illustrates the control flow for a teaching turn. `input` already includes the authorized conversation context and exact Lesson Plan passages. `create` wraps the Responses SDK with the job's configured model and reasoning effort, a request deadline and the teaching instructions. `search` binds the approved Lesson and Topic on the server, returns an array, and enforces a shorter deadline for the Voyage and Postgres calls. The example permits three optional material calls per turn and at most four model passes. A retry starts from the last complete turn in Neon.

```js
const materialTool = {
  type: "function",
  name: "search_material",
  description: "Look up additional course passages relevant to a finance concept.",
  strict: true,
  parameters: {
    type: "object",
    properties: {
      query: { type: "string" },
      scope: { type: "string", enum: ["lesson", "topic"] },
    },
    required: ["query", "scope"],
    additionalProperties: false,
  },
};

async function runTeachingTurn({ input, webEligible, create, search }) {
  const history = [...input];
  const tools = webEligible ? [materialTool, { type: "web_search" }] : [materialTool];
  let remaining = 3;
  for (;;) {
    let response;
    try {
      response = await create({
        input: [...history], store: false, include: ["reasoning.encrypted_content"],
        tools, tool_choice: remaining ? "auto" : "none",
      });
    } catch {
      return { status: "retry" };
    }
    if (response.status !== "completed") return { status: "retry" };
    const calls = response.output.filter(item => item.type === "function_call");
    if (!calls.length) {
      const content = response.output.filter(item => item.type === "message")
        .flatMap(message => message.content);
      const refusal = content.find(item => item.type === "refusal");
      if (refusal) return { status: "refused", message: refusal.refusal };
      if (!content.some(item => item.type === "output_text" && item.text.trim())) {
        return { status: "retry" };
      }
      return { status: "answered", content }; // preserves text and URL annotations
    }
    if (!remaining) return { status: "retry" };
    history.push(...response.output); // preserve all items in order, including encrypted reasoning
    for (const call of calls) {
      let result = { status: "limit" };
      if (remaining > 0) {
        remaining--;
        result = { status: "invalid" };
        try {
          const args = JSON.parse(call.arguments);
          if (call.name === "search_material" && typeof args?.query === "string"
              && args.query.trim() && ["lesson", "topic"].includes(args.scope)) {
            result = { status: "unavailable" };
            const passages = await search(args.query.trim(), args.scope);
            result = passages.length ? { status: "found", passages } : { status: "empty" };
          }
        } catch {
          // Malformed arguments stay invalid; a failed optional lookup stays unavailable.
        }
      }
      history.push({ type: "function_call_output", call_id: call.call_id,
        output: JSON.stringify(result) });
    }
  }
}
```

Instruct the Chatbot to continue teaching from the plan when optional search returns empty, unavailable or over budget. It must not claim a match in those states. Present a refusal as such. Offer retry for an incomplete or failed reply and persist only the confirmed Student-facing result, including its web annotations. Record operation status and timing without passage text or Student queries. Apply the same rules to streaming: assemble complete output items before continuing a tool round, and commit the turn only after a terminal result. The Responses API accepts encrypted reasoning in stateless continuations. [OpenAI reasoning guide](https://developers.openai.com/api/docs/guides/reasoning)

## Offline verification of the route example

The audit extracted the JavaScript above and executed it with mock Responses, Voyage and database results. Eleven scenarios passed: ordinary opening, eligible web turn with citations, optional lookup unavailable, empty lookup, invalid arguments, a batch exceeding the budget, another tool call on the final pass, empty model output, refusal, transport failure and an incomplete response. The checks included stateless reasoning replay and the three-call cap. Live provider integration, retrieval quality and visit duration still need measurements.

## Checks for implementation

- Fetch two pinned passages in plan order with Voyage unavailable; a deleted required reference must fail plan validation. Verify a new source revision cannot change an old plan.
- Re-run and interrupt a load. Confirm duplicate requests, competing revisions and metadata-only relabelling leave the correct active rows, and a failed load preserves the last published revision.
- Exercise an ordinary Lesson opening, a Student's present-day application question, an optional lookup with zero matches, a Voyage timeout, a refusal, repeated search calls and a tool-only response at the call limit. Verify student-visible citations on an actual web answer. This document's control-flow examples can be simulated offline; service behavior requires integration checks.
- Label about twenty representative Lesson and Topic questions with expected passages, including chart-heavy slides. Measure recall in the first six results, scope leakage and latency on the intended deployment. Exact nearest neighbors describes the database calculation. It does not establish teaching relevance.
- Compare the costs of the content load and search with actual usage. Published model rates and estimated passage counts are planning inputs.

---

## Evidence

The original investigation recorded the sources and versions below on 2026-11-28. The revised recipe above cites the service behavior checked again in the audit.

### 1. Voyage today

**Who owns and runs it**

- "Voyage AI is a MongoDB company." Voyage models are available "through the standalone Voyage APIs you can access via the MongoDB platform, which do not require a MongoDB database", and the results "can be stored in any database you choose". [Voyage FAQ](https://docs.voyageai.com/docs/faq) (updated 2026-11-19; read 2026-11-28)
- MongoDB's "Embedding and Reranking API" serves Voyage's models from Atlas. It "is database-agnostic, meaning it can be integrated into any tech stack or database". It became generally available on 2026-08-13. [MongoDB: Now GA](https://www.mongodb.com/products/updates/now-ga-embedding-and-reranking-api-on-mongodb-atlas) (read 2026-11-28)

**Where a key is made: two doors**

- Voyage's own door: sign in to Voyage's dashboard and click "Create new secret key". [Voyage: API key](https://docs.voyageai.com/docs/api-key-and-installation) (updated 2026-11-05; read 2026-11-28). Voyage's home page still has a "Get Started" button to that dashboard. [voyageai.com](https://www.voyageai.com/) (read 2026-11-28)
- The Atlas door: in Atlas, "AI Model APIs", "Create model API key". "It is named model API key to distinguish it from other API keys in Atlas." [MongoDB: Manage model API keys](https://www.mongodb.com/docs/voyageai/management/api-keys) (read 2026-11-28)
- The two are not interchangeable: "If you create a model API key through Atlas ... the key authenticates requests to the `ai.mongodb.com` endpoints. Conversely, if you create a key through VoyageAI directly, the key authenticates requests to `api.voyageai.com/v1/embeddings`." Same page (read 2026-11-28)
- MongoDB calls Voyage's own door "the legacy Voyage AI platform at `api.voyageai.com`" and says its model support policy "does not apply" to it. [MongoDB: model lifecycle](https://www.mongodb.com/docs/voyageai/models/lifecycle) (read 2026-11-28)
- MongoDB publishes a guide for moving from the old door to the new one: new key, new address, same request. It gives no date by which the old door closes. [MongoDB: Migrate to Atlas](https://www.mongodb.com/docs/voyageai/tutorials/migrate-to-atlas) (read 2026-11-28)
- A key can be tied to one geography (Europe or United States), with its own address, a 10% surcharge and a paid tier. An untied key uses `ai.mongodb.com`. ValueIt does not need this. [MongoDB: API overview](https://www.mongodb.com/docs/voyageai/api-reference/overview) (read 2026-11-28)

**Models and which fits**

- Current text models: `voyage-4-large` ("the best general-purpose and multilingual retrieval quality"), `voyage-4`, `voyage-4-lite` ("optimized for latency and cost"), and `voyage-code-4` for code. Each reads up to 32,000 tokens per text. [Voyage: Text embeddings](https://docs.voyageai.com/docs/embeddings) (updated 2026-08-10; read 2026-11-28)
- Sizes on offer: "1024 (default), 256, 512, 2048", set with `output_dimension`. Same page (read 2026-11-28)
- "All embeddings created with the 4 series are compatible with each other." Rows embedded with `voyage-4-large` can be searched with questions embedded by `voyage-4` or `voyage-4-lite`. [Voyage 4 announcement](https://blog.voyageai.com/2026/01/15/voyage-4/) (2026-01-15; read 2026-11-28)
- The finance model is not the pick. Voyage's own advice: "please note that the `voyage-4` series outperforms our domain-specific models." [Voyage FAQ](https://docs.voyageai.com/docs/faq) (read 2026-11-28). On the Atlas door `voyage-finance-2` has been "Legacy" since 2026-01-15, with deprecation on 2027-06-01 and retirement on 2027-12-01, replaced by `voyage-4`. [MongoDB: model lifecycle](https://www.mongodb.com/docs/voyageai/models/lifecycle) (read 2026-11-28)
- `voyage-4`, `voyage-4-lite` and `voyage-4-large` are "Active" since 2026-01-15 with no deprecation or retirement date. Same page (read 2026-11-28)
- Voyage's own comparison: `voyage-4-large` beats OpenAI's large embedding model by 14.05% on average across 29 test sets. [Voyage 4 announcement](https://blog.voyageai.com/2026/01/15/voyage-4/) (read 2026-11-28). One independent test on about 10,000 technical documents found a smaller gap, 0.89 against 0.86 on its recall measure. [Techsy, 2026-07-13](https://techsy.io/en/blog/voyage-vs-openai-vs-cohere-embeddings) (read 2026-11-28). Neither test is on finance teaching material.

**The "document" and "query" setting**

- `input_type` is `null`, `query` or `document`. With `query` Voyage puts "Represent the query for retrieving supporting documents: " in front of the text; with `document`, "Represent the document for retrieval: ". [Voyage: Embeddings API](https://docs.voyageai.com/reference/embeddings-api) (read 2026-11-28)
- For search, "Do not omit `input_type`". Lists made with and without it "are compatible", so a mistake degrades results without breaking anything. [Voyage FAQ](https://docs.voyageai.com/docs/faq) (read 2026-11-28)
- Voyage's lists have length 1, so "Cosine similarity is equivalent to dot-product similarity" and either gives the same ranking. Same page (read 2026-11-28)

**Price and free allowance**

- `voyage-4-large` $0.12, `voyage-4` $0.06, `voyage-4-lite` $0.02 per million tokens. "The first 200 million tokens ... are free for every account", for each of these models. [Voyage pricing](https://docs.voyageai.com/docs/pricing) (updated 2026-11-25; read 2026-11-28). The same prices and allowance on the Atlas door, "billed to the Atlas account linked to the API key". [MongoDB: Billing](https://www.mongodb.com/docs/voyageai/management/billing) (read 2026-11-28)
- A token is about 5 characters on average with Voyage's tokenizer. [Voyage: Tokenization](https://docs.voyageai.com/docs/tokenization) (read 2026-11-28). So a deck of 8,000 to 12,600 characters is about 1,600 to 2,500 tokens, and 140 decks about 280,000 tokens. With tests and accounts of charts, under a million. (Arithmetic done here.)

**Rate limits on a new account**

- "Free trial rate limits without a payment method are 3 RPM and 10K TPM. To qualify for higher rate limits, add a payment method to your account." [MongoDB: API overview](https://www.mongodb.com/docs/voyageai/api-reference/overview) (read 2026-11-28)
- With a card ("usage tier 1"): `voyage-4-large` 3,000,000 tokens and 2,000 requests a minute. [MongoDB: Rate limits](https://www.mongodb.com/docs/voyageai/management/rate-limits) (read 2026-11-28). Voyage's own door has the same table, and "Even with a payment method entered, the free tokens ... will still apply." [Voyage: Rate limits](https://docs.voyageai.com/docs/rate-limits) (read 2026-11-28). That page no longer prints the no-card figure for the older door; an error message quoted by a developer in 2025 gave the same 3 requests and 10,000 tokens a minute. [gpt-researcher issue 1148](https://github.com/assafelovic/gpt-researcher/issues/1148) (read 2026-11-28, from a search excerpt)
- "To confirm your credit card information, Atlas charges $1.00 when you first connect a credit card ... it refunds the $1.00 charge." [MongoDB: Billing](https://www.mongodb.com/docs/voyageai/management/billing) (read 2026-11-28)
- One request may carry at most 1,000 texts, and at most 120,000 tokens in total for `voyage-4-large`. [Voyage: Embeddings API](https://docs.voyageai.com/reference/embeddings-api) (read 2026-11-28)

**What happens to what is sent**

- Voyage's own door: "Unless you 'opt out' ... you grant Voyage AI ... a worldwide, irrevocable, perpetual ... license to use ... the Customer Content ... to train, improve, and otherwise further develop the Service". Opting out needs "a payment method on file", applies only to later content, and "any credits or tokens for free usage of the Service may be automatically void". [Voyage Terms of Service](https://www.voyageai.com/tos) (updated 2026-10-29; read 2026-11-28)
- The Atlas door: "you can opt out from your prompts and generations being used to train Voyage models in your dashboard settings. You must have a valid payment method on file". The switch is "Help Improve Voyage AI Models" under Organization Settings. [MongoDB: Organization settings](https://www.mongodb.com/docs/atlas/tutorial/manage-organization-settings/) (read 2026-11-28)

**Vercel Marketplace**

- No Voyage listing was found in the Vercel Marketplace. MongoDB Atlas is listed as a database product: it creates an Atlas account billed through Vercel and "automatically configures" one variable, `MONGODB_URI`. [Vercel Marketplace: MongoDB Atlas](https://vercel.com/marketplace/mongodbatlas) (read 2026-11-28)
- MongoDB says billing through that integration "includes a collective bill for all MongoDB Atlas clusters and services in the Organization". It does not name the model API, and the integration installs a database ValueIt does not need. [MongoDB: Integrate with Vercel](https://www.mongodb.com/docs/atlas/reference/partner-integrations/vercel) (read 2026-11-28)
- Vercel's AI Gateway lists Voyage's models at the same prices, and its page says to "Add your Voyage AI by MongoDB API key in AI Gateway settings". That would route the calls through Vercel's gateway, which the stack has kept out, and by that sentence still needs a Voyage key. [Vercel AI Gateway: Voyage 4](https://vercel.com/ai-gateway/models/voyage-4) (read 2026-11-28)
- So: the key is pasted into Vercel by hand.

**The official TypeScript route**

- Two official routes: plain HTTP ("You can interact with the API through HTTP requests from any language") and the `voyageai` package on npm. [Voyage: API key](https://docs.voyageai.com/docs/api-key-and-installation), [MongoDB: Accessing Voyage AI models](https://www.mongodb.com/docs/voyageai/api-and-clients) (read 2026-11-28)
- The request: `POST /v1/embeddings` with `input`, `model`, `input_type`, `output_dimension`, `truncation`; the answer has `data[].embedding`, `data[].index` and `usage.total_tokens`. [Voyage: Embeddings API](https://docs.voyageai.com/reference/embeddings-api) (read 2026-11-28)
- The package is at 0.6.0, published 2026-11-09, MIT licence. [npm: voyageai](https://www.npmjs.com/package/voyageai) (read 2026-11-28). It retries on 408, 429 and 5xx, twice by default. [voyage-ai/typescript-sdk README](https://github.com/voyage-ai/typescript-sdk) (read 2026-11-28)
- A trap: "Unlike the Python client, the TypeScript client sends requests to the Voyage platform endpoint (`https://api.voyageai.com/v1`) by default. To use the Embedding and Reranking API with your model API key, set the `environment` option to `https://ai.mongodb.com/v1`". [MongoDB: Accessing Voyage AI models](https://www.mongodb.com/docs/voyageai/api-and-clients) (read 2026-11-28)
- Opinion: one `fetch` call in one file is the simpler choice here. It is a single request, the address is in plain sight, and there is no pre-1.0 package to keep up with.

**Picture-reading model, re-rankers, deck-aware model**

- `voyage-multimodal-3.5` embeds "interleaved text and visual data, such as screenshots of PDFs, slides, tables, figures". Priced at $0.12 per million text tokens plus $0.60 per billion pixels, with 200 million tokens and 150 billion pixels free. [Voyage: Multimodal embeddings](https://docs.voyageai.com/docs/multimodal-embeddings), [Voyage pricing](https://docs.voyageai.com/docs/pricing) (read 2026-11-28)
- Voyage names four models as sharing one space: `voyage-4-large`, `voyage-4`, `voyage-4-lite`, `voyage-4-nano`. The multimodal model is not among them. [Voyage 4 announcement](https://blog.voyageai.com/2026/01/15/voyage-4/) (read 2026-11-28). Reasoning from that: slides embedded as pictures would need their own column and their own question embeddings, and a matched picture gives the Chatbot no text to read unless the picture is then sent to it as well. A written account of the chart serves both the search and the reading.
- Re-rankers (`rerank-3`, `rerank-3-lite`) take a question and a shortlist and re-order it; "it is a common practice to apply a reranker on the top candidates". [Voyage: Rerankers](https://docs.voyageai.com/docs/reranker) (read 2026-11-28). Opinion: with six short passages handed to a model that reasons at xhigh effort, the model is the re-ranker. A re-ranker adds a second call to Voyage on every search.
- With `voyage-context-4`, "each chunk embedding encodes not only the chunk's own content but also the contextual information from the full document", and Voyage calls it "our strongest embedding model to date". It has its own endpoint, and questions must be embedded with it too. [Voyage: Contextualized chunk embeddings](https://docs.voyageai.com/docs/contextualized-chunk-embeddings), [voyage-context-4 announcement](https://blog.voyageai.com/2026/06/29/voyage-context-4) (2026-06-29; read 2026-11-28). A slide deck is the kind of document it is made for. It is left as the first thing to try if results disappoint, because the plain model with a heading on each passage is simpler.

### 2. pgvector on Neon today

- Switched on with `CREATE EXTENSION IF NOT EXISTS vector;`. "pgvector is available on every Neon plan with no add-on or paid tier required. The extension is installed per database, not per project". [Neon: pgvector](https://neon.com/docs/extensions/pgvector) (updated 2026-11-18; read 2026-11-28)
- Neon ships pgvector 0.8.7 on Postgres 14 to 19. [Neon: Postgres extensions](https://neon.com/docs/extensions/pg-extensions) (updated 2026-11-21; read 2026-11-28)
- The `vector` type holds up to 16,000 numbers, each row taking "4 * dimensions + 8 bytes". [pgvector README](https://github.com/pgvector/pgvector) (read 2026-11-28). At 1,024 numbers that is about 4 KB a row, so about 10 MB for 2,500 rows. (Arithmetic done here.)
- Indexes have a tighter limit: HNSW covers `vector` "up to 2,000 dimensions". [Neon: pgvector](https://neon.com/docs/extensions/pgvector) (read 2026-11-28). 1,024 is inside it, so an index can be added later without changing the column.
- "By default, pgvector performs exact nearest neighbor search, which provides perfect recall. You can add an index to use approximate nearest neighbor search, which trades some recall for speed." [pgvector README](https://github.com/pgvector/pgvector) (read 2026-11-28)
- Neon's own measurement with no index: 10,000 rows of 960 numbers in about 36 ms, on a 4 CU compute. But "sequential scans start to become costly at 50k rows." Its advice is to go without an index when "your dataset is small and you do not intend to scale it" and when "you need 100% recall". [Neon: Optimize pgvector search](https://neon.com/docs/ai/ai-vector-search-optimization) (updated 2026-11-13; read 2026-11-28)
- Filters and indexes pull against each other: "With approximate indexes, filtering is applied after the index is scanned. If a condition matches 10% of rows, with HNSW and the default `hnsw.ef_search` of 40, only 4 rows will match on average." The remedy since 0.8.0 is iterative scans. Without an index the filter is simply applied first and the answer is exact. [pgvector README, Filtering](https://github.com/pgvector/pgvector#filtering) (read 2026-11-28)
- Keyword search can be combined: "Use together with Postgres full-text search for hybrid search", merged by reciprocal rank fusion. [pgvector README, Hybrid search](https://github.com/pgvector/pgvector#hybrid-search) (read 2026-11-28). Neon also ships its own keyword engine, `lakebase_text`, at version 0.1.3. [Neon: Lakebase Search](https://neon.com/docs/ai/lakebase-search) (updated 2026-11-18; read 2026-11-28). Opinion: not needed for a few thousand short passages read by a strong model; Postgres's built-in kind would be the one to add, since it needs no extension.
- Drizzle: `vector('embedding', { dimensions: N })` declares the column, and `cosineDistance(column, numbers)` writes `column <=> '[...]'`. "As for now, Drizzle doesn't create extension automatically, so you need to create it manually", through `drizzle-kit generate --custom`. [Drizzle: Vector similarity search](https://orm.drizzle.team/docs/guides/vector-similarity-search), [Drizzle: PostgreSQL extensions](https://orm.drizzle.team/docs/extensions) (read 2026-11-28)
- An open Drizzle bug, reported 2026-05-21: `drizzle-kit push` writes an HNSW index without its operator class, which Postgres rejects. One more reason to have no vector index and to use `generate` and `migrate`. [drizzle-orm issue 5792](https://github.com/drizzle-team/drizzle-orm/issues/5792) (read 2026-11-28)
- Sleep: a compute is suspended after 5 minutes without queries. "Activation generally takes a few hundred milliseconds", and "Postgres memory buffers are cold after a compute wakes up ... initial queries may take longer". Session settings are lost on suspend. [Neon: Compute lifecycle](https://neon.com/docs/introduction/compute-lifecycle) (updated 2026-09-16; read 2026-11-28). With no index there is nothing to rebuild and no session setting to keep.
- Branches: "A branch is a copy-on-write clone of your data." [Neon: Branching](https://neon.com/docs/introduction/branching) (read 2026-11-28). So a preview copy has the extension, the table and the rows as they stood when it was made.
- With Neon's own integration (the kind ValueIt uses), each preview gets "a new `preview/<git-branch>` branch per deployment, parented from the project default branch", "even when Production uses a different branch". [Neon: Neon-managed Vercel integration](https://neon.com/docs/guides/neon-managed-vercel-integration) (updated 2026-11-18; read 2026-11-28)
- A branch can be refreshed with "the latest schema and data from its parent". [Neon: Manage branches](https://neon.com/docs/manage/branches) (updated 2026-11-24; read 2026-11-28), [Neon: Reset from parent](https://neon.com/docs/guides/reset-from-parent) (read 2026-11-28)

### 3. How the Chatbot calls the search

- A function tool is declared with `type: "function"`, `name`, `description`, `parameters` and `strict`. "We recommend always enabling strict mode", which needs `additionalProperties: false` and every field listed as required. [OpenAI: Function calling](https://developers.openai.com/api/docs/guides/function-calling) (read 2026-11-28)
- The flow has five steps: request with tools, receive a tool call, run the code "on the application side", "make a second request to the model with the tool output", receive the answer "(or more tool calls)". Same page (read 2026-11-28)
- "For reasoning models ... any reasoning items returned in model responses with tool calls must also be passed back with tool call outputs." Same page (read 2026-11-28). For stateful requests, `previous_response_id` is also supported. The recipe above replays the items because it uses stateless requests. [OpenAI: WebSocket mode example](https://developers.openai.com/api/docs/guides/websocket-mode) (read 2026-11-28)
- Function tools and built-in tools share one request: "functions can be called in parallel when built-in tools are also available. Built-in tools cannot be included in a parallel function-call batch." [OpenAI: Function calling](https://developers.openai.com/api/docs/guides/function-calling) (read 2026-11-28). The `tools` list: "Supports built-in tools, MCP tools, and function calls (custom tools)." [OpenAI: Responses API reference](https://developers.openai.com/api/reference/resources/responses/methods/create) (read 2026-11-28)
- "Based on the provided prompt, the model automatically decides whether to use a configured tool." [OpenAI: Using tools](https://developers.openai.com/api/docs/guides/tools) (read 2026-11-28). "Use the system prompt to describe when (and when not) to use each function." [OpenAI: Function calling](https://developers.openai.com/api/docs/guides/function-calling) (read 2026-11-28)
- A look can be forced: with `tool_choice: {"type": "function", "name": "..."}` the model must "Call exactly one specific function". Same page (read 2026-11-28)
- `max_tool_calls` caps "calls to built-in tools" only. It does not cap ValueIt's function, so the app caps its own loop. [OpenAI: Responses API reference](https://developers.openai.com/api/reference/resources/responses/methods/create) (read 2026-11-28)
- Web search at xhigh is documented: OpenAI's web search guide shows `reasoning: { effort: "xhigh" }` with the `web_search` tool. [OpenAI: Web search](https://developers.openai.com/api/docs/guides/tools-web-search) (read 2026-11-28, from a search excerpt)
- How the two sit together, reasoned from the above: web search runs inside OpenAI during a response. A call to ValueIt's function ends the response and waits for the app. A turn with one material-tool round requires a follow-up request; further rounds require additional calls.

**Time one search adds (estimate)**

| Part | Time | Basis |
|---|---|---|
| Voyage turns the question into numbers | About 0.2 to 0.5 s. Now and then 1 to 2 s | Voyage publishes no figure. OpenRouter's record of a week of real calls to `voyage-4-lite`: half under 0.19 s, 95% under 0.80 s, 99% under 2.06 s. [OpenRouter](https://openrouter.ai/voyageai/voyage-4-lite) (read 2026-11-28). One developer's 20 calls from Japan: about 0.21 s. [yk-lab, 2026-04-18](https://yk-lab.net/archives/cloudflare-workers-ai-vs-voyage-ai-embedding-speed-benchmark) (read 2026-11-28). `voyage-4-large` itself was not found measured. |
| The database finds the closest rows | About 5 to 40 ms when awake | Neon's 36 ms for 10,000 rows on a larger compute, [Neon: Optimize pgvector search](https://neon.com/docs/ai/ai-vector-search-optimization) (read 2026-11-28); ValueIt has a quarter of that at most and filters first |
| If the database was asleep | A few hundred ms more | [Neon: Compute lifecycle](https://neon.com/docs/introduction/compute-lifecycle) (read 2026-11-28) |
| **One search** | **About 0.3 to 0.6 s** | Sum of the above |
| One more round of thinking (function route only) | Not measured. Seconds at medium effort, possibly tens of seconds at xhigh | The speed research measured 23 to 52 s of thinking before the first word at xhigh. [gpt-sol-speed.md](https://github.com/SiddharthMuramkar/valueit/blob/research/gpt-sol-speed/research/gpt-sol-speed.md) (read 2026-11-28) |

Two cautions. An older report on Voyage's forum describes 3 to 5 seconds per call on an earlier model. [Voyage discussion](http://docs.voyageai.com/discuss/67eeb8a17a3b0e0037a98d60) (read 2026-11-28). A competitor claims Voyage slows badly under load; it sells a rival model. [ZeroEntropy, 2026-03-05](https://zeroentropy.dev/articles/zembed-1-overperforms-voyage-4) (read 2026-11-28). Hence the 10-second time-out and the quiet failure.

### 4. The loading path

- **Text per slide.** `unpdf` is a library "optimized for serverless environments" that bundles Mozilla's PDF.js. `extractText(data)` returns `{ totalPages, text }` with "one string per page" unless `mergePages` is set. Version 2.2.3, published 2026-11-26, MIT licence. [unpdf](https://github.com/unjs/unpdf), [npm: unpdf](https://www.npmjs.com/package/unpdf) (read 2026-11-28)
- Alternatives looked at: `pdfjs-dist` 6.5.438 (the same engine without the wrapper, Apache-2.0) and `mupdf` 1.28.6 (also renders pages, but its licence is AGPL-3.0, a poor fit). [npm: pdfjs-dist](https://www.npmjs.com/package/pdfjs-dist), [npm: mupdf](https://www.npmjs.com/package/mupdf) (read 2026-11-28)
- **Chart slides, without drawing pages ourselves.** OpenAI accepts a PDF as an `input_file` (by upload, by link or as Base64). "PDF parsing includes both extracted text and page images in context." `detail: "high"` is "for more visual detail, such as dense charts, small print, or diagrams". Each file "must be under 50 MB". It needs "a model that accepts image inputs", which must be verified for the selected deployed model. [OpenAI: File inputs](https://developers.openai.com/api/docs/guides/file-inputs) (read 2026-11-28)
- The output schema constrains the shape. Verify page count and order against the extracted source before accepting descriptions. Use `text.format` of type `json_schema`. [OpenAI: Responses API reference](https://developers.openai.com/api/reference/resources/responses/methods/create) (read 2026-11-28)
- OpenAI's own cookbook for slide decks does the same thing in spirit: describe each page with a vision model, cut "by page", and put "the slide title, deck title" at the top of each piece. Quoted in the earlier research. [material-search.md](https://github.com/SiddharthMuramkar/valueit/blob/research/material-search/research/material-search.md) (read 2026-11-28)
- If a page ever has to be drawn as a picture in Node, `unpdf`'s `renderPageAsImage` needs the extra package `@napi-rs/canvas`. Not needed for the recipe. [unpdf](https://github.com/unjs/unpdf) (read 2026-11-28)
- **Passage size.** A deck is 8,000 to 12,600 characters over about a dozen slides, so a slide is roughly 700 to 1,050 characters, about 150 to 250 tokens. The model's limit is 32,000 tokens per text. One slide is one passage; nothing needs splitting or joining. (Arithmetic done here from the figures in the ticket.)
- **Labels.** A Lesson is built on "one Session, part of a dense one, two short ones joined, or matching parts of two". [GLOSSARY.md](https://github.com/SiddharthMuramkar/valueit/blob/main/GLOSSARY.md) (read 2026-11-28). His Sessions carry labels like "2A" and "Preview". [How the Course breaks into Topics and Lessons](https://github.com/SiddharthMuramkar/valueit/issues/13) (read 2026-11-28). So: the Lesson label belongs to each slide, not to a deck; it can hold more than one Lesson; and the Session label is text, not a number.
- Vercel passes Secret values to its deployments. Its local CLI cannot retrieve a write-only value. The production loader above reads private Neon objects and uses deployment credentials. [Vercel Secret types](https://vercel.com/changelog/environment-variables-now-use-config-and-secret-types) · [Vercel CLI source](https://github.com/vercel/vercel/blob/main/packages/cli/src/commands/env/run.ts#L168-L214)
- Query and document models may differ when they share a documented embedding space and use identical vector dimensions. The migration guide recommends regenerating corpus vectors when migrating models and requires it across incompatible spaces. [MongoDB migration guide](https://www.mongodb.com/docs/voyageai/tutorials/migrate-embedding-model/)
- MongoDB's notice periods on the Atlas door, for embedding models: 12 months from Legacy to Deprecated, 6 more to Retired, with "a named replacement model, a migration guide, and embedding model migration credits". A retired model answers with HTTP 410. [MongoDB: model lifecycle](https://www.mongodb.com/docs/voyageai/models/lifecycle) (read 2026-11-28)

### 5. Versions on 2026-11-28

From the public npm registry and Neon's extension list.

| Thing | Version |
|---|---|
| pgvector on Neon | 0.8.7 |
| drizzle-orm / drizzle-kit | 0.45.4 / 0.31.11 |
| openai | 7.65.0 |
| voyageai (not used by the recipe) | 0.6.0 |
| unpdf | 2.2.3 |
| pg | 8.23.1 |

---

## Outstanding evidence

The open questions concern application behavior. Retrieval quality on the actual slides, accuracy of extracted tables and formulas, review of chart descriptions, latency from the deployed region, the teaching model's access to necessary modalities and tools, and the need for approximate indexing after adding lecture transcripts all require verification. Pricing and capacity estimates apply to the documented slide and test subset. Select the production branch and test source permissions in the deployed environment before running the first ingest. No account access, billing change, upload, credential retrieval or live model call was part of this research.

## How this was researched

Library and service documentation came first: Context7 for Voyage, Voyage's TypeScript package, pgvector, Drizzle, OpenAI and unpdf; Neon's documentation tools for pgvector, extensions, branching, sleep and the Vercel integration; Vercel's documentation search for environment variables, Workflows and Blob. Web searches went to Parallel, Octen, Tavily and Firecrawl together, and pages were read through Parallel. Package versions came from the public npm registry, and one README and one issue from GitHub.

The original investigation also used Tavily's command-line client. The audit checked the primary documentation linked in the revised recipe and exercised the example offline. No Neon, Vercel, MongoDB, Voyage or OpenAI account was read or changed.
