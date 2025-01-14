import { propose3Prompt, propose4Prompt, evaluatePrompt } from './prompt.mjs';
import { Cache } from './cache.mjs';
import { getModel, parseNumbers } from '../../../utils.mjs';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import readline from 'readline/promises';
import chalk from 'chalk';

const BINGO = 'bingo';
const IMPOSSIBLE = 'impossible';

const model = getModel();
const evaluateChain = evaluatePrompt.pipe(model).pipe(new StringOutputParser());
// 这里有并发限制，只能一次只能运行1个
let currentInput = [];

const getProposeChain = (number) => {
    return RunnableSequence.from([
        new RunnablePassthrough({
            func: (context) => {
                currentInput = context.input.split(' ');
            }
        }),
        (number === 4 ? propose4Prompt : propose3Prompt).pipe(model).pipe(new StringOutputParser()),
        (result) => {
            const arr = result.split('\n');
            return arr.map(res => {
                try {
                    const parts = /\d+\. (.+) = (\d+(?:\.\d+)?) \(left: (.+)\)/.exec(res);
                    if (!parts) {
                        return null;
                    }
                    const numbers = parseNumbers(parts[3]);
                    return {
                        numbers,
                        map: [
                            [Number.parseFloat(parts[2]), parts[1], currentInput],
                        ]
                    }
                } catch {
                    return ''
                }
            }).filter(Boolean);
        }
    ])
}

const parseResult = (result, map) => {
    let formula = /(?:\n|^)(.+ = 24)(?:\n|$)/.exec(result)?.[1];
    if (!formula) {
        return 'bingo'
    }
    formula = formula.split(' ');
    map.forEach(([k, v, input]) => {
        for (let i = 0; i < formula.length; i++) {
            if (formula[i] == k) {
                formula[i] = `( ${v} )`;
                formula = formula.join(' ').split(' ');
                cache.set(input, {
                    status: BINGO,
                    result: formula.join(' ')
                });
                break;
            }
        }
    })
    cache.set(currentInput, {
        status: BINGO,
        result: formula.join(' ')
    });
    return formula.join(' ');
}

const cache = new Cache();
cache.load();

const run = async (input) => {
    const steps = [];
    steps.push({
        numbers: input,
        map: [],
    });

    while (steps.length) {
        // // 宽度优先，后面我加入了endGuard，宽度有限不能用
        // const { numbers, map, endGuard = false, } = steps.shift();
        // 深度优先
        const { numbers, map, endGuard = false, } = steps.pop();
        if (cache.get(numbers)) {
            const result = cache.get(numbers);
            if (result.status !== BINGO) {
                continue;
            }
            return result.result;
        }
        if (endGuard) {
            cache.set(numbers, {
                status: IMPOSSIBLE,
            });
            continue;
        }
        if (numbers.length <= 2) {
            console.log(`${numbers.join(',')}: start`)
            const result = await evaluateChain.invoke({
                input: numbers.join(' '),
            });
            console.log(`${numbers.join(',')}: end`)
            if (/(?:\n|^)(.+ = 24)(?:\n|$)/.exec(result)) {
                return parseResult(result, map);
            }
            cache.set(numbers, {
                status: IMPOSSIBLE,
            });
            continue;
        }
        console.log(`${numbers.join(',')}: start`)
        const result = await getProposeChain(numbers.length === 4 ? 4 : 3).invoke({
            input: numbers.join(' '),
        });
        console.log(`${numbers.join(',')}: end, added ${result.length} items`)
        if (result.length) {
            // 如果遍历到了endGuard，说明numbers不能凑出24
            // 深度优先遍历
            steps.push({
                numbers,
                endGuard: true,
            });
            result.forEach(item => {
                steps.push({
                    numbers: item.numbers,
                    map: [
                        ...item.map,
                        ...map,
                    ]
                })
            });
        }
    }
    return IMPOSSIBLE;
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
while (true) {
    cache.save();
    const line = await rl.question('请输入4个数字(1 2 3 4)：');
    if (line.trim() === 'exit') {
        rl.close();
        break;
    }
    const numbers = parseNumbers(line);
    if (numbers.length !== 4 || numbers.some(Number.isNaN)) {
        console.log('输入格式错误\n');
    }
    const result = await run(numbers);
    console.log(chalk.green(`${numbers.join(',')}: ${result}`));
}
