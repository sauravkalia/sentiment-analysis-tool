import os
import openai
import requests
from bs4 import BeautifulSoup
import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Correct OpenAI API key handling
openai.api_key = os.getenv("OPENAI_API_KEY")

def get_market_news():
    """Scrapes stock market news from MoneyControl."""
    url = "https://www.moneycontrol.com/news/business/markets/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"
    }
    response = requests.get(url, headers=headers)
    
    if response.status_code != 200:
        print("🔴 ERROR: Failed to fetch news.")
        return []
    
    soup = BeautifulSoup(response.text, "html.parser")

    headlines = []
    for news in soup.select("li.clearfix a")[:10]:  # Adjusted selector
        try:
            title = news.get_text(strip=True)
            link = news["href"]
            if title and link:
                headlines.append({"title": title, "link": link})
        except Exception as e:
            print(f"🔴 ERROR extracting headline: {str(e)}")

    return headlines

def analyze_sentiment(news_headlines):
    """Runs sentiment analysis using OpenAI GPT-4 API, optimized for token cost."""
    sentiments = []

    # 🔹 Combine multiple headlines into a single request
    news_titles = [f"{index + 1}. {news['title']}" for index, news in enumerate(news_headlines)]
    batch_prompt = f"Analyze the sentiment of the following stock market news:\n\n" + "\n".join(news_titles)
    batch_prompt += "\n\nReply with the sentiment for each, numbered accordingly: Positive, Neutral, or Negative."

    print(f"🟢 DEBUG: Sending Batch Prompt to OpenAI:\n{batch_prompt}")

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a financial assistant analyzing stock market news sentiment. Reply with only: Positive, Neutral, or Negative."},
                {"role": "user", "content": batch_prompt}
            ],
            temperature=0.3
        )

        sentiment_response = response["choices"][0]["message"]["content"].strip()
        print(f"🟢 DEBUG: OpenAI Batch Response:\n{sentiment_response}")

        # 🔹 Parse Sentiment Responses
        sentiment_lines = sentiment_response.split("\n")
        for i, news in enumerate(news_headlines):
            try:
                sentiment = sentiment_lines[i].split(". ")[1]  # Extract sentiment
            except IndexError:
                sentiment = "Error"

            news["sentiment"] = sentiment
            sentiments.append(news)

    except Exception as e:
        print(f"🔴 ERROR in OpenAI API call: {str(e)}")
        for news in news_headlines:
            news["sentiment"] = "Error"
            sentiments.append(news)

    return sentiments

def run_sentiment_analysis():
    """Runs the entire sentiment analysis pipeline"""
    news_headlines = get_market_news()
    if not news_headlines:
        return {"date": str(datetime.date.today()), "sentiments": []}

    sentiments = analyze_sentiment(news_headlines)
    return {"date": str(datetime.date.today()), "sentiments": sentiments}