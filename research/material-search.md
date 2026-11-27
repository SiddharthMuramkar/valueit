# The simplest managed way to answer from Damodaran's material

Research for ticket #4. Checked on 2026-11-27 against the vendors' own documentation. Nothing here was measured: no account was touched and no API was called, so every speed figure is somebody else's report and is marked as such.

## The answer

**Recommendation: use OpenAI's hosted file search for the first Lesson.** The material is uploaded to a "vector store" inside the OpenAI account ValueIt already has, and the Chatbot is given OpenAI's built-in `file_search` tool. No new vendor, no new key, no database table, no embedding service, no search code.

It comes with two conditions and one fallback.

1. **Cut the material into small files before uploading, one per slide, per page, or per transcript passage.** OpenAI's citation names a file and nothing finer. If one file is one slide, the citation is that slide. This cutting step is ours under every option.
2. **Measure the time it adds before locking it.** OpenAI publishes no figure. The only measurement found is one developer's, at 3 to 7 seconds per search, taken during a fault that has since been fixed. That is too slow if it holds, and nobody can know without a test.
3. **Fallback: Postgres on Neon with OpenAI's embeddings.** It also adds no vendor (if Neon is the database), it is the fastest option, and its citations are exact. It is more to own. Keep search behind one small function so that swapping is a change in one place.

Pinecone and Voyage are not recommended: each adds a vendor, a key and a bill. No Vercel-made search product was found; Vercel points to partners such as Neon.

**Does a hosted option now do the earlier attempt's job with less to own? Yes.** OpenAI's vector store replaces the Postgres table, the vector index, the Voyage embeddings and the keyword search in one service that does both kinds of search. What it does not replace is the cutting and labelling of the material, and it gives no promise on speed.

### What the options are

| | New vendors | New keys | What we own | Time added per answer | Points to slide or page? | Limit to a Topic or Lesson? |
|---|---|---|---|---|---|---|
| **OpenAI file search** | 0 | 0 | A loading script | Not published. One report of 3 to 7 s | File only. Slide-level if one file is one slide | Yes, by labels on each file |
| **Postgres on Neon + OpenAI embeddings** | 0 (if Neon is the database) | 0 | Loading script, a table, an index, the search query | Not measured. Likely a few hundred ms (estimate) | Yes, exactly, whatever we store | Yes, exactly |
| Same, with Voyage embeddings | 1 | 1 | Same as above | Same | Same | Same |
| **Pinecone Assistant** | 1 | 1 | A loading script | No figure gathered | File and page number, built in (PDF) | Yes, by labels set at upload |
| **Vercel** | None of its own found | | | | | |

### What it means for ValueIt

- **Accounts and keys.** Nothing new. The material sits in the OpenAI account as one vector store. The existing OpenAI key reaches it.
- **Who fixes what.** If search is down or wrong at the service level, OpenAI fixes it. That is the benefit the owner asked for. The other side of it: in spring 2026 OpenAI's search silently returned nothing for about a quarter of searches, and the fix took about ten weeks. Nobody outside OpenAI could do anything but wait.
- **What stays ours whichever vendor is picked.** A loading script, written by coding agents and run when material changes. It cuts each slide deck into one text file per slide, each transcript into passages, each blog post into sections, and labels each with Topic, Lesson, kind of source, deck or lecture name, slide number or timestamp, and a link. No vendor does this cutting well for slides and spreadsheets. This is the real work, and it is the "Loading the material" item on the map.
- **Slides.** OpenAI's search reads the text of a PDF. Its last statement on the subject says pictures, charts and tables-as-images inside a document are not read. A slide that is mostly a chart would be nearly invisible to search. The fix is in the loading script: an AI model looks at each slide once and writes out what it shows. OpenAI's own cookbook does exactly this.
- **Spreadsheets.** OpenAI's search does not accept spreadsheet files at all. The spreadsheets become short written notes ("this sheet computes X from inputs A, B, C") that can be searched. The working calculator is a separate matter (ticket #7 and #16).
- **What the Student sees.** "Session 7 slides, slide 14" under an answer, because each search result is one slide's file and carries its labels.
- **What is given up.** No choice of embedding model. Little control over how results are ranked. No way to see inside the index. Tests must run against the live service. Speed is whatever OpenAI delivers.
- **Cost.** A few dollars a month at invite-only scale, tens of dollars at ten times that. Under every option the search itself is cheap next to the model's own thinking.
- **This repo is public.** The material and the cut-up files must live somewhere private, not here.

### What would force a change later

1. **Speed.** The test shows search adding more than the Student will tolerate. Suggested line, to be set by the speed tickets (#3, #15): more than about one second on a typical answer. First try calling OpenAI's search directly instead of through the tool; if still slow, move to Neon.
2. **Citations.** The one-file-per-slide method proves too coarse or too clumsy, for example if answers must highlight a sentence.
3. **Bad results that cannot be tuned.** Finance questions keep fetching the wrong slide and the few available settings do not fix it.
4. **Another silent failure**, or uploads that stall.
5. **File count for the whole Course.** If the limit per store turns out to be 10,000 files and not 100,000,000 (see evidence), one file per slide across five Topics may not fit in one store. One store per Topic would solve it.
6. **OpenAI changes the product or price.** It has done so before: the Assistants API, where file search first lived, was given a shutdown date of 26 August 2026 and the tool moved to the Responses API. [Assistants file search](https://developers.openai.com/api/docs/assistants/tools/file-search)

Size is not a forcing reason. Tens of millions of tokens fit inside the free storage allowance on a rough estimate.

---

## Evidence

### 1. OpenAI hosted file search and vector stores

**What it does today**

- File search is a hosted tool in the Responses API. It retrieves from uploaded files "through semantic and keyword search", and OpenAI runs it: "you don't have to implement code on your end to handle its execution". [File search guide](https://developers.openai.com/api/docs/guides/tools-file-search)
- Adding a file to a vector store means it is "automatically chunked, embedded, and indexed". [Retrieval guide](https://developers.openai.com/api/docs/guides/retrieval)
- The tool also rewrites the question for search, splits a complex question into several searches, and re-ranks results. Stated on the older Assistants-era page, which describes the same tool. [Assistants file search](https://developers.openai.com/api/docs/assistants/tools/file-search)
- The same store can be searched directly, without a model, through a search endpoint that returns passages, scores, file names and labels. [Search vector store reference](https://developers.openai.com/api/reference/resources/vector_stores/methods/search)
- GPT-6.2 Sol supports `file_search`. [Model page](https://developers.openai.com/api/docs/models/gpt-6.2-sol)

**Limits**

- 512 MB per file and 5,000,000 tokens per file. [Retrieval guide, Limits](https://developers.openai.com/api/docs/guides/retrieval)
- Files per store: "up to 10,000 files. For vector stores created starting in November 2025, this limit is 100,000,000 files." This sentence is on the older Assistants page only; the current guide gives no file count. [Assistants file search](https://developers.openai.com/api/docs/assistants/tools/file-search)
- Adding files: 300 requests a minute per store; up to 500 files per batch. [Retrieval guide](https://developers.openai.com/api/docs/guides/retrieval)
- Tool rate limit: 500 requests a minute on the Build tier, 1,000 on Launch and Grow. [File search guide, Usage notes](https://developers.openai.com/api/docs/guides/tools-file-search)
- Results per search: 10 by default, 50 at most. [Retrieval guide](https://developers.openai.com/api/docs/guides/retrieval)

**Price**

- Storage: first 1 GB free across all stores, then $0.10 per GB per day. Charged on "the size of parsed chunks and their corresponding embeddings". [Retrieval guide, Pricing](https://developers.openai.com/api/docs/guides/retrieval)
- Tool calls: $2.50 per 1,000. "File search tool call pricing applies to the Responses API only." Retrieved text is then billed as ordinary input tokens. [Pricing](https://developers.openai.com/api/docs/pricing)
- GPT-6.2 Sol: $2 per million input tokens, $10 per million output. [Pricing](https://developers.openai.com/api/docs/pricing)

**Speed added per answer**

- No official figure. The docs say only that fewer results "can help reduce both token usage and latency" and that turning the re-ranker off "can help reduce latency". [File search guide](https://developers.openai.com/api/docs/guides/tools-file-search), [Search reference](https://developers.openai.com/api/reference/resources/vector_stores/methods/search)
- One developer timed 50 direct searches in May 2026: "Successful searches usually took 3-7s"; failed ones returned in about a second with nothing. This was during the fault described below, so it may overstate normal times. [Forum thread](https://community.openai.com/t/responses-api-file-search-intermittently-returns-zero-results-for-the-same-prompt/1380262)
- Another developer reported 45 to 60 seconds for a whole answer with file search in December 2025; replies called that abnormal and claimed, without numbers, that a search should take under a second to a few seconds. [Forum thread](https://community.openai.com/t/vector-search-results-are-too-slow/1369742)
- Through the tool, the model first decides to search and writes the queries, so there is a model step before the search and another after. Calling search directly removes the first step. (Reasoning from how the tool is described, not a measurement.)

**What a citation contains**

- Three things: `file_id`, `filename`, and `index`. No page, no slide, no quoted passage. [File search guide, response example](https://developers.openai.com/api/docs/guides/tools-file-search)
- The retrieved passages themselves, with score, file name and the file's labels, come back only if asked for with `include: ["file_search_call.results"]`. [File search guide](https://developers.openai.com/api/docs/guides/tools-file-search)
- A developer asked in April 2025 how to map a citation to a page; the thread has no answer. [Forum thread](https://community.openai.com/t/citations-in-file-search-to-specific-page-of-the-file/1235628)
- Consequence: labels belong to a whole file, never to a passage inside it. To cite a slide, make the slide its own file.

**Filtering by Topic or Lesson**

- Each file in a store can carry up to 16 labels ("attributes"); keys up to 64 characters, text values up to 512. [Retrieval guide, Attributes](https://developers.openai.com/api/docs/guides/retrieval)
- A search can be restricted with filters: equals, not equals, greater or less than, in a list, combined with and/or. The filter is set in our code on each request, so the model cannot wander outside the Lesson. [Retrieval guide, Attribute filtering](https://developers.openai.com/api/docs/guides/retrieval), [File search guide, Metadata filtering](https://developers.openai.com/api/docs/guides/tools-file-search)

**Loading and updating**

- Upload a file, attach it to the store with its labels, wait until its status is `completed`. Labels can be changed later. [Retrieval guide](https://developers.openai.com/api/docs/guides/retrieval)
- There is no edit-in-place for content: replace a file by deleting it and adding the new one. "Removing files from a vector store is eventually consistent, and search results may still include content from a removed file for a short period." [Retrieval guide](https://developers.openai.com/api/docs/guides/retrieval)
- Indexing time varies. One developer saw the same tiny file index in 6.7 seconds on one run and remain unfinished after 600 seconds on another (July 2026). [Forum thread](https://community.openai.com/t/extremely-inconsistent-vector-store-indexing-times/1388135)

**Slides and spreadsheets**

- Accepted: `.pdf`, `.pptx`, `.docx`, `.md`, `.txt`, `.html`, `.json` and code files. Not accepted: `.xlsx`, `.csv`, images. [File search guide, Supported files](https://developers.openai.com/api/docs/guides/tools-file-search)
- Known limitations as last stated: no "parsing images within documents (including images of charts, graphs, tables etc.)" and no "retrievals over structured file formats (like csv or jsonl)". This is on the older page; the current guide is silent. [Assistants file search](https://developers.openai.com/api/docs/assistants/tools/file-search)
- Files are cut by token count (800 tokens with 400 overlap by default), not by slide. [Retrieval guide, Chunking](https://developers.openai.com/api/docs/guides/retrieval)
- OpenAI's cookbook for slide decks: turn each page into an image, have a vision model describe it, and cut "by page", putting "the slide title, deck title" at the top of each piece. [Cookbook: parse PDF docs for RAG](https://developers.openai.com/cookbook/examples/parse_pdf_docs_for_rag)
- Giving a PDF straight to the model (not through search) is different: there "the API extracts both text and page images". Useful for one deck, not for a library. [File inputs](https://developers.openai.com/api/docs/guides/file-inputs)

**Control that is lost**

- Cutting: only chunk size (100 to 4,096 tokens) and overlap can be set. [Retrieval guide, Chunking](https://developers.openai.com/api/docs/guides/retrieval)
- Ranking: a choice of ranker, a score cut-off, and the balance between meaning-match and word-match. No custom ranker. [Retrieval guide, Ranking](https://developers.openai.com/api/docs/guides/retrieval)
- Embedding model: not selectable. Last stated default is `text-embedding-3-large` at 256 dimensions. [Assistants file search](https://developers.openai.com/api/docs/assistants/tools/file-search)
- Inspection: the text OpenAI extracted from a file can be read back, and each search shows its passages and scores. The index itself cannot be seen. [Vector stores reference](https://developers.openai.com/api/reference/resources/vector_stores)
- Testing: only against the live service. The direct search endpoint makes it possible to test "this question fetches that slide" without involving a model.

**Reliability on record**

- From late April 2026, searches intermittently returned zero results with no error, in 24 to 33 per cent of calls by one developer's count. OpenAI replied on 13 July 2026: "We tracked this down and fixed an issue where a temporary search failure could appear as a successful response with zero results." [Forum thread](https://community.openai.com/t/responses-api-file-search-intermittently-returns-zero-results-for-the-same-prompt/1380262)

### 2. Postgres on Neon with an embedding service

- Neon now ships its own search extensions, "Lakebase Search": vector search, keyword search (BM25) and both combined, "as plain SQL". It is "a strict superset of pgvector". Docs dated 2026-11-18. [Lakebase Search](https://neon.com/docs/ai/lakebase-search)
- The setup guide shows the parts to own: two extensions, a table with an embedding column, two indexes, code to embed each document and each question, and a SQL query that merges the two rankings. [Get started with Lakebase Search](https://neon.com/docs/ai/lakebase-search-get-started)
- After the database has been idle, "the first query after a wake is slower while the data loads into memory". [Lakebase Search](https://neon.com/docs/ai/lakebase-search)
- Neon's earlier all-in-one extension for this job, `pgrag`, is deprecated and "not recommended for new projects". Nothing in Neon parses slides or spreadsheets. [pgrag](https://neon.com/docs/extensions/pgrag)
- Embeddings from OpenAI: `text-embedding-3-small` $0.02 and `text-embedding-3-large` $0.13 per million tokens. Same key as the models. [OpenAI model page](https://developers.openai.com/api/docs/models/text-embedding-3-large)
- Embeddings from Voyage: `voyage-4` $0.06, `voyage-4-large` $0.12, `voyage-4-lite` $0.02 per million tokens, first 200 million tokens free. [Voyage pricing](https://docs.voyageai.com/docs/pricing). "Voyage AI is a MongoDB company", and on the MongoDB route charges are "billed to the Atlas account". [Voyage FAQ](https://docs.voyageai.com/docs/faq), [MongoDB docs](https://www.mongodb.com/docs/voyageai/models). A separate vendor, key and bill either way.
- Embeddings from Neon itself: Neon's AI Gateway serves three open embedding models from $0.02 per million tokens, on prepaid credits ($5 minimum), in four regions. One more credential, no new vendor. [Neon AI Gateway embeddings](https://neon.com/docs/ai-gateway/embeddings), [overview](https://neon.com/docs/ai-gateway/overview)
- Neon price: $0.35 per GB a month for storage and $0.106 per compute-hour on the Launch plan. [Neon pricing](https://neon.com/pricing). "Paid plans have no monthly minimum." [Neon pricing post](https://neon.com/blog/new-usage-based-pricing)
- Speed: Vercel's own guide says retrieval is "one intra-region round trip" when the database sits in the same region as the function, and advises "Time it from a deployed function before committing." [Vercel RAG architecture guide](https://vercel.com/kb/guide/rag-chatbot-production-architecture-on-vercel). Forum users report milliseconds for the database part. [Forum thread](https://community.openai.com/t/vector-search-results-are-too-slow/1369742). Not measured here.
- Citations and filters are exact because each row holds whatever we put in it: slide number, page, timestamp, Topic, Lesson.
- Count: 0 new vendors with OpenAI embeddings. Moving parts: extensions, table, index, loading script that also embeds, search function. Neon fixes the database; OpenAI fixes the embedding endpoint; the search logic is ours.

### 3. Pinecone

- Plans: Starter free; Builder $20 a month flat; Standard $50 a month minimum; Enterprise $500 minimum. [Pinecone pricing](https://www.pinecone.io/pricing/)
- Pinecone Assistant is the hosted option closest to OpenAI's: upload files and it "manages chunking, embedding, and storage". Its passages can be fetched for use with our own OpenAI model. [Assistant overview](https://docs.pinecone.io/guides/assistant/overview)
- Its citations are the best of the hosted options: each names the file and a list of `pages`, with an optional highlighted quote. [Chat and citations](https://docs.pinecone.io/guides/assistant/chat-with-assistant)
- File types: DOCX, JSON, Markdown, PDF, text. No PowerPoint, no spreadsheets. [Files overview](https://docs.pinecone.io/guides/assistant/files-overview)
- It can read charts and images inside PDFs ("multimodal"), in public preview, limited to 100 pages per file and billed at about twice the normal loading rate. [Multimodal context](https://docs.pinecone.io/guides/assistant/multimodal-context), [Pricing and limits](https://docs.pinecone.io/guides/assistant/pricing-and-limits)
- Labels on files allow filtering, but "File metadata can be set only when the file is uploaded." [File metadata](https://docs.pinecone.io/guides/assistant/file-metadata)
- Assistant usage prices on Standard: loading $0.0005 per unit of about 400 tokens; fetching passages $5 per million tokens; storage $3 per GB a month. Starter includes 1,000 loading units and 500,000 passage tokens a month; Builder 10,000 and 2,000,000. [Pricing and limits](https://docs.pinecone.io/guides/assistant/pricing-and-limits)
- Count: 1 new vendor, 1 new key, 1 new bill. It connects to Vercel "with an API key". [Vercel RAG architecture guide](https://vercel.com/kb/guide/rag-chatbot-production-architecture-on-vercel)

### 4. What Vercel offers

- No vector store of its own was found. Vercel's own architecture guide puts vector storage in "a store provisioned ... through the Vercel Marketplace (Neon, Upstash Vector) or connected externally". Its storage command creates only Blob (files) and Global Config stores. [Vercel RAG architecture guide](https://vercel.com/kb/guide/rag-chatbot-production-architecture-on-vercel), [Vercel storage CLI](https://vercel.com/docs/cli/storage)
- Vercel's AI Gateway offers embeddings and re-ranking from other companies' models. Using it would route model calls through Vercel, which cuts across the locked choice of OpenAI's own SDK. [Embeddings](https://vercel.com/docs/ai-gateway/modalities/embeddings), [Reranking](https://vercel.com/docs/ai-gateway/modalities/reranking)
- Vercel publishes a "Knowledge Agent Template" with "No vector database. No chunking pipeline. No embedding model": an agent searches plain files with `grep`, `find` and `cat` inside a Vercel Sandbox. It is built on Sandbox, Workflow, Postgres and Vercel's AI SDK and Chat SDK, and it answers by taking several steps per question. More parts and more waiting than the options above (the waiting is an inference; Vercel gives no timing). [Vercel blog, 2026-03-19](https://vercel.com/blog/build-knowledge-agents-without-embeddings)

### 5. Cost at invite-only scale and at ten times

Assumptions are mine; the map gives no numbers. Invite-only: 1,000 Chatbot questions a month. Ten times: 10,000. Each question runs one search that returns about 2,400 tokens of passages. Whole Course about 30 million tokens (unverified); Cost of Capital a small fraction of that.

| | 1,000 questions a month | 10,000 questions a month | One-off loading |
|---|---|---|---|
| OpenAI file search | about $2.50 in search fees; storage free | about $25; storage free | none |
| Postgres on Neon + OpenAI embeddings | under $1 | under $1 to a few dollars | under $1 for one Lesson; $0.60 to $3.90 for the whole Course |
| Pinecone Assistant | $20 to $50 | roughly $120 or more | within plan, or about $1.25 per million tokens |

- Under every option the passages are then read by the model: about $5 a month at 1,000 questions and $48 at 10,000, at $2 per million input tokens. The model's own reasoning and writing will cost more than all of this.
- OpenAI storage estimate: 30 million tokens is roughly 120 MB of text; with the default overlap and the embeddings, about 0.3 GB. Under the free 1 GB. If the model searches twice per question, double the search fee.
- Pinecone's defaults fetch far more text per question (16 passages of up to 2,048 tokens), which would multiply its figure. [Chat and citations](https://docs.pinecone.io/guides/assistant/chat-with-assistant)

### 6. How easily AI coding agents can build and test against each

- **OpenAI file search.** The official SDK is already in the stack and documents every call. Least code: one upload script and one tool entry. Tests can assert on the direct search endpoint. Weakness: nothing runs locally, and results can shift when OpenAI changes its ranker unless a ranker version is pinned.
- **Postgres on Neon.** SQL is familiar ground for agents, every row can be inspected, and experiments can run on a database branch. More code to write and keep right: schema, embedding calls, the merge query.
- **Pinecone.** A second SDK and a second set of docs. Workable, but nothing it offers outweighs the extra vendor.

---

## Open questions

Things this research could not confirm:

1. **The time OpenAI's search adds today.** Only two forum reports exist, one taken during a fault. Needs a measurement on real Cost of Capital material: through the tool, through the direct endpoint, and against Postgres on Neon.
2. **Whether OpenAI's search now reads charts and pictures inside PDFs.** The last statement says no; the current guide does not say. One real slide deck, uploaded and read back, settles it.
3. **Whether the direct search endpoint has a per-search fee.** The pricing page lists the fee for the tool only.
4. **The file limit per store.** 100,000,000 is stated only on the older page. Matters for the whole Course at one file per slide, not for one Lesson.
5. **Which embedding model OpenAI's stores use now.** Last stated on the older page.
6. **How many stores one `file_search` call can search.** Not confirmed. The recommended design needs only one.
7. **The size of the material.** "Tens of millions of tokens" is unverified, and the Cost of Capital share is unknown. Ticket #6 should give slide, lecture and post counts.
8. **Search quality on finance material.** No option was tested. Needs a short list of real questions with the slide each should fetch.
9. **Neon's new search extensions in practice.** The docs are weeks old and the benchmarks come from Neon's parent company on its own platform.
10. **Pinecone's speed**, and whether its page numbers work for anything but PDFs.

Questions this raises for the map:

- Where do the material and its cut-up files live, given this repo is public?
- How does a slide become searchable text: who checks the AI-written description of a chart or a formula?
- What does a citation open when the Student clicks it: the slide image, the deck at that page, the video at that minute?

## How this was researched

Vendor documentation and pricing pages read on 2026-11-27, plus OpenAI's developer forum for reports of behaviour in use. Searches went through Parallel, Octen, Tavily and Firecrawl; Context7, and the Neon and Vercel documentation tools, were used for library docs. Parallel stopped answering partway through (rate limit) and the Firecrawl command-line tool was unavailable; the others covered the gap.
