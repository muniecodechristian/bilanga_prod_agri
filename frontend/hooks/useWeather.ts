import { useState } from "react";
import * as Location from "expo-location";

/* ---------- TYPES ---------- */

type Weather = {
  temp: number;
  humidity: number;
  wind: number;
  desc: string;
  icon: string;
  city: string;
};

type ForecastItem = {
  dt: number;
  temp: number;
  weather: {
    description: string;
    icon: string;
  }[];
};

type UseWeatherReturn = {
  weather: Weather | null;
  forecast: ForecastItem[];
  loading: boolean;
  permissionDenied: boolean;
  requestLocation: () => Promise<void>;
};

/* ---------- HOOK ---------- */

export default function useWeather(): UseWeatherReturn {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);

  const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY || "";

  const requestLocation = async (): Promise<void> => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      setPermissionDenied(true);
      setLoading(false);
      return;
    }

    setPermissionDenied(false);

    const location = await Location.getCurrentPositionAsync({});
    await fetchWeather(location.coords.latitude, location.coords.longitude);
  };

  const fetchWeather = async (lat: number, lon: number): Promise<void> => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`
      );
      const data = await res.json();

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,daily,alerts&appid=${API_KEY}&units=metric&lang=fr`
      );
      const forecastData = await forecastRes.json();

      setWeather({
        temp: data.main.temp,
        humidity: data.main.humidity,
        wind: data.wind.speed,
        desc: data.weather[0].description,
        icon: data.weather[0].icon,
        city: data.name,
      });

      setForecast(forecastData.hourly || []);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  return {
    weather,
    forecast,
    loading,
    permissionDenied,
    requestLocation,
  };
}
