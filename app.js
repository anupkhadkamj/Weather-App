/**
 * ATMOSPHERE — Core Weather Application Engine
 * OpenWeatherMap API + Realistic Mock Fallback + Geolocation + Dynamic Renderers
 */

// Application State
const state = {
  apiKey: localStorage.getItem('owm_api_key') || '150612205675b30820dd437c6bd71157',
  unit: localStorage.getItem('temp_unit') || 'C', // 'C' or 'F'
  currentCity: 'Mahendranagar',
  currentData: null,
  forecastData: null,
  aqiData: null,
  isDemo: false
};

// SVG Animated Weather Icons Collection
const WEATHER_ICONS = {
  sunny: `<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="14" fill="#FBBF24" filter="drop-shadow(0 0 10px #FBBF24)"/><g stroke="#FBBF24" stroke-width="3" stroke-linecap="round"><line x1="32" y1="6" x2="32" y2="12"/><line x1="32" y1="52" x2="32" y2="58"/><line x1="6" y1="32" x2="12" y2="32"/><line x1="52" y1="32" x2="58" y2="32"/><line x1="13.6" y1="13.6" x2="17.8" y2="17.8"/><line x1="46.2" y1="46.2" x2="50.4" y2="50.4"/><line x1="13.6" y1="50.4" x2="17.8" y2="46.2"/><line x1="46.2" y1="17.8" x2="50.4" y2="13.6"/></g></svg>`,

  night: `<svg viewBox="0 0 64 64" fill="none"><path d="M46 36.5A18 18 0 1 1 27.5 18 14 14 0 0 0 46 36.5z" fill="#818CF8" filter="drop-shadow(0 0 12px #818CF8)"/></svg>`,

  cloudy: `<svg viewBox="0 0 64 64" fill="none"><path d="M46 42H20a10 10 0 0 1-1.8-19.8 14 14 0 0 1 27.2-3.8A10 10 0 0 1 46 42z" fill="#9CA3AF" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.3))"/></svg>`,

  partlyCloudy: `<svg viewBox="0 0 64 64" fill="none"><circle cx="24" cy="24" r="10" fill="#FBBF24"/><path d="M48 44H24a9 9 0 0 1-1.6-17.8 12 12 0 0 1 23.3-3.4A9 9 0 0 1 48 44z" fill="rgba(255,255,255,0.85)"/></svg>`,

  rainy: `<svg viewBox="0 0 64 64" fill="none"><path d="M46 36H20a9 9 0 0 1-1.6-17.8 13 13 0 0 1 25.3-3.4A9 9 0 0 1 46 36z" fill="#38BDF8"/><g stroke="#38BDF8" stroke-width="3" stroke-linecap="round"><line x1="22" y1="44" x2="18" y2="52"/><line x1="32" y1="44" x2="28" y2="52"/><line x1="42" y1="44" x2="38" y2="52"/></g></svg>`,

  stormy: `<svg viewBox="0 0 64 64" fill="none"><path d="M46 34H20a9 9 0 0 1-1.6-17.8 13 13 0 0 1 25.3-3.4A9 9 0 0 1 46 34z" fill="#8B5CF6"/><polygon points="32,38 24,50 30,50 26,60 38,46 32,46" fill="#FBBF24" filter="drop-shadow(0 0 8px #FBBF24)"/></svg>`,

  snowy: `<svg viewBox="0 0 64 64" fill="none"><path d="M46 36H20a9 9 0 0 1-1.6-17.8 13 13 0 0 1 25.3-3.4A9 9 0 0 1 46 36z" fill="#94A3B8"/><g fill="#7DD3FC"><circle cx="20" cy="46" r="2.5"/><circle cx="32" cy="48" r="3"/><circle cx="44" cy="46" r="2.5"/></g></svg>`
};

// Comprehensive Realistic Mock Data Generator (Demo Mode)
const MOCK_CITIES = {
  'Mahendranagar': {
    name: 'Mahendranagar', country: 'NP', temp: 30, condition: 'Partly Cloudy', icon: 'partlyCloudy',
    feelsLike: 34, minTemp: 26, maxTemp: 32, windSpeed: 2.5, windDeg: 230, humidity: 75,
    uv: 6.5, aqi: 2, pressure: 1010, visibility: 10, sunrise: '05:30', sunset: '19:15',
    hourly: [
      { time: 'Now', temp: 30, icon: 'partlyCloudy', pop: 10 },
      { time: '18:00', temp: 29, icon: 'sunny', pop: 0 },
      { time: '19:00', temp: 27, icon: 'sunny', pop: 0 },
      { time: '20:00', temp: 26, icon: 'night', pop: 15 },
      { time: '21:00', temp: 25, icon: 'night', pop: 20 },
      { time: '22:00', temp: 24, icon: 'night', pop: 10 },
      { time: '23:00', temp: 24, icon: 'night', pop: 5 },
      { time: '00:00', temp: 23, icon: 'night', pop: 0 }
    ],
    daily: [
      { day: 'Today', icon: 'partlyCloudy', min: 26, max: 32, cond: 'Partly Cloudy' },
      { day: 'Tomorrow', icon: 'rainy', min: 25, max: 31, cond: 'Light Rain' },
      { day: 'Thursday', icon: 'sunny', min: 26, max: 33, cond: 'Sunny' },
      { day: 'Friday', icon: 'sunny', min: 27, max: 34, cond: 'Clear Sky' },
      { day: 'Saturday', icon: 'cloudy', min: 25, max: 30, cond: 'Overcast' },
      { day: 'Sunday', icon: 'stormy', min: 24, max: 29, cond: 'Thunderstorm' },
      { day: 'Monday', icon: 'partlyCloudy', min: 25, max: 32, cond: 'Passing Clouds' }
    ]
  },
  'London': {
    name: 'London', country: 'GB', temp: 18, condition: 'Partly Cloudy', icon: 'partlyCloudy',
    feelsLike: 17, minTemp: 14, maxTemp: 21, windSpeed: 4.2, windDeg: 230, humidity: 68,
    uv: 4.5, aqi: 2, pressure: 1015, visibility: 10, sunrise: '05:42', sunset: '20:30',
    hourly: [
      { time: 'Now', temp: 18, icon: 'partlyCloudy', pop: 10 },
      { time: '18:00', temp: 19, icon: 'sunny', pop: 0 },
      { time: '19:00', temp: 18, icon: 'sunny', pop: 0 },
      { time: '20:00', temp: 16, icon: 'partlyCloudy', pop: 15 },
      { time: '21:00', temp: 15, icon: 'night', pop: 20 },
      { time: '22:00', temp: 14, icon: 'night', pop: 10 },
      { time: '23:00', temp: 14, icon: 'night', pop: 5 },
      { time: '00:00', temp: 13, icon: 'night', pop: 0 }
    ],
    daily: [
      { day: 'Today', icon: 'partlyCloudy', min: 14, max: 21, cond: 'Partly Cloudy' },
      { day: 'Tomorrow', icon: 'rainy', min: 13, max: 18, cond: 'Light Rain' },
      { day: 'Thursday', icon: 'sunny', min: 15, max: 23, cond: 'Sunny' },
      { day: 'Friday', icon: 'sunny', min: 16, max: 25, cond: 'Clear Sky' },
      { day: 'Saturday', icon: 'cloudy', min: 15, max: 20, cond: 'Overcast' },
      { day: 'Sunday', icon: 'stormy', min: 14, max: 19, cond: 'Thunderstorm' },
      { day: 'Monday', icon: 'partlyCloudy', min: 13, max: 21, cond: 'Passing Clouds' }
    ]
  },
  'Tokyo': {
    name: 'Tokyo', country: 'JP', temp: 27, condition: 'Clear Sky', icon: 'sunny',
    feelsLike: 29, minTemp: 22, maxTemp: 30, windSpeed: 2.8, windDeg: 140, humidity: 55,
    uv: 7.2, aqi: 1, pressure: 1008, visibility: 12, sunrise: '04:55', sunset: '18:45',
    hourly: [
      { time: 'Now', temp: 27, icon: 'sunny', pop: 0 },
      { time: '18:00', temp: 26, icon: 'sunny', pop: 0 },
      { time: '19:00', temp: 24, icon: 'night', pop: 0 },
      { time: '20:00', temp: 23, icon: 'night', pop: 0 },
      { time: '21:00', temp: 22, icon: 'night', pop: 0 },
      { time: '22:00', temp: 22, icon: 'night', pop: 0 }
    ],
    daily: [
      { day: 'Today', icon: 'sunny', min: 22, max: 30, cond: 'Sunny' },
      { day: 'Tomorrow', icon: 'sunny', min: 23, max: 31, cond: 'Clear' },
      { day: 'Thursday', icon: 'partlyCloudy', min: 22, max: 29, cond: 'Partly Cloudy' },
      { day: 'Friday', icon: 'rainy', min: 20, max: 25, cond: 'Moderate Rain' },
      { day: 'Saturday', icon: 'sunny', min: 21, max: 28, cond: 'Sunny' },
      { day: 'Sunday', icon: 'sunny', min: 22, max: 30, cond: 'Clear' },
      { day: 'Monday', icon: 'partlyCloudy', min: 23, max: 29, cond: 'Scattered Clouds' }
    ]
  },
  'New York': {
    name: 'New York', country: 'US', temp: 24, condition: 'Thunderstorm', icon: 'stormy',
    feelsLike: 26, minTemp: 19, maxTemp: 26, windSpeed: 6.5, windDeg: 310, humidity: 82,
    uv: 3.1, aqi: 3, pressure: 1002, visibility: 8, sunrise: '06:05', sunset: '20:10',
    hourly: [
      { time: 'Now', temp: 24, icon: 'stormy', pop: 85 },
      { time: '18:00', temp: 23, icon: 'rainy', pop: 70 },
      { time: '19:00', temp: 22, icon: 'cloudy', pop: 30 },
      { time: '20:00', temp: 21, icon: 'partlyCloudy', pop: 10 }
    ],
    daily: [
      { day: 'Today', icon: 'stormy', min: 19, max: 26, cond: 'Heavy Storms' },
      { day: 'Tomorrow', icon: 'partlyCloudy', min: 18, max: 25, cond: 'Clearing Up' },
      { day: 'Thursday', icon: 'sunny', min: 20, max: 28, cond: 'Sunny' },
      { day: 'Friday', icon: 'sunny', min: 22, max: 30, cond: 'Hot & Clear' },
      { day: 'Saturday', icon: 'rainy', min: 19, max: 24, cond: 'Showers' },
      { day: 'Sunday', icon: 'sunny', min: 18, max: 26, cond: 'Sunny' },
      { day: 'Monday', icon: 'partlyCloudy', min: 19, max: 27, cond: 'Partly Cloudy' }
    ]
  }
};

// Popular city quick list for autocomplete
const CITY_SUGGESTIONS = [
  'London, UK', 'Tokyo, Japan', 'New York, USA', 'Paris, France',
  'Sydney, Australia', 'Dubai, UAE', 'Berlin, Germany', 'Toronto, Canada',
  'Singapore', 'Rome, Italy', 'Mumbai, India', 'Barcelona, Spain'
];

// Helper: Temperature Converter
function formatTemp(tempC) {
  if (state.unit === 'F') {
    return Math.round((tempC * 9 / 5) + 32);
  }
  return Math.round(tempC);
}

// Map OWM condition code to our theme & icon
function parseWeatherCondition(id, main, iconCode) {
  const isNight = iconCode ? iconCode.includes('n') : false;

  if (id >= 200 && id < 300) return { theme: 'stormy', icon: 'stormy' };
  if (id >= 300 && id < 600) return { theme: 'rainy', icon: 'rainy' };
  if (id >= 600 && id < 700) return { theme: 'snowy', icon: 'snowy' };
  if (id >= 700 && id < 800) return { theme: 'cloudy', icon: 'cloudy' };
  if (id === 800) return { theme: isNight ? 'night' : 'sunny', icon: isNight ? 'night' : 'sunny' };
  if (id > 800) return { theme: isNight ? 'night' : 'sunny', icon: 'partlyCloudy' };

  return { theme: 'sunny', icon: 'sunny' };
}

// Convert degrees to Compass direction string
function getWindDirection(deg) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round((deg %= 360) / 45) % 8;
  return directions[index];
}

// --------------------------------------------------------------------------
// API FETCH SERVICES
// --------------------------------------------------------------------------

async function fetchWeatherData(query) {
  // If no API key, use rich Mock engine
  if (!state.apiKey) {
    return loadMockCity(typeof query === 'string' ? query : 'Mahendranagar');
  }

  try {
    let urlWeather = '';
    let urlForecast = '';

    if (typeof query === 'object' && query.lat && query.lon) {
      urlWeather = `https://api.openweathermap.org/data/2.5/weather?lat=${query.lat}&lon=${query.lon}&appid=${state.apiKey}&units=metric`;
      urlForecast = `https://api.openweathermap.org/data/2.5/forecast?lat=${query.lat}&lon=${query.lon}&appid=${state.apiKey}&units=metric`;
    } else {
      const cityName = encodeURIComponent(query || 'Mahendranagar');
      urlWeather = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${state.apiKey}&units=metric`;
      urlForecast = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${state.apiKey}&units=metric`;
    }

    const [resWeather, resForecast] = await Promise.all([
      fetch(urlWeather),
      fetch(urlForecast)
    ]);

    if (!resWeather.ok || !resForecast.ok) {
      throw new Error('City or location not found');
    }

    const dataWeather = await resWeather.json();
    const dataForecast = await resForecast.json();

    // Optionally fetch air pollution
    let dataAqi = null;
    try {
      const resAqi = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${dataWeather.coord.lat}&lon=${dataWeather.coord.lon}&appid=${state.apiKey}`);
      if (resAqi.ok) dataAqi = await resAqi.json();
    } catch (e) { /* ignore fallback */ }

    state.isDemo = false;
    updateApiStatusTag('OpenWeatherMap Live');
    renderLiveData(dataWeather, dataForecast, dataAqi);

  } catch (err) {
    console.warn('API error or key invalid, switching to mock:', err.message);
    loadMockCity(typeof query === 'string' ? query : 'Mahendranagar');
    showNotification('Using fallback showcase data for ' + (typeof query === 'string' ? query : 'location'));
  }
}

function loadMockCity(cityName) {
  state.isDemo = true;
  updateApiStatusTag('Demo Mode');

  // Match closest mock city or default to Mahendranagar
  let matchedKey = Object.keys(MOCK_CITIES).find(k => k.toLowerCase() === cityName.toLowerCase());
  if (!matchedKey) matchedKey = 'Mahendranagar';

  const mock = MOCK_CITIES[matchedKey];
  renderMockData(mock);
}

function updateApiStatusTag(text) {
  const tag = document.getElementById('apiStatusTag');
  if (tag) {
    tag.textContent = text;
    tag.style.color = state.isDemo ? 'var(--accent-color)' : '#10b981';
  }
}

// --------------------------------------------------------------------------
// RENDER FUNCTIONS
// --------------------------------------------------------------------------

function renderLiveData(current, forecast, aqi) {
  const condInfo = parseWeatherCondition(current.weather[0].id, current.weather[0].main, current.weather[0].icon);

  // 1. Theme & Canvas Sync
  document.body.className = 'theme-' + condInfo.theme;
  if (window.weatherCanvas) {
    window.weatherCanvas.setCondition(condInfo.theme);
  }

  // 2. Hero Card
  document.getElementById('cityName').textContent = current.name;
  document.getElementById('countryTag').textContent = current.sys.country || '';

  const now = new Date();
  document.getElementById('localTime').textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  document.getElementById('heroTemp').textContent = formatTemp(current.main.temp);
  document.getElementById('heroUnit').textContent = `°${state.unit}`;

  document.getElementById('weatherCondition').textContent = current.weather[0].description;
  document.getElementById('feelsLike').textContent = `${formatTemp(current.main.feels_like)}°${state.unit}`;

  // Icon
  const iconContainer = document.getElementById('weatherIconContainer');
  iconContainer.innerHTML = WEATHER_ICONS[condInfo.icon] || WEATHER_ICONS.sunny;

  // Hero Footer
  document.getElementById('tempRange').textContent = `${formatTemp(current.main.temp_max)}° / ${formatTemp(current.main.temp_min)}°`;
  document.getElementById('heroWind').textContent = `${current.wind.speed} m/s`;
  document.getElementById('heroHumidity').textContent = `${current.main.humidity}%`;
  document.getElementById('heroUV').textContent = '4.2'; // Estimated standard

  // 3. Hourly Forecast (24 Hours from OWM forecast list)
  const hourlyReel = document.getElementById('hourlyReel');
  hourlyReel.innerHTML = '';

  const hourlyItems = forecast.list.slice(0, 8); // Next 24h in 3h steps
  hourlyItems.forEach((item, index) => {
    const itemDate = new Date(item.dt * 1000);
    const timeStr = index === 0 ? 'Now' : itemDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const slotCond = parseWeatherCondition(item.weather[0].id, item.weather[0].main, item.weather[0].icon);

    const slot = document.createElement('div');
    slot.className = `hourly-slot ${index === 0 ? 'active-now' : ''}`;
    slot.innerHTML = `
      <span class="hour-time">${timeStr}</span>
      <div class="hour-icon">${WEATHER_ICONS[slotCond.icon] || WEATHER_ICONS.sunny}</div>
      <span class="hour-temp">${formatTemp(item.main.temp)}°${state.unit}</span>
      <span class="hour-pop">${Math.round((item.pop || 0) * 100)}% rain</span>
    `;
    hourlyReel.appendChild(slot);
  });

  // 4. Metrics Tiles
  // AQI
  const aqiVal = aqi && aqi.list ? aqi.list[0].main.aqi : 1;
  renderAqiTile(aqiVal);

  // Sunrise/Sunset Arc
  const sunriseDate = new Date(current.sys.sunrise * 1000);
  const sunsetDate = new Date(current.sys.sunset * 1000);
  renderSolarArc(sunriseDate, sunsetDate);

  // Wind Compass
  renderWindCompass(current.wind.speed, current.wind.deg || 0, current.wind.gust);

  // UV Index
  renderUVTile(4.5);

  // Humidity & Pressure
  document.getElementById('humidityVal').textContent = `${current.main.humidity}%`;
  document.getElementById('humidityFill').style.width = `${current.main.humidity}%`;
  const dewPointApprox = current.main.temp - ((100 - current.main.humidity) / 5);
  document.getElementById('dewPointVal').textContent = `Dew point: ${formatTemp(dewPointApprox)}°${state.unit}`;

  document.getElementById('pressureVal').textContent = current.main.pressure;
  document.getElementById('visibilityVal').textContent = `Visibility: ${((current.visibility || 10000) / 1000).toFixed(1)} km`;

  // 5. Daily Forecast (Aggregate 5-7 days from forecast list)
  renderDailyFromForecast(forecast.list);
}

function renderMockData(mock) {
  const condInfo = parseWeatherCondition(800, mock.condition, mock.icon.includes('night') ? 'n' : 'd');

  document.body.className = 'theme-' + (mock.icon === 'stormy' ? 'stormy' : mock.icon === 'rainy' ? 'rainy' : mock.icon === 'night' ? 'night' : 'sunny');
  if (window.weatherCanvas) {
    window.weatherCanvas.setCondition(mock.icon === 'stormy' ? 'stormy' : mock.icon === 'rainy' ? 'rainy' : mock.icon === 'night' ? 'night' : 'sunny');
  }

  document.getElementById('cityName').textContent = mock.name;
  document.getElementById('countryTag').textContent = mock.country;

  const now = new Date();
  document.getElementById('localTime').textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  document.getElementById('heroTemp').textContent = formatTemp(mock.temp);
  document.getElementById('heroUnit').textContent = `°${state.unit}`;

  document.getElementById('weatherCondition').textContent = mock.condition;
  document.getElementById('feelsLike').textContent = `${formatTemp(mock.feelsLike)}°${state.unit}`;

  document.getElementById('weatherIconContainer').innerHTML = WEATHER_ICONS[mock.icon] || WEATHER_ICONS.sunny;

  document.getElementById('tempRange').textContent = `${formatTemp(mock.maxTemp)}° / ${formatTemp(mock.minTemp)}°`;
  document.getElementById('heroWind').textContent = `${mock.windSpeed} m/s`;
  document.getElementById('heroHumidity').textContent = `${mock.humidity}%`;
  document.getElementById('heroUV').textContent = mock.uv;

  // Hourly reel
  const hourlyReel = document.getElementById('hourlyReel');
  hourlyReel.innerHTML = '';
  mock.hourly.forEach((item, index) => {
    const slot = document.createElement('div');
    slot.className = `hourly-slot ${index === 0 ? 'active-now' : ''}`;
    slot.innerHTML = `
      <span class="hour-time">${item.time}</span>
      <div class="hour-icon">${WEATHER_ICONS[item.icon] || WEATHER_ICONS.sunny}</div>
      <span class="hour-temp">${formatTemp(item.temp)}°${state.unit}</span>
      <span class="hour-pop">${item.pop}% rain</span>
    `;
    hourlyReel.appendChild(slot);
  });

  // Metrics
  renderAqiTile(mock.aqi);
  renderSolarArc(new Date(), new Date(Date.now() + 12 * 3600 * 1000));
  renderWindCompass(mock.windSpeed, mock.windDeg, mock.windSpeed * 1.4);
  renderUVTile(mock.uv);

  document.getElementById('humidityVal').textContent = `${mock.humidity}%`;
  document.getElementById('humidityFill').style.width = `${mock.humidity}%`;
  document.getElementById('dewPointVal').textContent = `Dew point: ${formatTemp(mock.temp - 4)}°${state.unit}`;

  document.getElementById('pressureVal').textContent = mock.pressure;
  document.getElementById('visibilityVal').textContent = `Visibility: ${mock.visibility} km`;

  // Daily
  const dailyList = document.getElementById('dailyList');
  dailyList.innerHTML = '';
  mock.daily.forEach(item => {
    const row = document.createElement('div');
    row.className = 'daily-row';
    row.innerHTML = `
      <span class="day-name">${item.day}</span>
      <div class="day-icon-box">${WEATHER_ICONS[item.icon] || WEATHER_ICONS.sunny}</div>
      <div class="temp-bar-wrapper">
        <span class="min-temp-label">${formatTemp(item.min)}°</span>
        <div class="temp-bar-bg">
          <div class="temp-bar-fill" style="left: 15%; width: 70%;"></div>
        </div>
        <span class="max-temp-label">${formatTemp(item.max)}°</span>
      </div>
      <span class="day-cond">${item.cond}</span>
    `;
    dailyList.appendChild(row);
  });
}

function renderAqiTile(aqiScore) {
  const badge = document.getElementById('aqiBadge');
  const score = document.getElementById('aqiScore');
  const fill = document.getElementById('aqiFill');
  const advice = document.getElementById('aqiAdvice');

  score.textContent = aqiScore;
  const labels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
  const colors = ['#10b981', '#f59e0b', '#f97316', '#ef4444', '#7c3aed'];
  const text = labels[aqiScore - 1] || 'Good';

  badge.textContent = text;
  badge.style.color = colors[aqiScore - 1] || '#10b981';
  fill.style.width = `${(aqiScore / 5) * 100}%`;

  if (aqiScore <= 2) advice.textContent = 'Air quality is great for outdoor activities.';
  else if (aqiScore === 3) advice.textContent = 'Sensitive individuals should limit prolonged outdoor exertion.';
  else advice.textContent = 'Consider reducing heavy outdoor exertion today.';
}

function renderSolarArc(sunrise, sunset) {
  const formatTime = d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  document.getElementById('sunriseTime').textContent = formatTime(sunrise);
  document.getElementById('sunsetTime').textContent = formatTime(sunset);

  const now = new Date();
  const totalMs = sunset - sunrise;
  const elapsedMs = now - sunrise;
  let ratio = totalMs > 0 ? elapsedMs / totalMs : 0.5;
  ratio = Math.max(0, Math.min(1, ratio));

  // Update SVG stroke-dashoffset & sun circle position
  const pathLength = 283;
  const offset = pathLength * (1 - ratio);
  const path = document.getElementById('solarProgressPath');
  if (path) path.style.strokeDashoffset = offset;

  // Arc formula for circle
  const angle = Math.PI * (1 - ratio);
  const cx = 100 + 90 * Math.cos(angle);
  const cy = 90 - 90 * Math.sin(angle);
  const sunIcon = document.getElementById('sunIcon');
  if (sunIcon) {
    sunIcon.setAttribute('cx', cx);
    sunIcon.setAttribute('cy', cy);
  }
}

function renderWindCompass(speed, deg, gust) {
  document.getElementById('windSpeedVal').textContent = `${speed} m/s`;
  const dirStr = getWindDirection(deg);
  document.getElementById('windDirectionText').textContent = `${dirStr} (${deg}°)`;
  document.getElementById('windGust').textContent = gust ? `Gusts: ${gust} m/s` : `Steady airflow`;

  const needle = document.getElementById('compassNeedle');
  if (needle) needle.style.transform = `rotate(${deg}deg)`;
}

function renderUVTile(uvVal) {
  document.getElementById('uvValNum').textContent = uvVal.toFixed(1);
  const badge = document.getElementById('uvBadge');
  const fill = document.getElementById('uvGaugeFill');
  const advice = document.getElementById('uvAdvice');

  let text = 'Low';
  let dashoffset = 251 - (uvVal / 11) * 251;
  dashoffset = Math.max(0, dashoffset);

  if (uvVal >= 3 && uvVal < 6) text = 'Moderate';
  else if (uvVal >= 6 && uvVal < 8) text = 'High';
  else if (uvVal >= 8) text = 'Very High';

  badge.textContent = text;
  fill.style.strokeDashoffset = dashoffset;

  if (uvVal < 3) advice.textContent = 'Minimal protection needed.';
  else if (uvVal < 6) advice.textContent = 'Wear sunglasses and SPF 30+ sunscreen.';
  else advice.textContent = 'Take extra precautions; seek shade during midday hours.';
}

function renderDailyFromForecast(list) {
  const dailyList = document.getElementById('dailyList');
  dailyList.innerHTML = '';

  // Group forecast by day
  const daysMap = {};
  list.forEach(item => {
    const dayName = new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
    if (!daysMap[dayName]) {
      daysMap[dayName] = { temps: [], weather: item.weather[0] };
    }
    daysMap[dayName].temps.push(item.main.temp);
  });

  Object.keys(daysMap).slice(0, 7).forEach((day, idx) => {
    const d = daysMap[day];
    const minTemp = Math.min(...d.temps);
    const maxTemp = Math.max(...d.temps);
    const cond = parseWeatherCondition(d.weather.id, d.weather.main, d.weather.icon);

    const row = document.createElement('div');
    row.className = 'daily-row';
    row.innerHTML = `
      <span class="day-name">${idx === 0 ? 'Today' : day}</span>
      <div class="day-icon-box">${WEATHER_ICONS[cond.icon] || WEATHER_ICONS.sunny}</div>
      <div class="temp-bar-wrapper">
        <span class="min-temp-label">${formatTemp(minTemp)}°</span>
        <div class="temp-bar-bg">
          <div class="temp-bar-fill" style="left: 20%; width: 60%;"></div>
        </div>
        <span class="max-temp-label">${formatTemp(maxTemp)}°</span>
      </div>
      <span class="day-cond">${d.weather.description}</span>
    `;
    dailyList.appendChild(row);
  });
}

// Notification Helper
function showNotification(msg) {
  const status = document.getElementById('apiCheckStatus');
  if (status) {
    status.textContent = msg;
    status.className = 'api-check-status success';
    status.classList.remove('hidden');
    setTimeout(() => status.classList.add('hidden'), 4000);
  }
}

// --------------------------------------------------------------------------
// EVENT LISTENERS & USER INTERACTION
// --------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {

  // 1. Initial Prompt for Geolocation (User Explicit Request)
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeatherData({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      (err) => {
        console.log('Geolocation denied/unavailable, defaulting to Mahendranagar:', err.message);
        fetchWeatherData('Mahendranagar');
      },
      { timeout: 8000 }
    );
  } else {
    fetchWeatherData('Mahendranagar');
  }

  // 2. Geolocation Button Click Trigger
  const geoBtn = document.getElementById('geoBtn');
  if (geoBtn) {
    geoBtn.addEventListener('click', () => {
      if ('geolocation' in navigator) {
        document.getElementById('cityName').textContent = 'Locating...';
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            fetchWeatherData({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          },
          () => {
            alert('Unable to retrieve location. Please check browser permissions.');
            fetchWeatherData(state.currentCity);
          }
        );
      }
    });
  }

  // 3. Search Form & Autocomplete
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const suggestionsBox = document.getElementById('searchSuggestions');

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = searchInput.value.trim();
      if (val) {
        fetchWeatherData(val);
        searchInput.value = '';
        suggestionsBox.classList.add('hidden');
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase().trim();
      if (!query) {
        suggestionsBox.classList.add('hidden');
        return;
      }
      const matches = CITY_SUGGESTIONS.filter(c => c.toLowerCase().includes(query));
      if (matches.length > 0) {
        suggestionsBox.innerHTML = matches.map(c => `<div class="suggestion-item">${c}</div>`).join('');
        suggestionsBox.classList.remove('hidden');
      } else {
        suggestionsBox.classList.add('hidden');
      }
    });
  }

  if (suggestionsBox) {
    suggestionsBox.addEventListener('click', (e) => {
      if (e.target.classList.contains('suggestion-item')) {
        const cityName = e.target.textContent.split(',')[0];
        fetchWeatherData(cityName);
        searchInput.value = '';
        suggestionsBox.classList.add('hidden');
      }
    });
  }

  // Hide suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (searchForm && !searchForm.contains(e.target) && suggestionsBox) {
      suggestionsBox.classList.add('hidden');
    }
  });

  // 4. Quick City Chips
  const chipsContainer = document.getElementById('quickChips');
  if (chipsContainer) {
    chipsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('chip-btn')) {
        const city = e.target.dataset.city;
        fetchWeatherData(city);
      }
    });
  }

  // 5. Unit Converter Toggle (°C / °F)
  const unitToggle = document.getElementById('unitToggle');
  if (unitToggle) {
    unitToggle.addEventListener('click', () => {
      state.unit = state.unit === 'C' ? 'F' : 'C';
      localStorage.setItem('temp_unit', state.unit);

      document.getElementById('unitC').classList.toggle('active', state.unit === 'C');
      document.getElementById('unitF').classList.toggle('active', state.unit === 'F');

      // Re-fetch or re-render current data
      fetchWeatherData(state.currentCity);
    });
  }

  // 6. API Key Modal Management
  const apiModal = document.getElementById('apiModal');
  const apiModalBtn = document.getElementById('apiModalBtn');
  const closeApiModal = document.getElementById('closeApiModal');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
  const clearApiKeyBtn = document.getElementById('clearApiKeyBtn');
  const apiCheckStatus = document.getElementById('apiCheckStatus');

  if (apiModalBtn) {
    apiModalBtn.addEventListener('click', () => {
      apiKeyInput.value = state.apiKey;
      apiModal.classList.remove('hidden');
    });
  }

  if (closeApiModal) {
    closeApiModal.addEventListener('click', () => apiModal.classList.add('hidden'));
  }

  if (saveApiKeyBtn) {
    saveApiKeyBtn.addEventListener('click', async () => {
      const key = apiKeyInput.value.trim();
      if (!key) {
        apiCheckStatus.textContent = 'Please enter a valid API Key.';
        apiCheckStatus.className = 'api-check-status error';
        apiCheckStatus.classList.remove('hidden');
        return;
      }

      // Validate key with a lightweight test call
      apiCheckStatus.textContent = 'Validating API Key...';
      apiCheckStatus.className = 'api-check-status';
      apiCheckStatus.classList.remove('hidden');

      try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=London&appid=${key}`);
        if (res.ok) {
          state.apiKey = key;
          localStorage.setItem('owm_api_key', key);
          apiCheckStatus.textContent = 'Success! API Key connected to OpenWeatherMap.';
          apiCheckStatus.className = 'api-check-status success';
          setTimeout(() => {
            apiModal.classList.add('hidden');
            fetchWeatherData(state.currentCity);
          }, 1500);
        } else {
          throw new Error('Invalid Key');
        }
      } catch (err) {
        apiCheckStatus.textContent = 'Invalid API key or unauthorized. Please check key.';
        apiCheckStatus.className = 'api-check-status error';
      }
    });
  }

  if (clearApiKeyBtn) {
    clearApiKeyBtn.addEventListener('click', () => {
      state.apiKey = '';
      localStorage.removeItem('owm_api_key');
      apiKeyInput.value = '';
      apiCheckStatus.textContent = 'Switched to Demo Showcase Mode.';
      apiCheckStatus.className = 'api-check-status success';
      apiCheckStatus.classList.remove('hidden');
      setTimeout(() => {
        apiModal.classList.add('hidden');
        loadMockCity('Mahendranagar');
      }, 1000);
    });
  }
});
