import { getTomorrowForecast } from './weather';
import { getBestWindow } from './scoring';

async function test() {
  // Brookfield, WI coordinates
  const forecast = await getTomorrowForecast(43.0606, -88.1065);
  console.log(`Got ${forecast.hours.length} hours of forecast data`);
  console.log(`Sunrise: ${forecast.sunrise.toLocaleTimeString()}`);
  console.log(`Sunset: ${forecast.sunset.toLocaleTimeString()}`);

  const best = getBestWindow(forecast, {
    minTemp: 45,
    maxTemp: 75,
    preferMorning: true,
    preferAfternoon: false,
    preferEvening: false
  });

  if (best) {
    console.log('\nBest window:');
    console.log(`Time: ${best.start.toLocaleTimeString()} - ${best.end.toLocaleTimeString()}`);
    console.log(`Score: ${best.score.toFixed(1)}/100`);
    console.log(`Summary: ${best.summary}`);
  }
}

test().catch(console.error);