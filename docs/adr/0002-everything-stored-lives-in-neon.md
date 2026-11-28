# Neon holds ValueIt's records and private course files

Use one project in the owner's existing Neon organisation. Postgres holds Lesson progress, conversations, Widgets, Notes, approvals and searchable passages. Neon Object Storage holds the source files in a private bucket. Using Neon's Vercel integration keeps the existing account and bill. Create the project in a region that offers Object Storage. The measured 175 MB covers the slide decks alone. [Neon storage and regions](https://neon.com/docs/storage/overview) · [Material inventory](https://github.com/SiddharthMuramkar/valueit/blob/research/damodaran-material/research/damodaran-material.md#L99-L111)

## Access and previews

Google sign-in through Neon establishes a person's identity. The owner grants or removes Student access in ValueIt's admin page. Check the current approval on the server before serving private Lesson content or operating on Student data. Only the owner can change approvals or start a production import. [Sign-in decision](https://github.com/SiddharthMuramkar/valueit/issues/5)

Use a separate production branch and seed the project's default branch with test data and test accounts. Neon creates previews from that default branch, including its authentication state and storage. Give each preview its own credentials and enable deletion of obsolete branches in the integration. The architecture check includes completing Google sign-in on a real preview URL and exercising pending, approved and revoked access. [Neon-managed integration](https://neon.com/docs/guides/neon-managed-vercel-integration) · [Architecture and key ownership](https://github.com/SiddharthMuramkar/valueit/issues/19)

## Reproducing a Lesson's figures

Store each accepted spreadsheet under a new private object key derived from the SHA-256 digest of its original bytes. Record the key, digest and source in the Lesson's import record. Verify the digest before use and keep the previous object when an upstream workbook changes. A Lesson continues to reference its accepted version until its figures have been checked against the replacement. Neon does not enforce S3 object versioning. Keep the originals and extracted course material outside the public repo. [Neon S3 compatibility](https://neon.com/docs/storage/s3-compatibility) · [Checked workbook example](https://github.com/SiddharthMuramkar/valueit/blob/research/cost-of-capital-spreadsheets/research/cost-of-capital-spreadsheets.md#L45-L52)

OpenAI processes material used to prepare or teach a Lesson. Voyage processes passages and search queries for retrieval. The separate provider settings and checks are recorded in the [app decision](0001-one-nextjs-app-no-separate-backend.md) and the [retrieval decision](0004-damodaran-searched-in-neon-with-voyage.md).

## Alternatives

The owner preferred the existing Neon project arrangement over another GitHub repository or file-storage service. Clerk would add a sign-in vendor. Supabase would replace the database and sign-in provider together. If managed sign-in cannot meet the invite and preview requirements, Better Auth can run inside ValueIt, with ValueIt responsible for its operation. [Lock the stack](https://github.com/SiddharthMuramkar/valueit/issues/17)
