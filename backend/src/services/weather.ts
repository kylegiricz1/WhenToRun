import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface HourlyForecast {
  time: Date;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  precipChance: number;
  description: string;
  isDaylight: boolean;
}

export interface DailyForecast {
  hours: HourlyForecast[];
  sunrise: Date;
  sunset: Date;
}

export async function getTomorrowForecast(
  lat: number,
  lng: number
): Promise<DailyForecast> {
  const url = `${BASE_URL}/forecast?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=imperial`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.statusText}`);
  }

  const data = await response.json();

  // Get tomorrow's date range
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStart = new Date(tomorrow.setHours(0, 0, 0, 0));
  const tomorrowEnd = new Date(tomorrow.setHours(23, 59, 59, 999));

  // Get sunrise/sunset
  const sunriseTs = data.city.sunrise * 1000;
  const sunsetTs = data.city.sunset * 1000;
  const sunrise = new Date(sunriseTs);
  const sunset = new Date(sunsetTs);

  // Filter to tomorrow's hourly forecasts
  const hours: HourlyForecast[] = data.list
    .filter((item: any) => {
      const itemTime = new Date(item.dt * 1000);
      return itemTime >= tomorrowStart && itemTime <= tomorrowEnd;
    })
    .map((item: any) => {
      const time = new Date(item.dt * 1000);
      return {
        time,
        temp: item.main.temp,
        feelsLike: item.main.feels_like,
        humidity: item.main.humidity,
        windSpeed: item.wind.speed,
        precipChance: item.pop * 100,
        description: item.weather[0].description,
        isDaylight: time >= sunrise && time <= sunset
      };
    });

  return { hours, sunrise, sunset };
}