import os
import requests
from bs4 import BeautifulSoup
import openai
import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get OpenAI API Key from .env
openai.api_key = os.getenv("OPENAI_API_KEY")

def get_market_news():
    url = "https://www.moneycontrol.com/news/business/markets/"
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, 'html.parser')

    headlines = []
    for news in soup.select(".clearfix .card")[:10]:  # Get top 10 news articles
        title = news.find("h2").text.strip()
        link = news.find("a")["href"]
        headlines.append({"title": title, "link": link})

    return headlines

def analyze_sentiment(news_headlines):
    sentiments = []

    for news in news_headlines:
        prompt = f"Analyze the sentiment of this stock market news: '{news['title']}'. Reply only with Positive, Neutral, or Negative."
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        sentiment = response["choices"][0]["message"]["content"]
        news["sentiment"] = sentiment
        sentiments.append(news)

    return sentiments

def run_sentiment_analysis():
    news_headlines = get_market_news()
    sentiments = analyze_sentiment(news_headlines)
    return {"date": str(datetime.date.today()), "sentiments": sentiments}