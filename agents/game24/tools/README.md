# 问题

`createOpenAIToolsAgent`在tools的数量为`1`时，可以正确调用tool；`createReactAgent`在tools的数量为1时，不能正确调用tool，此时`Action`的内容为`[tool_name]`，会导致`[tool_name] is not a valid tool, try another one.`错误。正确的`Action`内容应该为`tool_name`。需要对比一下，看看问题出在哪里。


对比之下，这种核心代码自己写，大模型进行`文字识别，意图判断`，准确率和效率都是最高的。