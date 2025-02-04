"use client";  // ✅ Make it a Client Component

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type SentimentData = {
  date: string;
  sentiments: { title: string; sentiment: string; link: string }[];
};

type NewsData = {
  title: string;
  link: string;
};

export default function Home() {
  const apiKey = process.env.NEXT_PUBLIC_NEWSDATA_API_KEY;
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [newsData, setNewsData] = useState<NewsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 🔹 Fetch Market News from Public API (Not GPT)
  useEffect(() => {
    fetch(`https://newsdata.io/api/1/news?apikey=${apiKey}&category=business&language=en`)
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Market News API Response:", data);
        if (data.results) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const formattedNews = data.results.map((news: any) => ({
            title: news.title,
            link: news.link,
          }));
          setNewsData(formattedNews);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("🔴 Error fetching market news", err);
        setIsLoading(false);
      });
  }, []);

  // 🔹 Fetch Sentiment Analysis on Button Click
  const fetchSentimentAnalysis = () => {
    setIsAnalyzing(true);
    fetch("/api/getSentiment")
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Sentiment Analysis API Response:", data);
        setSentimentData({
          date: data?.report?.date || "Unknown",
          sentiments: Array.isArray(data?.report?.sentiments) ? data.report.sentiments : [],
        });
        setIsAnalyzing(false);
      })
      .catch((err) => {
        console.error("🔴 Error fetching sentiment data", err);
        setIsAnalyzing(false);
      });
  };

  return (
    <div className="p-4 sm:p-6 md:p-10">
      {/* 🔹 Header */}
      <motion.h1
        className="text-2xl sm:text-3xl font-bold text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Market News & Sentiment Analysis
      </motion.h1>

      {/* 🔹 Market News Section */}
      <motion.div
        className="mt-6 sm:mt-8 mx-auto w-full sm:w-3/4 bg-white shadow-md rounded-lg p-4 sm:p-6 text-black"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">📈 Today&apos;s Market News</h2>
        {isLoading ? (
          <p>Loading market news...</p>
        ) : (
          <ul className="space-y-3">
            {newsData.map((news, index) => (
              <li key={index} className="p-2 border rounded hover:bg-gray-100">
                <a href={news.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold">
                  {news.title}
                </a>
              </li>
            ))}
          </ul>
        )}
      </motion.div>

      {/* 🔹 Sentiment Analysis Button */}
      <div className="text-center mt-4 sm:mt-6">
        <motion.button
          className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition"
          onClick={fetchSentimentAnalysis}
          disabled={isAnalyzing}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {isAnalyzing ? "Analyzing..." : "🔍 Get Sentiment"}
        </motion.button>
      </div>

      {/* 🔹 Sentiment Chart */}
      {sentimentData && sentimentData.sentiments.length > 0 && (
        <motion.div
          className="mt-6 sm:mt-8 mx-auto w-full sm:w-3/4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl sm:text-2xl font-semibold text-center mb-4">📊 Sentiment Analysis ({sentimentData.date})</h2>

          {/* Chart Data */}
          <Bar
            data={{
              labels: ["Positive", "Neutral", "Negative"],
              datasets: [
                {
                  label: "Sentiment Count",
                  data: [
                    sentimentData.sentiments.filter((s) => s.sentiment === "Positive").length,
                    sentimentData.sentiments.filter((s) => s.sentiment === "Neutral").length,
                    sentimentData.sentiments.filter((s) => s.sentiment === "Negative").length,
                  ],
                  backgroundColor: ["#34D399", "#FBBF24", "#EF4444"], // Green, Yellow, Red
                },
              ],
            }}
          />
        </motion.div>
      )}

      {/* 🔹 Sentiment Analysis Results */}
      {sentimentData && sentimentData.sentiments.length > 0 && (
        <motion.div className="mt-8 sm:mt-10 space-y-4">
          {sentimentData.sentiments.map((item, index) => (
            <motion.div
              key={index}
              className="p-4 border rounded-lg shadow-lg bg-white hover:bg-gray-100 text-black"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <a href={item.link} target="_blank" rel="noopener noreferrer">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p
                  className={`mt-1 font-bold ${
                    item.sentiment === "Positive"
                      ? "text-green-600"
                      : item.sentiment === "Negative"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  Sentiment: {item.sentiment}
                </p>
              </a>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}