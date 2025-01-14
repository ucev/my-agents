# 问题

`createOpenAIToolsAgent`在tools的数量为`1`时，可以正确调用tool；`createReactAgent`在tools的数量为1时，不能正确调用tool，此时`Action`的内容为`[tool_name]`，会导致`[tool_name] is not a valid tool, try another one.`错误。正确的`Action`内容应该为`tool_name`。需要对比一下，看看问题出在哪里。


对比之下，这种核心代码自己写，大模型进行`文字识别，意图判断`，准确率和效率都是最高的。

## tool description
从`24点计算器，输入4个数字，判断这四个数字是否能通过加减乘除运算得到24`改成了`24-game calculator`，否则输入数字不足的时候，LLM压根就不会调用这个tool