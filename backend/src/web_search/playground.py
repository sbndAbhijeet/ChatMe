import json, openai


with open('output.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(data['query'])
context = ''
for i, result in enumerate(data['results']):
    context += f'\n\nTitle - {i}:{result['title']}\nDetails: {result['content']}'


print(context)
# print(json.dumps(data, indent=4))

# # pip install -qU langchain "langchain[anthropic]"
# from langchain.agents import create_agent

# def get_weather(city: str) -> str:
#     """Get weather for a given city."""
#     return f"It's always sunny in {city}!"

# agent = create_agent(
#     model="claude-sonnet-4-5-20250929",
#     tools=[get_weather],
#     system_prompt="You are a helpful assistant",
# )

# # Run the agent
# agent.invoke(
#     {"messages": [{"role": "user", "content": "what is the weather in sf"}]}
# )