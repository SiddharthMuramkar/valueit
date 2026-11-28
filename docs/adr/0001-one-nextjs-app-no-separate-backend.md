# One TypeScript app on Vercel

Build the Lesson screen, Chatbot, invite gate and owner admin page in one Next.js app. The browser handles Widget interactions and finance calculations. The server checks access, reads and writes Neon, and calls the AI services. All four have TypeScript interfaces. A separate FastAPI service would give the owner another deployment and another language to maintain. [Base app research](https://github.com/SiddharthMuramkar/valueit/issues/8)

## What happens on a Chatbot turn

Use OpenAI's own SDK and `gpt-6.2-sol`. Give each model job a named effort setting, initially `xhigh` for all of them. Use standard processing. The model supports a higher setting called `max`. The owner chose `xhigh` and waived the speed test. Access on ValueIt's project and the quality of a live Widget will be checked in the prototype. [Model catalog](https://developers.openai.com/api/docs/models) · [Do live-built Widgets look and teach well enough?](https://github.com/SiddharthMuramkar/valueit/issues/28)

Supply the Lesson Plan's named passages on each relevant turn. Offer OpenAI's web search only when a Student asks how an idea applies today. On that turn the Chatbot can decide whether it needs the web. Save the answer and its citation positions, titles and URLs in Neon, so the Student can click the inline sources now or when reopening the Lesson. Course material is never presented as a source. OpenAI's search uses the existing account. Revisit Parallel if the Lesson check repeatedly returns stale examples. [Web search requirements](https://developers.openai.com/api/docs/guides/tools-web-search) · [How the Lesson screen looks and moves](https://github.com/SiddharthMuramkar/valueit/issues/14)

ValueIt owns the conversation history. Send foreground Responses requests with `store: false` and carry forward the input needed for the next turn or tool result. OpenAI processes the Student's message and the passages included with it. Its ordinary abuse-monitoring logs can retain content for up to 30 days. [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data) · [Stateless reasoning](https://developers.openai.com/api/docs/guides/reasoning)

Revisit a separate backend if a job needs an always-on process, a second client needs a public API or the TypeScript finance calculations cannot reproduce a checked workbook. [Lock the stack](https://github.com/SiddharthMuramkar/valueit/issues/17)
