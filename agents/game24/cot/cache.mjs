import fs from 'fs/promises'
import { getFilePath } from '../../../utils.mjs';

const CACHE_FILE = getFilePath(import.meta.url, '../../db/number_cache.json');

export class Cache {
    constructor() {
        this.cache = new Map();
        this.dirty = false;
    }

    generateKeys(numbers) {
        numbers = numbers.sort((a, b) => a - b);
        return numbers.join(',');
    }

    set(numbers, result) {
        this.cache.set(
            this.generateKeys(numbers),
            result,
        );
        this.dirty = true;
    }

    get(numbers) {
        return this.cache.get(
            this.generateKeys(numbers),
        );
    }

    async load() {
        try {
            const data = await fs.readFile(CACHE_FILE, { encoding: 'utf-8' });
            const entries = JSON.parse(data);
            this.cache = new Map(entries);
        } catch (err) {
            this.cache = new Map();
        }
    }

    async save() {
        if (!this.dirty) {
            return;
        }
        try {
            const entries = Array.from(this.cache.entries());
            await fs.writeFile(
                CACHE_FILE,
                JSON.stringify(entries),
            )
        } catch (err) {
        }
    }
}