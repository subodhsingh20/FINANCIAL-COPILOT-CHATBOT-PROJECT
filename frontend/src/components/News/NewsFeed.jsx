import React, { useState, useEffect } from 'react';
import { apiUrl } from '../../lib/api';

const NewsFeed = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const fetchNews = async () => {
      // No need to set loading to true here again as it's set on initial render
      // and this effect runs only once.
      // setLoading(true);

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(apiUrl('/api/news'));
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.message || 'Failed to fetch news data');
        }
        const data = await response.json();
        setNews(data.articles || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();

    return () => clearInterval(timerId); // Cleanup the interval on component unmount
  }, []); // Empty dependency array ensures this runs only once on mount

  if (loading) {
    return (
      <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg shadow-md border border-blue-300 dark:border-blue-700 transition-colors duration-300 ease-in-out">
        <h3 className="font-bold mb-2 text-blue-900 dark:text-blue-300">Latest News</h3>
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900 rounded-lg shadow-md border border-red-300 dark:border-red-700 transition-colors duration-300 ease-in-out">
        <h3 className="font-bold mb-2 text-red-900 dark:text-red-300">Latest News</h3>
        <div>Error: {error}</div>
      </div>
    );
  }

  return (
    <div>
      {/* Time display with increased font, no seconds, and a border */}
      <div className="text-center text-blue-700 dark:text-blue-400 font-bold text-2xl mb-4 p-5 border border-blue-400 dark:border-blue-600 rounded-lg shadow-sm bg-blue-100 dark:bg-blue-900">
        {/* Formats time to show only hours and minutes, e.g., "03:45 PM" */}
        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg shadow-md border border-blue-300 dark:border-yellow-700 transition-colors duration-300 ease-in-out">
        <h3 className="font-bold mb-2 text-blue-900 dark:text-blue-300">Latest News</h3>
        <ul className="list-disc list-inside text-blue-800 dark:text-blue-200 space-y-1">
          {news.length > 0 ? (
            news.map((article, index) => (
              <li key={index}>
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {article.title}
                </a>
              </li>
            ))
          ) : (
            <li>No news available</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default NewsFeed;
