---
id: 01KY8H425J0XMMSJJHH5NNT0GS
url: https://minimal-agent.com/
title: Minimal AI agent tutorial
---

## Building a minimal AI agent from scratch

for software engineering, terminal use, and more

**Authors:** Kilian Lieret, Carlos Jimenez, John Yang, Ofir Press.

**Contributors:**[Cesar Garcia](https://github.com/Chesars), [piot](https://github.com/piotx)

**( [Contribute to this guide](#contribute-to-this-guide) )**

So you want to build your own AI agent from scratch? The good news: It's super simple, especially with more recent language models. We won't be using any external packages (other than to query the LM), and our initial minimal agent is only some 60 lines long.

And if you think this is too simplified and can never work in practice: Our [`mini` agent](https://mini-swe-agent.com) is built exactly the same, and is used for research at Princeton, Stanford, NVIDIA, Anyscale, essentials.ai and more. Using this simple guide you can score up to 74% on [SWE-bench verified](https://www.swebench.com/), only a few percent below highly optimized agents.

## Our first prototype in 50 lines[¶](#our-first-prototype-in-50-lines "Permanent link")

Let's get started: From a top level view, an AI agent is just a big loop: You start with a prompt, the agent proposes an action, you execute the action, tell the LM the output, and then repeat. To keep track of what have happend we continue to append to the `messages` list.

Pseudocode:

`[](#__codelineno-0-1)messages = [{"role": "user", "content": "Help me fix the ValueError in main.py"}] [](#__codelineno-0-2)while True:     [](#__codelineno-0-3)    lm_output = query_lm(messages)    [](#__codelineno-0-4)    print("LM output", output)    [](#__codelineno-0-5)    messages.append({"role": "assistant", "content": lm_output})  # remember what the LM said    [](#__codelineno-0-6)    action = parse_action(lm_output)  # separate the action from output    [](#__codelineno-0-7)    print("Action", action)    [](#__codelineno-0-8)    if action == "exit":        [](#__codelineno-0-9)        break    [](#__codelineno-0-10)    output = execute_action(action)    [](#__codelineno-0-11)    print("Output", output)    [](#__codelineno-0-12)    messages.append({"role": "user", "content": output})  # send command output back`

What's up with the `role` field?

The `role` field indicates who sent the message in the conversation. Common roles are:

*   `"user"` - Messages from the user/human
*   `"assistant"` - Messages from the AI model
*   `"system"` - System prompts that set context/instructions

Different LM APIs may have slightly different conventions for how to structure these messages.

So to get this to work, we only need to implement three things:

1.  Querying the LM API (this can get annoying if you want to support all LMs, or want detailed cost information, but is very simple if you already know which model you want)
2.  Parsing the action (`parse_action`). You don't need this if you use the tool calling functionality of your LM if it supports it, but this is more provider-specific, so we wo'nt cover it in this guide for now (don't worry, the performance should not be impacted by this).
3.  Executing the action (very simple, in our case we will simply execute any action of the LM as a bash-command in the terminal).

### Querying the LM[¶](#querying-the-lm "Permanent link")

Let's start with the first step. Click on the tabs to find the right LM for you. `litellm` supports most specific LMs, so this is a good default option if your LM is not explicitly mentioned.

OpenAIAnthropicOpenRouterLiteLLMGLM

Install the [OpenAI package](https://pypi.org/project/openai/) ([docs](https://platform.openai.com/docs/api-reference)):

Here's the minimal code to query the API:

`[](#__codelineno-2-1)from openai import OpenAI [](#__codelineno-2-2)[](#__codelineno-2-3)client = OpenAI(     [](#__codelineno-2-4)    api_key="your-api-key-here" [](#__codelineno-2-5))  # or set OPENAI_API_KEY env var [](#__codelineno-2-6)[](#__codelineno-2-7)def query_lm(messages):     [](#__codelineno-2-8)    response = client.responses.create(        [](#__codelineno-2-9)        model="gpt-5.1",        [](#__codelineno-2-10)        input=messages    [](#__codelineno-2-11)    )    [](#__codelineno-2-12)    return response.output_text`

Install the [Anthropic package](https://pypi.org/project/anthropic/) ([docs](https://docs.anthropic.com/en/api)):

Here's the minimal code to query the API:

`[](#__codelineno-4-1)from anthropic import Anthropic [](#__codelineno-4-2)[](#__codelineno-4-3)client = Anthropic(     [](#__codelineno-4-4)    api_key="your-api-key-here" [](#__codelineno-4-5))  # or set ANTHROPIC_API_KEY env var [](#__codelineno-4-6)[](#__codelineno-4-7)def query_lm(messages):     [](#__codelineno-4-8)    response = client.messages.create(        [](#__codelineno-4-9)        model="claude-sonnet-4.5",        [](#__codelineno-4-10)        max_tokens=4096,        [](#__codelineno-4-11)        messages=messages    [](#__codelineno-4-12)    )    [](#__codelineno-4-13)    return response.content[0].text`

Install the [OpenAI package](https://pypi.org/project/openai/) ([OpenRouter docs](https://openrouter.ai/docs)) - OpenRouter uses OpenAI-compatible API:

Here's the minimal code to query the API:

`[](#__codelineno-6-1)from openai import OpenAI [](#__codelineno-6-2)[](#__codelineno-6-3)client = OpenAI(     [](#__codelineno-6-4)    base_url="https://openrouter.ai/api/v1",    [](#__codelineno-6-5)    api_key="your-api-key-here" [](#__codelineno-6-6))  # or set OPENROUTER_API_KEY env var [](#__codelineno-6-7)[](#__codelineno-6-8)def query_lm(messages):     [](#__codelineno-6-9)    response = client.chat.completions.create(        [](#__codelineno-6-10)        model="anthropic/claude-3.5-sonnet",  # or any model on OpenRouter        [](#__codelineno-6-11)        messages=messages    [](#__codelineno-6-12)    )    [](#__codelineno-6-13)    return response.choices[0].message.content`

Install the [LiteLLM package](https://pypi.org/project/litellm/) ([docs](https://docs.litellm.ai/)) - supports 100+ LLM providers:

Here's the minimal code to query the API:

`[](#__codelineno-8-1)from litellm import completion [](#__codelineno-8-2)[](#__codelineno-8-3)def query_lm(messages: list[dict[str, str]]) -> str:     [](#__codelineno-8-4)    response = completion(        [](#__codelineno-8-5)        model="openai/gpt-5.1",  # can be any provider + model        [](#__codelineno-8-6)        messages=messages    [](#__codelineno-8-7)    )    [](#__codelineno-8-8)    return response.choices[0].message.content`

Install the [Zhipu AI package](https://pypi.org/project/zhipuai/) ([docs](https://open.bigmodel.cn/dev/api)):

Here's the minimal code to query the API:

`[](#__codelineno-10-1)from zhipuai import ZhipuAI [](#__codelineno-10-2)[](#__codelineno-10-3)client = ZhipuAI(     [](#__codelineno-10-4)    api_key="your-api-key-here" [](#__codelineno-10-5))  # or set ZHIPUAI_API_KEY env var [](#__codelineno-10-6)[](#__codelineno-10-7)def query_lm(messages):     [](#__codelineno-10-8)    response = client.chat.completions.create(        [](#__codelineno-10-9)        model="glm-4-plus",        [](#__codelineno-10-10)        messages=messages    [](#__codelineno-10-11)    )    [](#__codelineno-10-12)    return response.choices[0].message.content`

How to set environment variables

Instead of hardcoding your API key in the code, you can set it as an environment variable. Note that these commands set the variable only for your current terminal session (not persistent).

Linux/macOSWindows (CMD)Windows (PowerShell)

`[](#__codelineno-11-1)export OPENAI_API_KEY="your-api-key-here" [](#__codelineno-11-2)export ANTHROPIC_API_KEY="your-api-key-here" [](#__codelineno-11-3)export GOOGLE_API_KEY="your-api-key-here"`

To make persistent, add to `~/.bashrc`, `~/.zshrc`, or your shell config file.

`[](#__codelineno-12-1)set OPENAI_API_KEY=your-api-key-here [](#__codelineno-12-2)set ANTHROPIC_API_KEY=your-api-key-here [](#__codelineno-12-3)set GOOGLE_API_KEY=your-api-key-here`

To make persistent, use "Environment Variables" in System Properties.

`[](#__codelineno-13-1)$env:OPENAI_API_KEY="your-api-key-here" [](#__codelineno-13-2)$env:ANTHROPIC_API_KEY="your-api-key-here" [](#__codelineno-13-3)$env:GOOGLE_API_KEY="your-api-key-here"`

To make persistent, use "Environment Variables" in System Properties.

Alternatively, you can use a `.env` file with [python-dotenv](https://pypi.org/project/python-dotenv/).

Type hints in python

In case you're wondering about the `list[dict[str, str]]` and the `-> str` in the previous code example, these are "type hints" and they are optional in python, but they help your IDE or static checker (or even just yourself) to understand the inputs and outputs of the function.

Let's test it

Here's a quick test to verify your LM query function works:

`[](#__codelineno-14-1)messages = [{"role": "user", "content": "Roll a d20"}] [](#__codelineno-14-2)print(query_lm(messages))`

You should see the model's response, something like a dice roll result or explanation!

In production

If you want to see how this is done in production, check out the model classes in [mini](https://github.com/swe-agent/mini-swe-agent/blob/main/src/minisweagent/models/):

*   [LiteLLM model](https://github.com/swe-agent/mini-swe-agent/blob/main/src/minisweagent/models/litellm_model.py)
*   [OpenRouter model](https://github.com/swe-agent/mini-swe-agent/blob/main/src/minisweagent/models/openrouter_model.py)

### Parse the action[¶](#parse-the-action "Permanent link")

Let's parse the action. There's two simple ways in which the LM can "encode" the action (again, you don't need this if you use tool calls, but in this tutorial we'll keep it simpler):

Triple-backticksXML-style

This is inspired by markdown codeblocks:

` Some thoughts of the LM explaining the action and the action below  ```bash-action cd /path/to/project && ls ``` `

`[](#__codelineno-16-1)Some thoughts of the LM explaining the action and the action below [](#__codelineno-16-2)[](#__codelineno-16-3)<bash_action>cd /path/to/project && ls</bash_action>`

For most models, either way works well and we recommend using triple backticks. However, some models (especially small or open source models) are slightly less general and you might try either. Here's a quick regular expression to parse the action:

Triple-backticksXML-style

`[](#__codelineno-17-1)import re [](#__codelineno-17-2)[](#__codelineno-17-3)def parse_action(lm_output: str) -> str:     [](#__codelineno-17-4)    """Take LM output, return action"""    [](#__codelineno-17-5)    matches = re.findall(        [](#__codelineno-17-6)        r"```bash-action\s*\n(.*?)\n```",        [](#__codelineno-17-7)        lm_output,        [](#__codelineno-17-8)        re.DOTALL    [](#__codelineno-17-9)    )    [](#__codelineno-17-10)    return matches[0].strip() if matches else ""`

Let's test it

Here's a quick test to verify our parsing function works correctly:

`[](#__codelineno-18-1)test_output = """I'll list the files in the current directory. [](#__codelineno-18-2)[](#__codelineno-18-3)```bash-action [](#__codelineno-18-4)ls -la [](#__codelineno-18-5)``` [](#__codelineno-18-6)""" [](#__codelineno-18-7)[](#__codelineno-18-8)print(parse_action(test_output))`

`[](#__codelineno-19-1)import re [](#__codelineno-19-2)[](#__codelineno-19-3)def parse_action(lm_output: str) -> str:     [](#__codelineno-19-4)    """Take LM output, return action"""    [](#__codelineno-19-5)    matches = re.findall(        [](#__codelineno-19-6)        r"<bash_action>(.*?)</bash_action>",        [](#__codelineno-19-7)        lm_output,        [](#__codelineno-19-8)        re.DOTALL    [](#__codelineno-19-9)    )    [](#__codelineno-19-10)    return matches[0].strip() if matches else ""`

Let's test it

Here's a quick test to verify our parsing function works correctly:

`[](#__codelineno-20-1)test_output = """I'll list the files in the current directory. [](#__codelineno-20-2)[](#__codelineno-20-3)<bash_action>ls -la</bash_action> [](#__codelineno-20-4)""" [](#__codelineno-20-5)[](#__codelineno-20-6)print(parse_action(test_output))`

Understanding the regular expression

*   `r"..."` - **Raw string**: The `r` prefix makes it a raw string, so backslashes are treated literally. Without it, you'd need to write `\\n` instead of `\n`, `\\s` instead of `\s`, etc.
*   `(.*?)` - **Capturing group** with non-greedy matching: The parentheses `()` capture the content we want to extract. The `.*?` matches any characters, but `?` makes it stop at the first closing pattern (non-greedy) rather than the last.
*   `re.DOTALL` flag - Makes `.` match newlines too, allowing multi-line commands to be captured.

`findall` returns only what's inside the parentheses, not the surrounding markers.

In production

If you want to see how this is done in production, check out the [parse\_action implementation in default.py](https://github.com/swe-agent/mini-swe-agent/blob/main/src/minisweagent/agents/default.py) in mini-swe-agent.

### Execute the action[¶](#execute-the-action "Permanent link")

Now as for executing the action, it's actually very simple, we can just use python's `subprocess` module (or just `os.system`, though that's generally less recommended)

`[](#__codelineno-21-1)import subprocess [](#__codelineno-21-2)import os [](#__codelineno-21-3)[](#__codelineno-21-4)def execute_action(command: str) -> str:     [](#__codelineno-21-5)    """Execute action, return output"""    [](#__codelineno-21-6)    result = subprocess.run(        [](#__codelineno-21-7)        command,        [](#__codelineno-21-8)        shell=True,        [](#__codelineno-21-9)        text=True,        [](#__codelineno-21-10)        env=os.environ,        [](#__codelineno-21-11)        encoding="utf-8",        [](#__codelineno-21-12)        errors="replace",        [](#__codelineno-21-13)        stdout=subprocess.PIPE,        [](#__codelineno-21-14)        stderr=subprocess.STDOUT,        [](#__codelineno-21-15)        timeout=30,    [](#__codelineno-21-16)    )    [](#__codelineno-21-17)    return result.stdout`

Understanding `subprocess.run` arguments

Let's break down the keyword arguments we're using:

*   `shell=True` - Allows running arbitrary shell commands given as a string (like `cd`, `ls`, pipes, etc.). Be careful with untrusted input!
*   `text=True` - Returns output as strings instead of bytes
*   `env=os.environ` - Passes the current environment variables to the subprocess
*   `encoding="utf-8"` - Specifies UTF-8 encoding for text output
*   `errors="replace"` - Replaces invalid characters instead of raising errors
*   `stdout=subprocess.PIPE` - Captures standard output
*   `stderr=subprocess.STDOUT` - Redirects stderr to stdout (so we capture both in one stream)
*   `timeout=30`: Stop executing after

In production

If you want to see how this is done in production, check out mini-swe-agent's environment classes:

*   [Local environment](https://github.com/swe-agent/mini-swe-agent/blob/main/src/minisweagent/environments/local.py) - the closest equivalent to the code above
*   [Docker environment](https://github.com/swe-agent/mini-swe-agent/blob/main/src/minisweagent/environments/docker.py) - almost the same as local, except commands are executed via `docker exec` instead of `subprocess.run`

There are a couple of limitations to this:

1.  The agent will not be able to `cd` to a different environment
2.  The agent cannot persist environment variables easily

However, in practice, we have found these limitations to be not very limiting at all. In fact, reducing the amount of hidden state and forcing the agent to work with absolute paths might well be helpful for language models in many instances. It is also similar with `ClaudeCode` (while it can change directories, it cannot persist environment variables, because it similarly uses subshells to execute commands).

### Add a system prompt[¶](#add-a-system-prompt "Permanent link")

We still need to tell the LM a bit more about how to behave:

`[](#__codelineno-22-1)messages = [{     [](#__codelineno-22-2)    "role": "system",    [](#__codelineno-22-3)    "content": "You are a helpful assistant. When you want to run a command, wrap it in ```bash-action\n<command>\n```. To finish, run the exit command." [](#__codelineno-22-4)} [](#__codelineno-22-5)]`

### Let's put it together & run it![¶](#lets-put-it-together-run-it "Permanent link")

You should now have code that looks something like this (this example uses litellm + triple backticks):

 [1](#__codelineno-23-1)
 [2](#__codelineno-23-2)
 [3](#__codelineno-23-3)
 [4](#__codelineno-23-4)
 [5](#__codelineno-23-5)
 [6](#__codelineno-23-6)
 [7](#__codelineno-23-7)
 [8](#__codelineno-23-8)
 [9](#__codelineno-23-9)
[10](#__codelineno-23-10)
[11](#__codelineno-23-11)
[12](#__codelineno-23-12)
[13](#__codelineno-23-13)
[14](#__codelineno-23-14)
[15](#__codelineno-23-15)
[16](#__codelineno-23-16)
[17](#__codelineno-23-17)
[18](#__codelineno-23-18)
[19](#__codelineno-23-19)
[20](#__codelineno-23-20)
[21](#__codelineno-23-21)
[22](#__codelineno-23-22)
[23](#__codelineno-23-23)
[24](#__codelineno-23-24)
[25](#__codelineno-23-25)
[26](#__codelineno-23-26)
[27](#__codelineno-23-27)
[28](#__codelineno-23-28)
[29](#__codelineno-23-29)
[30](#__codelineno-23-30)
[31](#__codelineno-23-31)
[32](#__codelineno-23-32)
[33](#__codelineno-23-33)
[34](#__codelineno-23-34)
[35](#__codelineno-23-35)
[36](#__codelineno-23-36)
[37](#__codelineno-23-37)
[38](#__codelineno-23-38)
[39](#__codelineno-23-39)
[40](#__codelineno-23-40)
[41](#__codelineno-23-41)
[42](#__codelineno-23-42)
[43](#__codelineno-23-43)
[44](#__codelineno-23-44)
[45](#__codelineno-23-45)
[46](#__codelineno-23-46)
[47](#__codelineno-23-47)
[48](#__codelineno-23-48)
[49](#__codelineno-23-49)
[50](#__codelineno-23-50)
[51](#__codelineno-23-51)
[52](#__codelineno-23-52)
[53](#__codelineno-23-53)
[54](#__codelineno-23-54)
[55](#__codelineno-23-55)
[56](#__codelineno-23-56)

`import re import subprocess import os from litellm import completion def query_lm(messages: list[dict[str, str]]) -> str:     response = completion(        model="openai/gpt-5.1",        messages=messages    )    return response.choices[0].message.content def parse_action(lm_output: str) -> str:     """Take LM output, return action"""    matches = re.findall(        r"```bash-action\s*\n(.*?)\n```",        lm_output,        re.DOTALL    )    return matches[0].strip() if matches else "" def execute_action(command: str) -> str:     """Execute action, return output"""    result = subprocess.run(        command,        shell=True,        text=True,        env=os.environ,        encoding="utf-8",        errors="replace",        stdout=subprocess.PIPE,        stderr=subprocess.STDOUT,        timeout=30,    )    return result.stdout # Main agent loop messages = [{     "role": "system",    "content": "You are a helpful assistant. When you want to run a command, wrap it in ```bash-action\n<command>\n```. To finish, run the exit command." }, {     "role": "user",    "content": "List the files in the current directory" }] while True:     lm_output = query_lm(messages)    print("LM output", lm_output)    messages.append({"role": "assistant", "content": lm_output})  # remember what the LM said    action = parse_action(lm_output)  # separate the action from output    print("Action", action)    if action == "exit":        break    output = execute_action(action)    print("Output", output)    messages.append({"role": "user", "content": output})  # send command output back`

## Let's make it more robust[¶](#lets-make-it-more-robust "Permanent link")

The following sections are some tweaks to improve performance. Nothing fancy, just making sure that the agent doesn't get stuck and can deal with things that go wrong. This section is a bit more advanced. Instead of showing the complete code at the end, we encourage everyone to check out the [source code](https://github.com/SWE-agent/mini-swe-agent/) of our `mini` agent; it includes all of these features with very little fluff around it (also see the next section to get started with reading the code).

### Dealing with exceptions in the control flow[¶](#dealing-with-exceptions-in-the-control-flow "Permanent link")

The idea here: Whenever a known exception arises (timeouts, format errors, etc.), let's just tell the LM and let it handle it itself. This means adapting our `while` loop a bit:

`[](#__codelineno-24-1)while True:     [](#__codelineno-24-2)    try:        [](#__codelineno-24-3)        # previous content    [](#__codelineno-24-4)    except Exception as e:        [](#__codelineno-24-5)        messages.append({"role": "user", "content": str(e)})`

That's it!

For example, if the agent does something stupid (like calling `vim`) and a `TimeoutError` is triggered, this will cause the error message to be appended to the messages and the LM can pick up from there, hopefully realizing what it did wrong.

However, we might only limit this behavior to some known problems or add more information to the message. In this case, we can be more specific, for example

`[](#__codelineno-25-1)class OurTimeoutError(RuntimeError): ... [](#__codelineno-25-2)[](#__codelineno-25-3)def execute_action(action: str) -> str:     [](#__codelineno-25-4)    try:        [](#__codelineno-25-5)        # as before    [](#__codelineno-25-6)    except TimeoutError as e:        [](#__codelineno-25-7)        raise OurTimeoutError("Your last command time out, you might want to ...") from e`

and just like this, we've added additional information for the LM.

You might also want to be more specific with what exceptions are handed to the LM and which just cause the program to crash. In this case it might make sense to define a custom exception class and only catch that in the `while` loop:

`[](#__codelineno-26-1)class NonterminatingException(RuntimeError): ... [](#__codelineno-26-2)class OurTimeoutError(NonterminatingException): ... [](#__codelineno-26-3)[](#__codelineno-26-4)while True:     [](#__codelineno-26-5)    try:        [](#__codelineno-26-6)        ...    [](#__codelineno-26-7)    except NonterminatingException as e:        [](#__codelineno-26-8)        ...`

mini-swe-agent additionally [defines](https://github.com/swe-agent/mini-swe-agent/blob/main/src/minisweagent/agents/default.py#L33-L53) a `TerminatingException` class which is used instead of the `if action == "exit"` mechanism to stop the `while` loop in a graceful way:

`[](#__codelineno-27-1)class TerminatingException(RuntimeError): ... [](#__codelineno-27-2)class Submitted: ...  # agent wants to stop [](#__codelineno-27-3)[](#__codelineno-27-4)def execute_action(action: str) -> str:     [](#__codelineno-27-5)    if action == "exit":        [](#__codelineno-27-6)        raise TerminatingException("LM requested to quit")    [](#__codelineno-27-7)    ... [](#__codelineno-27-8)[](#__codelineno-27-9)while True:     [](#__codelineno-27-10)    try:        [](#__codelineno-27-11)        ...    [](#__codelineno-27-12)    except NonterminatingException as e:        [](#__codelineno-27-13)        ...    [](#__codelineno-27-14)    except TerminatingException as e:        [](#__codelineno-27-15)        print("Stopping because of ", str(e))        [](#__codelineno-27-16)        break`

### Handling malformatted outputs[¶](#handling-malformatted-outputs "Permanent link")

Sometimes (especially with weaker LMs), the LM will not properly format it's action. It's good to remind it about the correct way in that case: This should be very straightforward now that we have the general exception handling in place:

`[](#__codelineno-28-1)incorrect_format_message = """Your output was malformated. [](#__codelineno-28-2)Please include exactly 1 action formatted as in the following example: [](#__codelineno-28-3)[](#__codelineno-28-4)```bash-action [](#__codelineno-28-5)ls -R [](#__codelineno-28-6)``` [](#__codelineno-28-7)""" [](#__codelineno-28-8)class FormatError(RuntimeError): ... [](#__codelineno-28-9)[](#__codelineno-28-10)def parse_action(action: str) -> str:    [](#__codelineno-28-11)   matches = ...   [](#__codelineno-28-12)   if not len(matches) == 1:       [](#__codelineno-28-13)       raise FormatError(incorrect_format_message)   [](#__codelineno-28-14)   ...`

### Environment variables[¶](#environment-variables "Permanent link")

There's a couple of environment variables that we can set to disable interactive elements in command line tools that avoid the agent getting stuck (you can see them being set in the [`mini-swe-agent` SWE-bench config](https://github.com/swe-agent/mini-swe-agent/blob/main/src/minisweagent/config/extra/swebench.yaml)):

`[](#__codelineno-29-1)env_vars = {     [](#__codelineno-29-2)    "PAGER": "cat",    [](#__codelineno-29-3)    "MANPAGER": "cat",    [](#__codelineno-29-4)    "LESS": "-R",    [](#__codelineno-29-5)    "PIP_PROGRESS_BAR": "off",    [](#__codelineno-29-6)    "TQDM_DISABLE": "1", [](#__codelineno-29-7)} [](#__codelineno-29-8)[](#__codelineno-29-9)# ... [](#__codelineno-29-10)[](#__codelineno-29-11)def execute_action(command: str) -> str:     [](#__codelineno-29-12)    # ...    [](#__codelineno-29-13)    result = subprocess.run(        [](#__codelineno-29-14)        command,        [](#__codelineno-29-15)        # ...        [](#__codelineno-29-16)        env=os.environ | env_vars        [](#__codelineno-29-17)        # ... [](#__codelineno-29-18))`

## mini-swe-agent[¶](#mini-swe-agent "Permanent link")

[`mini-swe-agent`](https://github.com/swe-agent/mini-swe-agent) is built exactly according to the blueprint of this tutorial and it should be very easy for you to understand it's source code. The only important thing to note is that it is built more modular, so that you can swap out all components.

The `Agent` class ([full code](https://github.com/swe-agent/mini-swe-agent/blob/main/src/minisweagent/agents/default.py)) contains the big `while` loop in the `run` function

`[](#__codelineno-30-1)class Agent:     [](#__codelineno-30-2)    def __init__(self, model, environment):        [](#__codelineno-30-3)        self.model = model        [](#__codelineno-30-4)        self.environment = environment        [](#__codelineno-30-5)        ...  [](#__codelineno-30-6)    [](#__codelineno-30-7)    def run(self, task: str):        [](#__codelineno-30-8)        while True:            [](#__codelineno-30-9)            ...`

The model class ([example for litellm](https://github.com/swe-agent/mini-swe-agent/blob/main/src/minisweagent/models/litellm_model.py)) handles different LMs

`[](#__codelineno-31-1)class Model:     [](#__codelineno-31-2)    def query(messages: list[dict[str, str]]):        [](#__codelineno-31-3)        ...`

and the environment class ([local environment](https://github.com/swe-agent/mini-swe-agent/blob/main/src/minisweagent/environments/local.py)) executes actions:

`[](#__codelineno-32-1)class Environment:     [](#__codelineno-32-2)    def execute(command: str):        [](#__codelineno-32-3)        ...`

`mini-swe-agent` provides different environment classes that for example allow to execute actions in docker containers instead of directly in your local environment. Sonds more complicated? It really isn't: all we do is switch from `subprocess.run` to calls to `docker exec`.

## Contribute to this guide[¶](#contribute-to-this-guide "Permanent link")

We welcome contributions [on GitHub](https://github.com/swe-agent/minimal-agent-tutorial) to improve this guide!

Contribution

The following PRs will be merged immediately

*   Bug fixes
*   Typo fixes

The following PRs are much appreciated and will most likely be merged fast:

*   Adding support to popular LMs that aren't mentioned yet (please make sure test your implementation)

The following things should be discussed first (via github issue):

*   Additional sections
*   Significant expansions of sections

Please understand that the larger your changes are, the more time we will need to review and the less likely it is we can accept them (unless we discussed beforehand).

To contribute:

*   Fork the repository
*   Make your changes
*   Submit a pull request

You can find the source code on GitHub.

If you have questions or comments, please comment below. Note that [GitHub issues](https://github.com/swe-agent/minimal-agent-tutorial/issues) are still preferred for bug reports and discussions about further developing this page.
