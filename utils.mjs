import './loadenv.mjs';
import { ChatOpenAI } from '@langchain/openai';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSONChatHistory } from './JSONChatHistory/index.mjs';
import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { ByteDanceDoubaoEmbeddings } from '@langchain/community/embeddings/bytedance_doubao';

export const getModel = (fields) => new ChatOpenAI({
    model: process.env.OPENAI_MODEL,
    ...fields,
    configuration: {
        basePath: process.env.OPENAI_API_BASE,
    }
})

export const getEmbeddings = () => new ByteDanceDoubaoEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
    modelName: process.env.OPENAI_MODEL_EMBEDDING,
})

export const getFilePath = (current, target) => {
    const __filename = fileURLToPath(current)
    const __dirname = path.dirname(__filename)
    return path.join(__dirname, target)
}

export const getJSONChatHistory = (sessionId) => {
    const dir = path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        './db/history'
    )
    return new JSONChatHistory({
        dir,
        sessionId,
    })
}

export const loadVectorStore = async (name) => {
    const directory = path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        `./db/${name}`
    )
    return await FaissStore.load(
        directory,
        getEmbeddings()
    )
}

export const parseNumbers = (str) => {
    return str.split(/\s+/).map(Number.parseFloat);
}