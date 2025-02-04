"use client";

import { useEffect, useState } from "react";

type SentimentData = {
  date: string;
  sentiments: { title: string; sentiment: string; link: string }[];
};

export default function Home() {
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);

  useEffect(() => {
    fetch("/api/getSentiment")
      .then((res) => res.json())
      .then((data) => setSentimentData(data))
      .catch((err) => console.error("Error fetching sentiment data", err));
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Market Sentiment Analysis</h1>
      {sentimentData ? (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Report for {sentimentData.date}</h2>
          <ul className="mt-2">
            {sentimentData.sentiments?.map((item, index) => (
              <li key={index} className="p-2 border rounded mt-2">
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  <strong>{item.title}</strong> - <span>{item.sentiment}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Loading sentiment analysis...</p>
      )}
    </div>
  );
}