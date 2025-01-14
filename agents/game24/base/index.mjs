import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { getModel } from '../../../utils.mjs'
import { StructuredOutputParser } from '@langchain/core/output_parsers'
import { z } from 'zod'

const model = getModel()
const roleTemplate = SystemMessagePromptTemplate.fromTemplate(`
你是一个解决24点问题的AI助手，你的目标是根据我给你提供的几个数字，判断这几个数字经过加减乘除运算，能否计算出24。如果能计算出24，返回“是”，否则返回“否”
{instructions}
`)
const userTemplate = HumanMessagePromptTemplate.fromTemplate(`请判断这几个字能否计算出24: {input}`);
const chatPrompt = ChatPromptTemplate.fromMessages([
    roleTemplate,
    userTemplate,
])
const outputSchema = z.enum(['是', '否']).describe('能计算出24，返回“是”，否则返回“否”')
const structuredOutputParser = StructuredOutputParser.fromZodSchema(outputSchema);

const chain = chatPrompt.pipe(model).pipe(structuredOutputParser);

console.log(await chain.batch([
    {
        input: '2 2 4 8',
        instructions: structuredOutputParser.getFormatInstructions(),
    },
    {
        input: '5 5 5 1',
        instructions: structuredOutputParser.getFormatInstructions(),
    }
]))
