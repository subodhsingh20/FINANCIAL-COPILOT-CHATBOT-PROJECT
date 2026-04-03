import React, { useState, useEffect } from 'react';
import { apiUrl } from '../../lib/api';

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async (lat, lon) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(apiUrl(`/api/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`));
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.message || 'Failed to fetch weather data');
        }

        const data = await response.json();
        setWeather(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeather(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setError('Unable to retrieve your location');
        setLoading(false);
      }
    );
  }, []);

  if (loading) {
    return (
      <div className="mt-4 mb-4 rounded-lg border border-blue-300 bg-blue-100 p-4 shadow-md transition-colors duration-300 ease-in-out dark:border-blue-700 dark:bg-blue-900">
        <h3 className="mb-2 font-bold text-blue-900 dark:text-blue-300">Current Weather</h3>
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 mb-4 rounded-lg border border-red-300 bg-red-100 p-4 shadow-md transition-colors duration-300 ease-in-out dark:border-red-700 dark:bg-red-900">
        <h3 className="mb-2 font-bold text-red-900 dark:text-red-300">Current Weather</h3>
        <div>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="mt-7 mb-0 rounded-lg border border-blue-300 bg-blue-100 p-6 shadow-md transition-colors duration-300 ease-in-out dark:border-blue-700 dark:bg-blue-900">
      <h2 className="mb-5 font-bold text-blue-900 dark:text-blue-300">Current Weather</h2>
      <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2m6 1h2m-2 12h2m-6 2v2m-6-3a7 7 0 0114 0H6zM3 12a9 9 0 0118 0M3 12a9 9 0 0118 0"
          />
        </svg>
        <span>{weather.weather[0].description}, {Math.round(weather.main.temp)} C</span>
      </div>
    </div>
  );
};

export default WeatherWidget;
