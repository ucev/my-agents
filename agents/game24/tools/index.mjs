import { getModel } from '../../../utils.mjs'
import { DynamicStructuredTool, DynamicTool } from 'langchain/tools'
import { z } from 'zod'
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts'
// import { createReactAgent } from 'langchain/agents'
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { RunnableSequence } from '@langchain/core/runnables';
import { getPoints24, responseParser, examples } from './utils.mjs';

const tools = [
    new DynamicStructuredTool({
        name: 'get_points_24',
        description: '24-game calculator',
        schema: z.object({
            numbers: z.number().array().length(4, { message: '应该传入4个数字' }).describe('用于计算24点的四个数字')
        }),
        func: async ({ numbers }) => {
            if (!Array.isArray(numbers) || numbers.length !== 4) {
                return `${numbers.join(',')} 不是合法的24点`
            }
            try {
                return getPoints24(numbers) || `[result] ${numbers.join(',')} 经计算不能得出24点`;
            } catch (err) {
                console.error(err);
                throw err;
            }
        }
    }),
    new DynamicTool({
        name: 'default_tool',
        description: 'default tool. Must call this if you don\'t know which tools to call',
        func: () => {
            return '输入不属于合法的24点问题，请输入4个数字'
        }
    })
];

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
    SystemMessagePromptTemplate.fromTemplate(`你是一个24点计算器，你接收用户输入的数字，并判断这些数字是否可以通过计算得到24
    `),
    HumanMessagePromptTemplate.fromTemplate(`用户输入：\n以下几个数字是不是合法的24点：{input}`),
])
const agent = createReactAgent({
    llm: getModel(),
    tools,
    verbose: true,
})
const chain = RunnableSequence.from([
    prompt,
    agent,
    responseParser,
]);

for (const item of examples) {
    console.log('--- ', item);
    try {
        console.log(await chain.invoke({
            input: item.join(' '),
        }))
    } catch (err) {
        console.log(err.message);
    }
}
// console.log(await chain.invoke({
//     input: '1 2 3',
// }))

// console.log(await chain.batch(
//     [
//         {
//             input: '7 7 5 8'
//         }, {
//             input: '4, 4,6,8'
//         }
//     ]
// ))

// console.log(responseParser(await agent.invoke({
//     messages: [
//         { role: 'system', content: '你是一个百科全书，帮助解答用户疑问' },
//         { role: 'user', content: '为什么打雷会下雨' }
//     ]
// })))
