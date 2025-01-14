import { getModel } from '../../../utils.mjs'
import { DynamicStructuredTool, DynamicTool } from 'langchain/tools'
import { z } from 'zod'
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts'
// import { createReactAgent } from 'langchain/agents'
import { Calculator } from "@langchain/community/tools/calculator";
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { RunnableSequence } from '@langchain/core/runnables';
import { getPoints24 } from './utils.mjs';

const tools = [
    new DynamicStructuredTool({
        name: 'get_points_24',
        description: '24点计算器，输入4个数字，判断这四个数字是否能通过加减乘除运算得到24',
        schema: z.object({
            numbers: z.number().array().length(4)
        }),
        func: async ({ numbers }) => {
            console.log('--- input, ', numbers);
            if (!Array.isArray(numbers) || numbers.length !== 4) {
                throw new Error('请输入4个数字');
            }
            try {
                return getPoints24(numbers) || `[result] ${numbers.join(',')} 经计算不能得出24点`;
            } catch (err) {
                console.error(err);
                throw err;
            }
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
    HumanMessagePromptTemplate.fromTemplate(`用户输入：\n以下几个数字是不是合法的24点：{input}`),
])
const agent = createReactAgent({
    llm: getModel(),
    tools,
})
const chain = RunnableSequence.from([
    prompt,
    agent,
    (response) => {
        return response.messages[response.messages.length - 1].content
    },
])
console.log(await chain.batch(
    [
        {
            input: '7 7 5 8'
        }, {
            input: '4, 4,6,8'
        }, {
            input: '1 2 3'
        }
    ]
))
