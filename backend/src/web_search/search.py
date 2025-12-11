from langchain_tavily import TavilySearch
import os, json
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()

# Initializing API keys
if not os.environ.get("TAVILY_API_KEY"):
    os.environ["TAVILY_API_KEY"] = os.getenv("TAVILY_API_KEY")
os.environ["GOOGLE_API_KEY"]= os.getenv("GEMINI_API_KEY")

# Initializing models and tools
client = OpenAI(
    api_key=os.getenv("GEMINI_API_KEY"),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)
tool = TavilySearch(
    max_results=3,
    # topic="general",
    # include_answer=False,
    # include_raw_content=False,
    # include_images=False,
    # include_image_descriptions=False,
    # search_depth="basic",
    # time_range="day",
    # include_domains=None,
    # exclude_domains=None
)

def clean_web_context(query):
    res = tool.invoke({"query": query})
    cleaned_context = get_context(res)
    return cleaned_context

def get_context(res):
    """Extracts the context from the response."""
    # print(type(res)) this is a dict
    print(res['query'])
    context = ''
    for i, result in enumerate(res['results']):
        context += f'\n\nTitle - {i}:{result['title']}\nDetails: {result['content']}'
    
    return context

def process_query(query, res):
    context = get_context(res)
    # Injest in AI
    SYSTEM_PROMPT = f"""You are a helpful assistant. You answer to User Queries only using data from Context. If not found relevant answer, say "I don't know".\nContext: {context}
    """

    # models = client.models.list()
    # for model in models.data:
    #     print(model.id)

    response = client.chat.completions.create(
        model="gemini-2.5-flash",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": query}
        ]
    )
    # print(response.choices[0].message.content)

    return response.choices[0].message.content


if __name__ == "__main__":
    try:
        query = "Tell me weather in Hyderabad?"
        res = tool.invoke({"query": query})
        ans = process_query(query, res)
        print(ans)
    except Exception as e:
        print(f"Error: {e}")


