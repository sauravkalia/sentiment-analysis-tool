import os
from fastapi import FastAPI
from dotenv import load_dotenv
from sentiment_analysis import run_sentiment_analysis

# Load environment variables
load_dotenv()

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Sentiment Analysis API is running"}

@app.get("/analyze")
def analyze_sentiment():
    report = run_sentiment_analysis()
    return {"report": report}