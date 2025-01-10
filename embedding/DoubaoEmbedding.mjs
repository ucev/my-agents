import { getEnvironmentVariable } from "@langchain/core/utils/env";
import { Embeddings } from "@langchain/core/embeddings";
import { chunkArray } from "@langchain/core/utils/chunk_array";

export class DoubaoEmbeddings extends Embeddings {
    modelName = '// 向量化模型的推理接入点 的ID。';
    batchSize = 24;
    stripNewLines = true;
    apiKey = '';
    parameters = undefined

    constructor(fields) {
        const fieldsWithDefaults = { maxConcurrency: 2, ...fields };
        super(fieldsWithDefaults);

        const apiKey =
            fieldsWithDefaults?.apiKey ?? getEnvironmentVariable("OPENAI_API_KEY");

        if (!apiKey) throw new Error("Doubao API key not found");

        this.apiKey = apiKey;

        this.modelName = fieldsWithDefaults?.modelName ?? this.modelName;
        this.batchSize = fieldsWithDefaults?.batchSize ?? this.batchSize;
        this.stripNewLines =
            fieldsWithDefaults?.stripNewLines ?? this.stripNewLines;

        this.parameters = {
            text_type: fieldsWithDefaults?.parameters?.text_type ?? "document",
        };
    }

    async embedDocuments(texts) {
        const batches = chunkArray(
            this.stripNewLines ? texts.map((t) => t.replace(/\n/g, " ")) : texts,
            this.batchSize
        );
        const batchRequests = batches.map((batch) => {
            const params = this.getParams(batch);

            return this.embeddingWithRetry(params);
        });

        const batchResponses = await Promise.all(batchRequests);
        const embeddings = [];

        for (let i = 0; i < batchResponses.length; i += 1) {
            const batch = batches[i];
            const batchResponse = batchResponses[i] || [];
            for (let j = 0; j < batch.length; j += 1) {
                embeddings.push(batchResponse[j]);
            }
        }

        return embeddings;
    }

    async embedQuery(text) {
        const params = this.getParams([
            this.stripNewLines ? text.replace(/\n/g, " ") : text,
        ]);

        const embeddings = (await this.embeddingWithRetry(params)) || [[]];
        return embeddings[0];
    }

    getParams(texts) {
        return {
            model: this.modelName,
            input: texts,
            parameters: this.parameters,
        };
    }

    async embeddingWithRetry(body) {
        return fetch(
            "https://ark.cn-beijing.volces.com/api/v3/embeddings",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify(body),
            }
        ).then(async (response) => {
            const embeddingData = await response.json();

            if ("code" in embeddingData && embeddingData.code) {
                throw new Error(`${embeddingData.code}: ${embeddingData.message}`);
            }

            return (embeddingData).data.map(
                ({ embedding }) => embedding
            );
        });
    }
}