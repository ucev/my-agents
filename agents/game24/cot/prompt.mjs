import { ChatPromptTemplate } from "@langchain/core/prompts";

export const propose4Prompt = ChatPromptTemplate.fromTemplate(`
Given 4 numbers, propose possible next steps to reach 24.
Each step should be in the format:
<step_number>. <operation> = <result> (left: remaining_numbers)

!!! remaining_numbers should have 3 numbers !!!

Example:
Input: 2 8 8 14
Possible next steps:
1. 2 + 8 = 10 (left: 8 10 14)
2. 2 + 14 = 16 (left: 8 8 16)
3. 8 + 14 = 22 (left: 2 8 22)
4. 8 - 2 = 6 (left: 6 8 14)
5. 14 - 2 = 12 (left: 8 8 12)
6. 14 - 8 = 6 (left: 2 6 8)
7. 2 * 8 = 16 (left: 8 14 16)
8. 2 * 14 = 28 (left: 8 8 28)
9. 8 * 14 = 112 (left: 2 8 112)
10. 8 / 2 = 4 (left: 4 8 14)
11. 14 / 2 = 7 (left: 7 8 8)
12: 14 / 8 = 1.75 (left: 1.75 2 8)

Input: {input}
Possible next steps:
`)

export const propose3Prompt = ChatPromptTemplate.fromTemplate(`
Given 3 numbers, propose possible next steps to reach 24.
Each step should be in the format:
<step_number>. <operation> = <result> (left: remaining_numbers)

!!!You could only generate results in the above format!!!
!!!NOT NOT OUTPUT ANYTING ELSE!!!

Example:

Input: 2 3 6
Possible next steps:
1. 2 + 3 = 5 (left: 5 6)
2. 2 + 6 = 8 (left: 3 8)
3. 3 + 6 = 9 (left: 2 9)
4. 3 - 2 = 1 (left: 1 6)
5. 6 - 2 = 4 (left: 3 4)
6. 6 - 3 = 3 (left: 2 3)
7. 2 * 3 = 6 (left: 6 6)
8. 2 * 6 = 12 (left: 3 12)
9. 3 * 6 = 18 (left: 2 18)
10. 3 / 2 = 1.5 (left: 1.5 6)
11. 6 / 2 = 3 (left: 3 3)
12. 6 / 3 = 2 (left: 2 2)

Input: {input}
Possible next steps:
`)

export const evaluatePrompt = ChatPromptTemplate.fromTemplate(`
Evaluate if the solution can reach 24 using basic arithmatic operations(+ - * /)
!!!You Can only use numbers in the input to calc output!!!
!!!Each number can be used only once.!!!
Return bingo/impossible

Examples:
10 14
10 * 14 = 140
14 - 10 = 4
14 / 10 = 1.4
10 + 14 = 24
bingo

4 6
4 + 6 = 10
4 * 6 = 24
bingo

11 12
11 + 12 = 23
11 * 12 = 132
12 - 11 = 1
12 / 11 = 1.09
impossible

6 8
6 + 8 = 14
8 - 6 = 2
8 / 6 = 1.33
8 * 6 = 48

{input}
`)