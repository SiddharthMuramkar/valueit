# Search Damodaran's material in Neon with Voyage

Give the Chatbot the passages the Lesson Plan names for the idea being taught, by direct lookup in Neon. When a question goes beyond them, the Chatbot can also request a search. ValueIt supplies the actual Lesson and Topic IDs and compares the query with passages in that scope using pgvector. An exact scan is the starting point for Accounting 101. The pinned passages remain available if the Voyage service is down. [Retrieval research](https://github.com/SiddharthMuramkar/valueit/issues/27)

The owner chose control over the passages and their Lesson and Topic labels. OpenAI's hosted file search or OpenAI embeddings would avoid a vendor. Voyage adds an Atlas account and a server-side Vercel Secret, `VOYAGE_API_KEY`. Keep the query model, stored-passage model and vector dimensions explicit. Compatible Voyage 4 models can query the same embedding space at matching dimensions. For a full migration, evaluate retrieval quality first. An incompatible space requires new vectors for the stored passages. [MongoDB migration guide](https://www.mongodb.com/docs/voyageai/tutorials/migrate-embedding-model/)

## What leaves ValueIt

Voyage receives course passages during loading and short search queries that can contain a Student's words during a Lesson. Use the Atlas organisation's training opt-out before sending real material or Student queries. It requires a valid payment method. This is a setup decision. The setting still needs verification, and service retention is a separate question. Keep names, conversation history and account identifiers out of the embedding requests. [Atlas training control](https://www.mongodb.com/docs/atlas/tutorial/manage-organization-settings/#manage-data-collection-for-voyage-ai-model-training) · [Architecture and key ownership](https://github.com/SiddharthMuramkar/valueit/issues/19)

## Loading and checking the material

Run production imports as an owner-authorized job deployed on Vercel. Read the pinned files from private Neon storage and use the deployment's runtime secrets. A local process using `vercel env run` cannot recover a write-only production Secret. [Storage decision](0002-everything-stored-lives-in-neon.md) · [Vercel CLI implementation](https://github.com/vercel/vercel/blob/main/packages/cli/src/commands/env/run.ts)

Before trusting the corpus, check extraction on representative slides, charts and tables. For a set of about twenty Accounting questions, name the expected passages before running retrieval, check that results stay within the requested scope and record misses. A tool budget must end with a Student-facing answer or a clear failure. These are checks for the ingestion and build work. [How Damodaran's material becomes something the Chatbot can search](https://github.com/SiddharthMuramkar/valueit/issues/21)
