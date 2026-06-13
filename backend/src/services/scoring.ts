import { HourlyForecast, DailyForecast } from './weather';

export interface ScoredWindow {
  start: Date;
  end: Date;
  score: number;
  summary: string;
  conditions: HourlyForecast;
}

interface UserPreferences {
  minTemp: number;
  maxTemp: number;
  preferMorning: boolean;
  preferAfternoon: boolean;
  preferEvening: boolean;
}

function isMorning(date: Date): boolean {
  const h = date.getHours();
  return h >= 5 && h < 12;
}

function isAfternoon(date: Date): boolean {
  const h = date.getHours();
  return h >= 12 && h < 17;
}

function isEvening(date: Date): boolean {
  const h = date.getHours();
  return h >= 17 && h < 21;
}

function scoreHour(hour: HourlyForecast, prefs: UserPreferences): number {
  let score = 100;

  // Temperature score (biggest factor)
  const idealMid = (prefs.minTemp + prefs.maxTemp) / 2;
  const tempDiff = Math.abs(hour.temp - idealMid);
  const tempRange = (prefs.maxTemp - prefs.minTemp) / 2;
  if (hour.temp < prefs.minTemp || hour.temp > prefs.maxTemp) {
    score -= Math.min(40, tempDiff * 3); // heavy penalty outside range
  } else {
    score -= (tempDiff / tempRange) * 10; // mild penalty within range
  }

  // Rain penalty
  if (hour.precipChance > 70) score -= 40;
  else if (hour.precipChance > 40) score -= 20;
  else if (hour.precipChance > 20) score -= 10;

  // Humidity penalty
  if (hour.humidity > 85) score -= 15;
  else if (hour.humidity > 70) score -= 7;

  // Wind penalty
  if (hour.windSpeed > 20) score -= 15;
  else if (hour.windSpeed > 12) score -= 7;

  // Daylight bonus
  if (hour.isDaylight) score += 5;

  // Time of day preference bonus
  if (prefs.preferMorning && isMorning(hour.time)) score += 10;
  if (prefs.preferAfternoon && isAfternoon(hour.time)) score += 10;
  if (prefs.preferEvening && isEvening(hour.time)) score += 10;

  return Math.max(0, Math.min(100, score));
}

function buildSummary(hour: HourlyForecast, score: number): string {
  const temp = Math.round(hour.temp);
  const feel = score >= 75 ? 'Great' : score >= 50 ? 'Decent' : 'Tough';
  const rain = hour.precipChance > 40 ? `, ${Math.round(hour.precipChance)}% chance of rain` : '';
  const wind = hour.windSpeed > 12 ? `, ${Math.round(hour.windSpeed)}mph winds` : '';
  return `${feel} conditions — ${temp}°F${rain}${wind}. ${hour.description}.`;
}

export function getBestWindow(
  forecast: DailyForecast,
  prefs: UserPreferences
): ScoredWindow | null {
  if (!forecast.hours.length) return null;

  let best: ScoredWindow | null = null;

  for (const hour of forecast.hours) {
    const score = scoreHour(hour, prefs);
    const windowEnd = new Date(hour.time.getTime() + 60 * 60 * 1000);

    if (!best || score > best.score) {
      best = {
        start: hour.time,
        end: windowEnd,
        score,
        summary: buildSummary(hour, score),
        conditions: hour
      };
    }
  }

  return best;
}