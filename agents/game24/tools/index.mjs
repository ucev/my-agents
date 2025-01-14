import { getModel } from '../../../utils.mjs'
import { DynamicStructuredTool, DynamicTool } from 'langchain/tools'
import { z } from 'zod'
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts'
// import { createReactAgent } from 'langchain/agents'
import { Calculator } from "@langchain/community/tools/calculator";
import { createReactAgent } from '@langchain/langgraph/prebuilt'

const toNumber = (number) => {
    return Number(Number.parseFloat(number).toFixed(2));
}

const tools = [
    new DynamicTool({
        name: 'get_points_24',
        description: '24点计算器，输入4个数字，判断这四个数字是否能通过加减乘除运算得到24',
        func: async (input) => {
            const getPoints24 = (numbers, steps = [], visited = new Set()) => {
                if (!numbers.length) {
                    return false;
                }
                if (numbers.length === 1) {
                    if (numbers[0] !== 24) {
                        return false;
                    }
                    let formula = ['24'];
                    for (let i = steps.length - 1; i >= 0; i--) {
                        const [k, v] = steps[i];
                        for (let j = 0; j < formula.length; j++) {
                            if (toNumber(formula[j]) === toNumber(k)) {
                                formula[j] = `( ${v} )`;
                                formula = formula.join(' ').split(' ');
                                break;
                            }
                        }
                    }
                    return formula.join(' ');
                }
                const key = numbers.sort((a, b) => a - b).join(',');
                if (visited.has(key)) {
                    return false;
                }
                visited.add(key);
                for (let i = 0; i < numbers.length - 1; i++) {
                    for (let j = i + 1; j < numbers.length; j++) {
                        let vi = numbers[i];
                        let vj = numbers[j];
                        let nums = [...numbers];
                        nums.splice(j, 1);
                        nums.splice(i, 1);
                        let res = getPoints24(
                            [...nums, vi + vj],
                            [
                                ...steps,
                                [vi + vj, `${vi} + ${vj}`],
                            ],
                            visited,
                        ) ||
                            getPoints24(
                                [...nums, vi - vj],
                                [
                                    ...steps,
                                    [vi - vj, `${vi} - ${vj}`],
                                ],
                                visited,
                            ) ||
                            getPoints24(
                                [...nums, vj - vi],
                                [
                                    ...steps,
                                    [vj - vi, `${vj} - ${vi}`],
                                ],
                                visited,
                            ) ||
                            getPoints24(
                                [...nums, vi * vj],
                                [
                                    ...steps,
                                    [vi * vj, `${vi} * ${vj}`],
                                ],
                                visited,
                            ) ||
                            getPoints24(
                                [...nums, vi / vj],
                                [
                                    ...steps,
                                    [vi / vj, `${vi} / ${vj}`],
                                ],
                                visited,
                            ) ||
                            getPoints24(
                                [...nums, vj / vi],
                                [
                                    ...steps,
                                    [vj / vi, `${vj} / ${vi}`],
                                ],
                                visited,
                            );
                        if (res) {
                            return res;
                        }
                    }
                }
                return false;
            };
            const numbers = input.split(/\s+/).map(Number);
            if (numbers.length !== 4) {
                throw new Error('请输入4个数字');
            }
            return getPoints24(numbers) || `[result] ${input} 经计算不能得出24点`;
        }
    }),
    new Calculator(),
];

// [
//     [1, 2, 3, 4],
//     [4, 4, 6, 8],
//     [3, 3, 3, 3],
//     [7, 7, 5, 8],
//     [2, 2, 2, 2],
//     [3, 3, 8, 8],
//     [5, 5, 1, 5],
//     [2, 2, 4, 8],
// ]

// const prompt = ChatPromptTemplate.fromMessages([
//     SystemMessagePromptTemplate.fromTemplate(`你是一个24点计算器，你要求用户输入4个数字，并判断这四个数字是否可以根据加减乘除运算，得到24`),
//     HumanMessagePromptTemplate.fromTemplate(`用户输入：{input}`),
//     new MessagesPlaceholder('agent_scratchpad')
// ])
// const agent = await createOpenAIToolsAgent({
//     llm: getModel(),
//     tools,
//     prompt,
// });

// const prompt = await pull('hwchase17/react')
// const agent = await createReactAgent({
//     llm: getModel(),
//     tools,
//     prompt,
// });



// const agentExecutor = new AgentExecutor({
//     agent,
//     tools,
//     verbose: true,
// })

// const chain = agentExecutor;

// console.log((await chain.invoke({
//     input: '以下几个数字是不是合法的24点：7 7 5 8'
// })).output)


const prompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(`你是一个24点计算器，你要求用户输入4个数字，并判断这四个数字是否可以根据加减乘除运算，得到24`),
    HumanMessagePromptTemplate.fromTemplate(`用户输入：{input}`),
])
const agent = createReactAgent({
    llm: getModel(),
    tools,
})
const chain = prompt.pipe(agent);
const response = await chain.invoke({
    input: '以下几个数字是不是合法的24点：7 7 5 8'
})
console.log(response.messages[response.messages.length - 1].content)
