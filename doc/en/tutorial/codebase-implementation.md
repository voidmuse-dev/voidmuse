## 1. Preface
Why build this open-source project?

AI has progressed rapidly over the past two years, bringing concepts like embeddings, RAG, and function calling. We’re curious about their real value in an actual project and how to apply them in practice. The best way to learn is by doing, so we created the VoidMuse project to implement an AI IDE coding plugin—similar in spirit to Cursor but limited to a plugin form, closer to the open-source Cline plugin—so we can practice the ideas we want to learn.

Why not extend Cline directly? Because Cline’s code is complex, and the cost to practice on top of it is high. Starting from scratch with a simpler project is sufficient to achieve our goals.

This article explains the real implementation of the codebase feature. We fully implemented calling the codebase on the chat page to retrieve relevant code and inject it into the LLM context. It includes many optimization details, such as pitfalls in choosing an embedding model and the limitations of pure vector search. We use hybrid search to improve retrieval accuracy. After reading, you’ll have a deeper understanding of how the codebase is actually implemented.

![Codebase usage in IntelliJ](../../img/tutorial/codebase/codebase效果.png)

## 2. Full Pipeline
![Full pipeline screenshot](../../img/tutorial/codebase/codebase-流程.png)

The codebase feature has two key parts:
1. Build the codebase index: vectorize all code files. This involves chunking, embeddings, and file selection strategies.
2. Search the codebase index: perform vector search + text search. We adopt hybrid search to improve accuracy and use prompt weighting to boost keyword importance.

Below are the detailed implementation steps for both parts.

## 3. Building the Codebase Index
![Indexing flow screenshot](../../img/tutorial/codebase/codebase-建立索引流程.png)

### 3.1 Remove Files
A repository contains many files: system hidden files, dependencies (e.g., `node_modules`), and protocol-generated large files. For example, Java projects using protobuf (pb) can generate huge Java files. These are not helpful for code search, so we remove them in advance.

Filtering strategy:
1. `.gitignore`: Most repos have a `.gitignore` listing files and directories to ignore. We remove files per this list; most dependency files are excluded at this stage.
2. Additionally exclude “pb auto-generated files”: These protobuf-generated Java files can be huge and unhelpful for search. Our project uses pb quite a bit, so we explicitly remove them.
3. Exclude empty and large files: We exclude files larger than `1MB`.

Reference code: [`CheckAutoIndexingTask.startCheckAll`](../../../extensions/intellij/src/main/java/com/voidmuse/idea/plugin/codebase/CheckAutoIndexingTask.java)

### 3.2 Code Chunking
Files typically contain multiple functions, and their length varies; some can have thousands of lines. Embedding models have context length limits, so we must chunk files and vectorize each chunk separately.

We considered two chunking strategies (inspired by the `continue` plugin):
1. Structure-aware chunking via AST (functions/classes): Transform code into structured data that provides richer features and captures complete function boundaries.
2. Character or line-based chunking: The `continue` plugin’s fallback method.

In `VoidMuse`, we implemented the simplest line-based approach: split files into random-sized chunks of 35–65 lines. This has an obvious drawback: a complete function may be split across multiple chunks.

Note on embedding model pitfalls: Initially we wanted Chinese support and chose the open-source `bge-large-zh-v1.5` model, but its context limit is 512 tokens. After chunking, it’s easy to exceed this limit, leading to poor embedding accuracy. We later switched to `Qwen3-Embedding-0.6B`, which runs locally, has a 32,000-token context window, and a 1536-dimensional embedding, enabling more expressive and accurate representations.

### 3.3 Embedding and Storing in Lucene
Each chunk is embedded separately, then stored in a Lucene index. The Lucene index contains the chunk text, vector, file path, line numbers, etc.

We use Lucene to store the index. Lucene is a Java-based full-text search engine with strong performance and Chinese support. We call Lucene’s APIs directly for retrieval and leverage its text + vector search capabilities to improve accuracy.

Reference code: [`LuceneVectorStore.java`](../../../extensions/intellij/src/main/java/com/voidmuse/idea/plugin/codebase/vector/LuceneVectorStore.java)

## 4. Searching the Codebase Index
![Search flow screenshot](../../img/tutorial/codebase/codebase-检索流程.png)

### 4.1 Optimize the Query
In testing, we found that directly embedding queries didn’t work very well. Before embedding, we optimize queries to be more suitable for vector search, including repeating key terms 3 times to boost their weight (a common trick from long-prompts: repeating an important rule increases its impact).

For example, if the user’s query is “Find information related to order number OrderID generation”, we optimize it to:
`OrderID OrderID OrderID order number generation order number generation rules order number generation logic order number generation docs` (repeat 3 times) to boost emphasis on `OrderID`.

Prompt for optimization: [`codebaseOptimizePrompt.txt`](../../../gui/src/config/prompts/codebaseOptimizePrompt.txt)
Optimization pipeline in GUI: [`IDEService.ts`](../../../gui/src/api/IDEService.ts) → `buildWithCodebaseContext`

### 4.2 Embedding the Query
This step simply embeds the (optimized) query; details are the same as above.

### 4.3 Hybrid Search (the key)
We initially tried vector-only search, but it has limitations:

1. Semantic understanding limits of embeddings
- Semantic generalization: Embedding models (e.g., BERT, GPT) capture semantic information, but code requires high precision. They may generalize class or method names, hurting exact matches.
- Loss of symbol precision: Embedding models may overlook the exactness of symbols (class/method names), especially when they have specific meanings. Even when a query specifies a symbol, the model may miss it.

2. Context dependency of embeddings
- Context bias: When queries contain many details (class/method names), embeddings may over-rely on those contexts and miss the broader structure or functionality.
- Overfitting: Overly detailed queries can cause embeddings to fixate on narrow details and miss broader relevance, producing overly narrow results.

3. The structured nature of code
- Importance of symbol search: Symbols in codebases follow structured naming. Pure vector search does not fully leverage this structure, reducing effectiveness.
- Necessity of hybrid search: Combine symbol/text search with embeddings. Symbol search gives exact matches; embedding search captures semantics. Together they balance precision and semantic understanding.

Summary: Code search should use hybrid search—symbol/text + vector.

Fortunately, Lucene supports text + vector search out of the box, and we leverage it directly.

Concrete code: [`LuceneVectorStore.hybridSearch`](../../../extensions/intellij/src/main/java/com/voidmuse/idea/plugin/codebase/vector/LuceneVectorStore.java)
Key features:
- Search text (semantic similarity) + vectors. For example, a query like “What is the concrete implementation of twoStageHybridSearch” will search for chunks containing `twoStageHybridSearch` and chunks similar to the embedded sentence, then combine scores.
- Expand the candidate set: Increase recall by fetching a larger candidate pool. If you expect 10 results, fetch 30 candidates first, then rerank.
- Rerank: Compute mixed scores for retrieved chunks and take the top-k.

## 5. Further Reading: Why Cline Doesn’t Use Vector Search
Cline is an open-source plugin, but unlike Cursor, it does not index the codebase and does not use vector search.

Instead, Cline uses another approach: it reads relevant files by following dependency chains (e.g., `import`), similar to how humans navigate code by jumping to dependencies. Downsides include reading lots of files when dependencies are deep, consuming a lot of context, and knowing when to stop. This is based on AST parsing. We’ve used similar strategies for autocomplete, because using dependency context helps predict the next token more accurately.

It’s interesting: Cursor extracts relevance via project-wide vector search (a technical correlation approach), whereas Cline extracts relevance via dependency traversal (a human reading approach).

## 6. Summary
In short, the codebase feature is RAG: vectorize content and retrieve via embeddings. To get good results, you need to optimize many details: chunking strategies, query keyword weighting, and adding text search. Through this practice, we gained a solid understanding of how codebase features in AI coding tools like Cursor work. Their engineering is certainly more complex, but the overall flow is now clear.

Next, we hope to explore memory capabilities. LLM context is limited, and starting a new chat loses accumulated information. Memory can retain key information from previous conversations and use it in subsequent chats to produce more accurate answers.

## 7. References
- Why Cline doesn’t index your codebase (Chinese): https://zhuanlan.zhihu.com/p/1919489523823407360
- Official explanation: https://cline.bot/blog/why-cline-doesnt-index-your-codebase-and-why-thats-a-good-thing
- Discussion on pros/cons of Cursor’s codebase and Cline’s mechanism: https://news.ycombinator.com/item?id=44106944
- Hybrid search: https://www.pinecone.io/blog/hybrid-search/