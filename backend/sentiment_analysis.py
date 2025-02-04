import os
import requests
from bs4 import BeautifulSoup
import datetime
import torch
from dotenv import load_dotenv
from transformers import AutoModelForCausalLM, AutoTokenizer

# Load environment variables
load_dotenv()

# Load DeepSeek-R1 Model from Hugging Face
MODEL_NAME = "deepseek-ai/DeepSeek-R1"
device = "cuda" if torch.cuda.is_available() else "cpu"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(MODEL_NAME).to(device)

def get_market_news():
    """Scrapes stock market news from MoneyControl."""
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
    """Runs sentiment analysis using DeepSeek-R1"""
    sentiments = []

    for news in news_headlines:
        prompt = f"Analyze the sentiment of this stock market news: '{news['title']}'. Reply only with Positive, Neutral, or Negative."

        inputs = tokenizer(prompt, return_tensors="pt").to(device)
        output = model.generate(**inputs, max_length=50)
        sentiment = tokenizer.decode(output[0], skip_special_tokens=True)

        news["sentiment"] = sentiment
        sentiments.append(news)

    return sentiments

def run_sentiment_analysis():
    """Runs the entire sentiment analysis pipeline"""
    news_headlines = get_market_news()
    sentiments = analyze_sentiment(news_headlines)
    return {"date": str(datetime.date.today()), "sentiments": sentiments}