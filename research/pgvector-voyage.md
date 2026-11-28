# How to search Damodaran's material with pgvector on Neon and Voyage

Research for [How to search Damodaran's material with pgvector on Neon and Voyage](https://github.com/SiddharthMuramkar/valueit/issues/27). Checked on 2026-11-28 against the vendors' own documentation. Desk research only: no account was made or touched, nothing was installed, no API was called and no money was spent. Every code block is illustrative and has not been run. Every time figure is somebody else's measurement or an estimate made here, and is marked as such.

It builds on three earlier files and does not repeat them: [material-search.md](https://github.com/SiddharthMuramkar/valueit/blob/research/material-search/research/material-search.md), [database-signin-invite.md](https://github.com/SiddharthMuramkar/valueit/blob/research/database-signin-invite/research/database-signin-invite.md) and [app-stack.md](https://github.com/SiddharthMuramkar/valueit/blob/research/app-stack/research/app-stack.md).

## The answer

**It is a small, ordinary build and nothing blocks it: one table in the Neon database ValueIt already has, one new key (Voyage), one small search function the Chatbot can call, and one loading script. At this size no search index is needed.**

How it works, in plain words:

1. **Each slide of his becomes one row** in a table in ValueIt's own database: the slide's text, a short written account of any chart on it, and labels (Topic, Lesson, his Class, his Session, slide number).
2. **Voyage turns each row's text into a list of 1,024 numbers** that stands for its meaning. The list is stored in the row. This happens once, when the material is loaded.
3. **When the Chatbot wants to look something up**, ValueIt sends the question to Voyage, gets the same kind of list back, and asks the database for the rows whose lists are closest, held to the current Lesson or the current Topic.
4. **The Chatbot reads those few slides** and answers in its own words. The Student never sees them.

### What it means for ValueIt

- **One new account, one new key, one hand step.** Voyage belongs to MongoDB. The key is made by the owner and pasted into the Vercel project's settings by hand. There is no Vercel Marketplace install for it.
- **Two doors to the same models.** A key can be made in MongoDB Atlas (MongoDB's main console) or in Voyage's own older dashboard. Each key works only at its own web address. MongoDB now calls Voyage's own platform "legacy" and makes its published promises about model retirement only for the Atlas door. For a new project the Atlas door is the safer one. A key from the older door also works today.
- **A payment card must be on file before real use.** Without one, the account is held to 3 requests a minute, which is 3 searches a minute for all Students together. With one, the limit is 2,000 a minute and the free allowance still applies.
- **It costs next to nothing.** All of his slides and tests for the whole Course are under a million tokens. Voyage gives 200 million free. Paying full price would be about ten cents. The table adds about 10 MB to the database.
- **No index, on purpose.** The whole Course is about 2,000 to 2,500 rows and Accounting 101 is under 200 (estimates from the deck counts). The database can compare the question against every row in a few thousandths of a second (estimate from Neon's own measurement). That is exact, needs no tuning, and makes the Lesson and Topic limits exact too. An index would only make results approximate.
- **Search adds about a third to half a second** (estimate). Next to the 23 to 52 seconds the model thinks at xhigh effort, that is nothing. If the Chatbot decides for itself when to look (recommended), the real cost is one more round of thinking by the model, not the search.
- **Worth knowing: at Lesson level the search is choosing among a dozen or two slides.** A Lesson rests on one Session, part of one, or matching parts of two. Search held to one Lesson will work, but it earns its keep when it is held to a Topic (hundreds of slides) or opened to the Course.
- **Chart slides: describe them in words once, at loading time.** OpenAI's model reads the deck (it sees each page as text and as a picture) and writes what each chart shows. Voyage's picture-reading model was looked at and is not the simpler path: a matched picture gives the Chatbot nothing to read.
- **If Voyage is down, the Chatbot still teaches.** The material is a small part of what it draws on. The search function must fail quietly and return nothing.
- **By default, what is sent to Voyage may be kept and used to train its models.** That includes the search questions. It can be switched off, but only once a card is on file.

**Voyage against OpenAI's own embeddings, in one line:** OpenAI's would do the same job with no new vendor, account or key (`text-embedding-3-small` or `-large`, same OpenAI key); Voyage's own tests put its best model ahead on search quality, and one independent test found a much smaller lead.

### The choices, and the default for each

| Choice | Default | Why |
|---|---|---|
| Voyage model | `voyage-4-large`, for the stored rows and for the questions | Voyage's best general model. Voyage says its 4 series now beats its own finance model, which is on a retirement schedule. |
| Size of each list | 1,024 numbers (the model's default) | Nothing to set, nothing to get wrong. Storage is trivial. |
| Where the key is made | MongoDB Atlas, "AI Model APIs" | The door MongoDB supports going forward. |
| How the code calls Voyage | One plain web request (`fetch`) in one small file | One call. The official code package is still at version 0.6 and points at the older door unless told otherwise. |
| Index on the lists | None | Under about 10,000 rows, comparing against every row is fast and exact. |
| Keyword search as well | Not now | Small body, exact search, and the model reads several results. Add it only if the check questions show misses. |
| Re-ranking step, picture-reading model | Not now | A second call and a second thing to fail, for little gain at this size. |
| How the Chatbot calls it | A function the Chatbot may call when it decides to look. The app, not the Chatbot, turns "this Lesson" or "this Topic" into the real limit | Best quality: the model writes a proper search question and can look twice. Speed is not weighed. |
| One passage | One slide. One test question with its worked answer | His slides are already the right size: about 700 to 1,050 characters each. |
| Where loading runs | A script a coding agent runs, with keys handed over by Vercel at run time | Smallest thing that works for 11 decks. See the caveat about write-only keys below. |

### The recipe

For a coding agent. Read today's docs first (Voyage, pgvector, Drizzle, OpenAI): names in this area change often. All code below is illustrative and has not been run.

**Step 0. The owner's part (about 10 minutes, once).**

1. Make a MongoDB Atlas account. No database is needed. In the console open "AI Model APIs" and create a model API key. Leave cloud and geography on `any`.
2. Add a payment card. This lifts the limit from 3 requests a minute to 2,000. The first 200 million tokens stay free. Atlas makes a $1 test charge and refunds it.
3. Decide whether Voyage may train on what is sent. To refuse: Organization Settings, switch "Help Improve Voyage AI Models" off.
4. Paste the key into the Vercel project's settings as `VOYAGE_API_KEY`, for Production and Preview.

If the key comes from Voyage's own dashboard instead, everything below is the same except the address: `https://api.voyageai.com/v1` in place of `https://ai.mongodb.com/v1`.

**Step 1. One settings file, so the model is named in exactly one place.**

```ts
// lib/material/config.ts  (illustrative, not run)
export const VOYAGE_BASE_URL = "https://ai.mongodb.com/v1"; // must match the door the key came from
export const EMBEDDING_MODEL = "voyage-4-large";
export const EMBEDDING_DIMENSIONS = 1024;
```

**Step 2. Switch pgvector on.** Drizzle does not do this. Create an empty migration with `drizzle-kit generate --custom` and put one line in it. It must run before the table's migration.

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

**Step 3. The table.**

```ts
// db/schema/material.ts  (illustrative, not run)
import { sql } from "drizzle-orm";
import { bigserial, integer, pgTable, text, timestamp, uniqueIndex, vector } from "drizzle-orm/pg-core";

export const materialPassages = pgTable(
  "material_passages",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),

    // ValueIt's labels: what a search is held to. Changing them needs no re-embedding.
    topic: text("topic").notNull(),                                        // "accounting-101"
    lessons: text("lessons").array().notNull().default(sql`'{}'::text[]`), // usually one Lesson, sometimes two

    // His labels: where the passage comes from.
    class: text("class").notNull(),      // "accounting"
    session: text("session").notNull(),  // his own label, as text: "2", "2A", "preview"
    kind: text("kind").notNull(),        // "slide" | "test"
    position: integer("position").notNull(), // slide number, or question number in a test

    title: text("title"),
    content: text("content").notNull(),  // exactly what was embedded and what the Chatbot reads
    contentHash: text("content_hash").notNull(),

    embedding: vector("embedding", { dimensions: 1024 }).notNull(),
    embeddingModel: text("embedding_model").notNull(), // "voyage-4-large"
    loadedAt: timestamp("loaded_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("material_source_key").on(t.class, t.session, t.kind, t.position)],
);
```

No index on `embedding`. The unique key is there so that loading twice updates rows and never doubles them. Use `drizzle-kit generate` and `migrate`, not `push`.

**Step 4. Talking to Voyage.** One function, used by loading and by search.

```ts
// lib/material/voyage.ts  (illustrative, not run)
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL, VOYAGE_BASE_URL } from "./config";

export async function embed(texts: string[], inputType: "document" | "query"): Promise<number[][]> {
  const res = await fetch(`${VOYAGE_BASE_URL}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: texts,                 // at most 1,000 texts and 120,000 tokens per call for this model
      model: EMBEDDING_MODEL,
      input_type: inputType,        // "document" when loading, "query" when searching. Never leave it out.
      output_dimension: EMBEDDING_DIMENSIONS,
      truncation: false,            // fail loudly on an over-long text
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Voyage ${res.status}`);
  const json = await res.json();
  return json.data.sort((a: any, b: any) => a.index - b.index).map((d: any) => d.embedding);
}
```

**Step 5. Loading, in two stages.** The original PDFs and everything made from them stay in the private place, never in this repo.

*Stage A, prepare (slow, done once per deck, its output is worth reading before it is loaded):*

1. Read the deck and take the text of each page: `extractText` from `unpdf` returns one string per page.
2. Send the whole deck to `gpt-6.2-sol` as a PDF file input with `detail: "high"` and ask, as structured output, for one entry per page: the slide's title, and a plain account of any chart, table or diagram (what it shows, its axes or columns, the numbers that matter). An empty account for a page with no visual. Do not ask it to rewrite his text.
3. Write one record per slide: the labels, the title, his text as extracted, and the account of the visual. For a test, one record per question with its worked answer.
4. Build `content` for each record with a heading on top, so a slide carries its context: Class and Session title on the first line, slide title on the second, then his text, then "What the slide shows: ...".
5. Fill `topic` and `lessons` from a small mapping file kept with the Lesson Plans (Lesson to Class, Session and slide range).

*Stage B, load (fast, repeatable):*

1. For records whose `content_hash` or model differs from what is stored, call `embed(texts, "document")` in batches.
2. Insert or update by the unique key. Delete rows whose source no longer exists.
3. Print counts: rows added, changed, unchanged, removed, and tokens used.

Run both with keys handed over at run time and never written to disk: `vercel env run -e <environment> -- pnpm tsx scripts/load-material.ts <folder>`. Load into the database branch the live app reads, and into Neon's default branch if that is a different one, because preview copies are made from the default branch.

A caveat for the owner. Vercel can hand a script only the keys it stores as readable ("Config"). A key stored as write-only ("Secret"), which is Vercel's default for Production and Preview, reaches code running inside Vercel and, as far as the docs show, nothing else. So either the keys this script needs (OpenAI, Voyage, the database address) are also stored as readable in the environment the script reads, or loading moves into a Vercel Workflow. See open question 4.

**Step 6. The search function.**

```ts
// lib/material/search.ts  (illustrative, not run)
import { and, arrayContains, cosineDistance, eq } from "drizzle-orm";
import { db } from "@/db";
import { materialPassages as m } from "@/db/schema/material";
import { EMBEDDING_MODEL } from "./config";
import { embed } from "./voyage";

type Where = { topic: string; lesson?: string }; // set by the app from where the Student is, never by the model

export async function searchMaterial(query: string, where: Where, k = 6) {
  const [vector] = await embed([query], "query");
  const distance = cosineDistance(m.embedding, vector);
  return db
    .select({ class: m.class, session: m.session, kind: m.kind, position: m.position, title: m.title, content: m.content, distance })
    .from(m)
    .where(
      and(
        eq(m.embeddingModel, EMBEDDING_MODEL), // rows from another model are invisible, never wrongly matched
        eq(m.topic, where.topic),
        where.lesson ? arrayContains(m.lessons, [where.lesson]) : undefined,
      ),
    )
    .orderBy(distance) // smallest distance first
    .limit(k);
}
```

Wrap the call so that any failure (Voyage down, time-out, database error) returns an empty list and a log line.

**Step 7. The tool the Chatbot is given, beside web search.**

```ts
// illustrative, not run
const searchMaterialTool = {
  type: "function",
  name: "search_material",
  description:
    "Look up how Aswath Damodaran explains an idea in the slides and tests of his Classes. " +
    "Returns a few short passages. Use them to stay close to his way of explaining. " +
    "Never quote them, name them or mention them to the Student.",
  strict: true,
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "What to look for, as a full question in plain finance words." },
      scope: {
        type: "string",
        enum: ["lesson", "topic"],
        description: "lesson: only this Lesson's material. topic: all Lessons of this Topic.",
      },
    },
    required: ["query", "scope"],
    additionalProperties: false,
  },
} as const;

const tools = [{ type: "web_search" }, searchMaterialTool];

let response = await openai.responses.create({
  model: "gpt-6.2-sol",
  reasoning: { effort: "xhigh" },
  instructions,
  input,
  tools,
});

for (let round = 0; round < 3; round++) {
  const calls = response.output.filter((item) => item.type === "function_call");
  if (calls.length === 0) break;
  const outputs = await Promise.all(
    calls.map(async (call) => {
      const { query, scope } = JSON.parse(call.arguments);
      const passages = await searchMaterial(query, {
        topic: current.topic,
        lesson: scope === "lesson" ? current.lesson : undefined,
      });
      return { type: "function_call_output" as const, call_id: call.call_id, output: JSON.stringify({ passages }) };
    }),
  );
  response = await openai.responses.create({
    model: "gpt-6.2-sol",
    reasoning: { effort: "xhigh" },
    instructions,                         // not carried over by previous_response_id
    previous_response_id: response.id,    // keeps the model's reasoning from the first round
    input: outputs,
    tools,
  });
}
```

The real route streams; the loop is the same. To make the Chatbot look on a given turn, set `tool_choice` to this function for the first request of that turn.

**Step 8. A check that needs no model.** Write about twenty check questions, each with the slide it should fetch. A script runs `searchMaterial` on each and prints the top six. Because the search is exact, the result only changes when the material or the Voyage model changes. Add one check to `pnpm check`: every row's `embedding_model` equals the model named in the settings file.

### Every key and account, and where each lives

| Thing | Made at | Lives in | Set by hand? |
|---|---|---|---|
| MongoDB Atlas account, with a card | MongoDB | The owner signs in | Yes, once. **New.** |
| `VOYAGE_API_KEY` | Atlas, "AI Model APIs" (or Voyage's own dashboard) | Vercel project settings | Yes. **New.** |
| The Voyage address | Fixed by which door the key came from | One line in the code | No secret |
| `OPENAI_API_KEY` | OpenAI | Vercel project settings | Already there |
| `DATABASE_URL` and its relatives | Neon's integration | Vercel project settings | No |
| The table, its labels and the search function | ValueIt | The Neon database and this repo | No key |

Nothing new is stored in Neon's or OpenAI's settings. Voyage needs no setting inside Neon: the two never talk to each other. ValueIt's code sits between them.

### Who keeps what working

| Part | Whose it is |
|---|---|
| Turning text into lists of numbers; the model itself; its speed and uptime | Voyage (MongoDB) |
| The database, the pgvector extension, waking from sleep, preview copies | Neon |
| The Chatbot's decision to look, and what it does with what it reads | OpenAI's model, steered by ValueIt's instructions |
| The table and its labels; the search function; the rule for when search fails; the loading script; the written accounts of charts; the list of check questions | **ValueIt.** Written by coding agents, checked by `pnpm check` and the check questions |

This is more to own than OpenAI's hosted file search would have been. What is bought with that: exact limits by Lesson and Topic, every row open to inspection, results that do not shift under ValueIt, and checks that can run without a model.

### Costs

| | One-off | Each month |
|---|---|---|
| Voyage, loading the whole Course (under 1 million tokens) | $0 inside the free 200 million. About $0.12 at full price | |
| Voyage, 10,000 searches (about 20 tokens each) | | $0 inside the free allowance. About $0.02 at full price |
| OpenAI, writing accounts of chart slides (rough estimate, nothing measured) | About $1 for Accounting 101, about $10 to $20 for 140 decks | |
| OpenAI, reading six passages per search (about 2,000 tokens) | | About $0.004 a search |
| Neon, about 10 MB more storage | | Under one cent |

### Risks, honestly

1. **A second AI vendor.** One more account, card, set of terms and thing that can be down. The search must fail quietly.
2. **A model that can be retired.** `voyage-4-large` is current with no end date. MongoDB promises at least 18 months from "superseded" to "switched off" for embedding models, on the Atlas door only. When it happens, every row is re-embedded: about a minute of machine time and a few cents. Nothing else changes.
3. **The 3-requests-a-minute trap.** A new account without a card will look broken as soon as two people use it.
4. **Two doors, two addresses.** A key sent to the wrong address is refused. A coding agent working from memory will use the older address and older model names.
5. **Students' words reach Voyage.** With the function route it is the Chatbot's search question, not the Student's raw message, but it can carry the same content. Switch training use off if that matters.
6. **Mixed lists go wrong silently.** Lists from two different models have the same shape and compare without any error, giving nonsense. Hence the `embedding_model` column, the filter in the search and the check.
7. **A wrong account of a chart misleads the Chatbot.** Nobody sees it, but the Chatbot leans on it. Someone or something must read the prepared records before loading.
8. **Preview copies go stale.** A preview's database copy holds the material as it was when the copy was made.
9. **The Chatbot may simply not look.** A strong model often answers from what it knows. If the "little predictability" matters on a given turn, force the look.

### What would change this recipe

- **More than about 10,000 rows**, for example if long lecture transcripts for all Classes are added in small pieces: add an HNSW index and turn on pgvector's "iterative scan" so that limits by Topic still return enough rows.
- **Check questions that miss on exact names or terms**: add Postgres's built-in keyword search as a second ranking and merge the two.
- **Slides whose meaning depends on the rest of the deck**: try `voyage-context-4`, which embeds each slide with the whole deck in view. It means re-embedding everything, which is cheap.
- **The owner wants keys that nobody can read back, or loading from a button on the admin page**: move loading into a Vercel Workflow that reads the files from a private Vercel Blob store.
- **The Chatbot rarely looks, or the extra round of thinking proves too slow after all**: the app runs the search itself before each request and places the passages in it.

---

## Evidence

Every source below was read on 2026-11-28. Where a page prints its own date, that is given as "updated".

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
- "For reasoning models ... any reasoning items returned in model responses with tool calls must also be passed back with tool call outputs." Same page (read 2026-11-28). Sending `previous_response_id` with only the new items is OpenAI's documented way to continue. [OpenAI: WebSocket mode example](https://developers.openai.com/api/docs/guides/websocket-mode) (read 2026-11-28)
- Function tools and built-in tools share one request: "functions can be called in parallel when built-in tools are also available. Built-in tools cannot be included in a parallel function-call batch." [OpenAI: Function calling](https://developers.openai.com/api/docs/guides/function-calling) (read 2026-11-28). The `tools` list: "Supports built-in tools, MCP tools, and function calls (custom tools)." [OpenAI: Responses API reference](https://developers.openai.com/api/reference/resources/responses/methods/create) (read 2026-11-28)
- "Based on the provided prompt, the model automatically decides whether to use a configured tool." [OpenAI: Using tools](https://developers.openai.com/api/docs/guides/tools) (read 2026-11-28). "Use the system prompt to describe when (and when not) to use each function." [OpenAI: Function calling](https://developers.openai.com/api/docs/guides/function-calling) (read 2026-11-28)
- A look can be forced: with `tool_choice: {"type": "function", "name": "..."}` the model must "Call exactly one specific function". Same page (read 2026-11-28)
- `max_tool_calls` caps "calls to built-in tools" only. It does not cap ValueIt's function, so the app caps its own loop. [OpenAI: Responses API reference](https://developers.openai.com/api/reference/resources/responses/methods/create) (read 2026-11-28)
- Web search at xhigh is documented: OpenAI's web search guide shows `reasoning: { effort: "xhigh" }` with the `web_search` tool. [OpenAI: Web search](https://developers.openai.com/api/docs/guides/tools-web-search) (read 2026-11-28, from a search excerpt)
- How the two sit together, reasoned from the above: web search runs inside OpenAI during a response. A call to ValueIt's function ends the response and waits for the app. A turn that uses both therefore takes two requests in a row inside the one Vercel function, and the Student's stream carries on across them.

**The two ways, side by side**

| | The Chatbot decides (function tool) | The app searches first |
|---|---|---|
| Who writes the search question | The model, in proper finance words | The Student's last message, as typed ("ok but why?") |
| Looks when not needed | No | Every turn |
| Can look twice, or widen from Lesson to Topic | Yes | No |
| Certain to have seen his material | Only if forced with `tool_choice` | Always |
| Requests to OpenAI per turn | Two when it looks | One |
| Time added | The search, plus one more round of thinking | The search only |

Opinion: with learning quality deciding and speed not weighed, the function is the better default. The app-first way is the fallback.

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
- **Chart slides, without drawing pages ourselves.** OpenAI accepts a PDF as an `input_file` (by upload, by link or as Base64). "PDF parsing includes both extracted text and page images in context." `detail: "high"` is "for more visual detail, such as dense charts, small print, or diagrams". Each file "must be under 50 MB". It needs "a model that accepts image inputs", which `gpt-6.2-sol` is. [OpenAI: File inputs](https://developers.openai.com/api/docs/guides/file-inputs) (read 2026-11-28)
- The answer can be forced into a fixed shape (one entry per page) with `text.format` of type `json_schema`. [OpenAI: Responses API reference](https://developers.openai.com/api/reference/resources/responses/methods/create) (read 2026-11-28)
- OpenAI's own cookbook for slide decks does the same thing in spirit: describe each page with a vision model, cut "by page", and put "the slide title, deck title" at the top of each piece. Quoted in the earlier research. [material-search.md](https://github.com/SiddharthMuramkar/valueit/blob/research/material-search/research/material-search.md) (read 2026-11-28)
- If a page ever has to be drawn as a picture in Node, `unpdf`'s `renderPageAsImage` needs the extra package `@napi-rs/canvas`. Not needed for the recipe. [unpdf](https://github.com/unjs/unpdf) (read 2026-11-28)
- **Passage size.** A deck is 8,000 to 12,600 characters over about a dozen slides, so a slide is roughly 700 to 1,050 characters, about 150 to 250 tokens. The model's limit is 32,000 tokens per text. One slide is one passage; nothing needs splitting or joining. (Arithmetic done here from the figures in the ticket.)
- **Labels.** A Lesson is built on "one Session, part of a dense one, two short ones joined, or matching parts of two". [GLOSSARY.md](https://github.com/SiddharthMuramkar/valueit/blob/main/GLOSSARY.md) (read 2026-11-28). His Sessions carry labels like "2A" and "Preview". [How the Course breaks into Topics and Lessons](https://github.com/SiddharthMuramkar/valueit/issues/13) (read 2026-11-28). So: the Lesson label belongs to each slide, not to a deck; it can hold more than one Lesson; and the Session label is text, not a number.
- **Where loading runs.** `vercel env run -- <command>` "fetches the environment variables directly from your linked Vercel project and passes them to the specified command", "without writing them to a file". [Vercel CLI: env](https://vercel.com/docs/cli/env) (read 2026-11-28)
- **The caveat.** Vercel now stores each variable as "Config" (readable later) or "Secret" ("write-only after saving"). New variables for Production and Preview default to Secret; for Development the default is Config. `vercel env pull` writes "a placeholder" for a Secret whose value cannot be read. The page does not say what `vercel env run` does with a Secret. [Vercel: Config and Secret environment variables](https://vercel.com/docs/environment-variables/sensitive-environment-variables), [Vercel CLI: env](https://vercel.com/docs/cli/env) (read 2026-11-28). So a script on someone's machine can only get keys that are stored as readable.
- **The other place.** A Vercel Workflow runs inside Vercel, where write-only keys are available. A function marked `'use step'` gets "built-in retries", and a workflow's steps "pause, resume, and maintain state across crashes and deployments". [Vercel: Workflows](https://vercel.com/docs/workflows) (read 2026-11-28). The files would sit in a private Vercel Blob store (`vercel blob put <file> --access private`). [Vercel: Blob](https://vercel.com/docs/vercel-blob) (read 2026-11-28). They cannot be posted through a Vercel Function: the limit is 4.5 MB. [app-stack.md](https://github.com/SiddharthMuramkar/valueit/blob/research/app-stack/research/app-stack.md) (read 2026-11-28)
- Stage B is small enough for one ordinary request: under a million tokens is fewer than ten calls to Voyage at 120,000 tokens each, plus a few thousand rows written. Only stage A is long, because it waits on the model once per deck. (Arithmetic done here.)
- **If the Voyage model changes.** Inside the 4 series nothing stored needs redoing; only the model named for questions changes. To any other model, every row's list is made again from the stored text (stage B only), and the column changes too if the new lists have a different length. Labels and text stay. "Moving from voyage-3.5, voyage-3-large, or older models requires re-embedding because the embedding space differs from Voyage 4." [Vercel AI Gateway: Voyage 4](https://vercel.com/ai-gateway/models/voyage-4) (read 2026-11-28)
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

## Open questions and what could not be confirmed

Nothing was run. These are the points where the documentation stops.

1. **Search quality on his slides.** No question was ever put to a real table. The twenty check questions in step 8 are the first real evidence.
2. **How well the text comes out of his PDFs.** Reading order, tables and formulas were not tried. Run stage A on two or three real decks before trusting it.
3. **How good the written accounts of charts are**, and who reads them before loading. This belongs to [How Damodaran's material becomes something the Chatbot can search](https://github.com/SiddharthMuramkar/valueit/issues/21).
4. **Whether `vercel env run` can hand a write-only (Secret) key to a script.** The docs say such values cannot be read back and that `env pull` writes a placeholder; they are silent on `env run`. If it cannot, either the keys the script needs are stored as readable in one environment, or loading moves into a Workflow. This is the owner's call, because it touches the rule that keys live only in Vercel.
5. **How long Voyage takes for `voyage-4-large` from a Vercel function.** Voyage publishes nothing. Time it on a deployed preview.
6. **How much one more round of thinking costs at xhigh.** Not measured anywhere found.
7. **How often the Chatbot will choose to look.** Unknown until tried. `tool_choice` is the lever.
8. **Whether Voyage's own door will close.** MongoDB calls it legacy and publishes a migration guide, with no date. Voyage's own pages still invite sign-ups.
9. **Whether the free 200 million tokens survive switching training use off.** Voyage's terms say they "may" be void. At ValueIt's size the full price is cents.
10. **Whether model API use inside an Atlas account made through the Vercel Marketplace lands on the Vercel bill.** MongoDB's page says "all ... services" without naming it. Not worth chasing for a bill of cents.
11. **Whether `voyage-context-4` or the multimodal model share a space with the 4 series.** Voyage names only the four `voyage-4` models as compatible.
12. **Drizzle 1.0.** The column and distance helpers were read in today's docs, which cover 0.45. Whether the release candidate changes them was not checked.

Questions this raises for the map:

- Which database branch is "production", and is it also Neon's default branch? Loading must reach both.
- Where do the prepared records live, given this repo is public? They hold his text.
- Does any Lesson Plan need the Chatbot to have read his slide on a given step? If so, that step forces the look, or simply carries the slide's text.
- If lecture transcripts are added, how small are the pieces? That decides whether the table stays under 10,000 rows.

## How this was researched

Library and service documentation came first: Context7 for Voyage, Voyage's TypeScript package, pgvector, Drizzle, OpenAI and unpdf; Neon's documentation tools for pgvector, extensions, branching, sleep and the Vercel integration; Vercel's documentation search for environment variables, Workflows and Blob. Web searches went to Parallel, Octen, Tavily and Firecrawl together, and pages were read through Parallel. Package versions came from the public npm registry, and one README and one issue from GitHub.

Tavily was not connected as a tool in this session; its command-line client was used and worked. Firecrawl's results were thinner than the others on two searches. No provider failed. No Neon, Vercel, MongoDB, Voyage or OpenAI account was read or changed.
