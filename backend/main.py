from fastapi import FastAPI
from sentiment_analysis import run_sentiment_analysis

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Sentiment Analysis API is running with DeepSeek-R1"}

@app.get("/analyze")
def analyze_sentiment():
    try:
        report = run_sentiment_analysis()
        print("Generated Report:", report)  # Debugging print
        return {"report": report}
    except Exception as e:
        print("Error occurred:", str(e))
        return {"error": str(e)}