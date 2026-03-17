//home.js - Main JavaScript for the Chamber of Commerce homepage
const WEATHER_API_KEY = 'c1221b41737a558ff957e8c84e8bb5a8';

const LAT = 40.4406;
const LON = -79.9959;
const UNITS = 'imperial'; 
const WEATHER_BASE = 'https://api.openweathermap.org/data/2.5';
const MEMBERS_URL = 'data/members.json';

const hamburger     = document.getElementById('hamburger');
const navMenu       = document.getElementById('nav-menu');
const copyrightYear = document.getElementById('copyright-year');
const lastModified  = document.getElementById('last-modified');
const weatherCurrent = document.getElementById('weather-current');
const weatherForecast = document.getElementById('weather-forecast');
const spotlightsOutput = document.getElementById('spotlights-output');

if (copyrightYear) copyrightYear.textContent = new Date().getFullYear();
if (lastModified)  lastModified.textContent  = document.lastModified;

hamburger.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', String(isOpen));
});

navMenu.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    navMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
});


// Map OWM icon codes to simple SVG weather icons rendered inline
function getWeatherIcon(iconCode) {
  const isNight = iconCode.endsWith('n');
  const base = iconCode.slice(0, -1); 

  const icons = {
    '01': isNight
      ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="none">
           <path d="M38 10 A20 20 0 1 0 54 38 A14 14 0 0 1 38 10Z" fill="#FFB800"/>
         </svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="none">
           <circle cx="32" cy="32" r="12" fill="#FFB800"/>
           <g stroke="#FFB800" stroke-width="2.5" stroke-linecap="round">
             <line x1="32" y1="6" x2="32" y2="14"/><line x1="32" y1="50" x2="32" y2="58"/>
             <line x1="6" y1="32" x2="14" y2="32"/><line x1="50" y1="32" x2="58" y2="32"/>
             <line x1="13" y1="13" x2="19" y2="19"/><line x1="45" y1="45" x2="51" y2="51"/>
             <line x1="51" y1="13" x2="45" y2="19"/><line x1="19" y1="45" x2="13" y2="51"/>
           </g>
         </svg>`,
    '02': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="none">
             <circle cx="22" cy="28" r="10" fill="#FFB800"/>
             <ellipse cx="36" cy="36" rx="16" ry="10" fill="#aab8c2"/>
             <ellipse cx="22" cy="38" rx="12" ry="8" fill="#c8d6df"/>
           </svg>`,
    '03': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="none">
             <ellipse cx="32" cy="38" rx="20" ry="12" fill="#aab8c2"/>
             <ellipse cx="22" cy="34" rx="14" ry="10" fill="#c8d6df"/>
           </svg>`,
    '04': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="none">
             <ellipse cx="32" cy="40" rx="20" ry="12" fill="#7a8c99"/>
             <ellipse cx="22" cy="34" rx="14" ry="10" fill="#aab8c2"/>
             <ellipse cx="40" cy="30" rx="12" ry="8" fill="#8fa0ad"/>
           </svg>`,
    '09': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="none">
             <ellipse cx="32" cy="28" rx="20" ry="12" fill="#7a8c99"/>
             <g stroke="#6ab0d4" stroke-width="2" stroke-linecap="round">
               <line x1="22" y1="42" x2="20" y2="52"/><line x1="32" y1="42" x2="30" y2="52"/>
               <line x1="42" y1="42" x2="40" y2="52"/>
             </g>
           </svg>`,
    '10': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="none">
             <circle cx="20" cy="22" r="8" fill="#FFB800"/>
             <ellipse cx="34" cy="28" rx="18" ry="11" fill="#7a8c99"/>
             <g stroke="#6ab0d4" stroke-width="2" stroke-linecap="round">
               <line x1="22" y1="42" x2="20" y2="52"/><line x1="32" y1="42" x2="30" y2="52"/>
               <line x1="42" y1="42" x2="40" y2="52"/>
             </g>
           </svg>`,
    '11': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="none">
             <ellipse cx="32" cy="24" rx="20" ry="12" fill="#4a5568"/>
             <polyline points="36,36 28,48 34,48 26,60" fill="none" stroke="#FFB800" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
           </svg>`,
    '13': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="none">
             <ellipse cx="32" cy="28" rx="20" ry="12" fill="#aab8c2"/>
             <g fill="#c8d6df">
               <circle cx="22" cy="44" r="2.5"/><circle cx="32" cy="48" r="2.5"/>
               <circle cx="42" cy="44" r="2.5"/><circle cx="27" cy="52" r="2.5"/>
               <circle cx="37" cy="52" r="2.5"/>
             </g>
           </svg>`,
    '50': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="none">
             <g stroke="#aab8c2" stroke-width="2" stroke-linecap="round">
               <line x1="10" y1="28" x2="54" y2="28"/><line x1="10" y1="36" x2="54" y2="36"/>
               <line x1="10" y1="44" x2="54" y2="44"/>
             </g>
           </svg>`,
  };

  return icons[base] ?? icons['03'];
}

async function fetchWeather() {
  if (WEATHER_API_KEY === 'c1221b41737a558ff957e8c84e8bb5a8') {
    renderWeatherPlaceholder();
    return;
  }

  try {
    const currentRes = await fetch(
      `${WEATHER_BASE}/weather?lat=${LAT}&lon=${LON}&units=${UNITS}&appid=${WEATHER_API_KEY}`
    );
    if (!currentRes.ok) throw new Error('Weather fetch failed');
    const current = await currentRes.json();

    const forecastRes = await fetch(
      `${WEATHER_BASE}/forecast?lat=${LAT}&lon=${LON}&units=${UNITS}&appid=${WEATHER_API_KEY}`
    );
    if (!forecastRes.ok) throw new Error('Forecast fetch failed');
    const forecastData = await forecastRes.json();

    renderCurrentWeather(current);
    renderForecast(forecastData.list);

  } catch (err) {
    console.error('Weather error:', err);
    weatherCurrent.innerHTML  = `<p class="weather-error">Weather data unavailable.</p>`;
    weatherForecast.innerHTML = `<p class="weather-error">Forecast unavailable.</p>`;
  }
}

function renderCurrentWeather(data) {
  const { main, weather, wind, sys } = data;
  const tempUnit = UNITS === 'imperial' ? '°F' : '°C';
  const iconCode = weather[0].icon;
  const description = weather[0].description
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const sunrise = new Date(sys.sunrise * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const sunset  = new Date(sys.sunset  * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  weatherCurrent.innerHTML = `
    <div class="weather-main">
      <div class="weather-icon">${getWeatherIcon(iconCode)}</div>
      <div class="weather-temps">
        <span class="weather-temp">${Math.round(main.temp)}${tempUnit}</span>
        <span class="weather-desc">${description}</span>
      </div>
    </div>
    <ul class="weather-details">
      <li><span class="wd-label">High</span><span>${Math.round(main.temp_max)}${tempUnit}</span></li>
      <li><span class="wd-label">Low</span><span>${Math.round(main.temp_min)}${tempUnit}</span></li>
      <li><span class="wd-label">Humidity</span><span>${main.humidity}%</span></li>
      <li><span class="wd-label">Wind</span><span>${Math.round(wind.speed)} mph</span></li>
      <li><span class="wd-label">Sunrise</span><span>${sunrise}</span></li>
      <li><span class="wd-label">Sunset</span><span>${sunset}</span></li>
    </ul>
  `;
}

function renderForecast(list) {
  const tempUnit = UNITS === 'imperial' ? '°F' : '°C';

  const today = new Date().toDateString();
  const dayMap = new Map();

  for (const item of list) {
    const date = new Date(item.dt * 1000);
    const key  = date.toDateString();
    if (key === today) continue;                     // skip today
    if (dayMap.size >= 3) break;
    if (!dayMap.has(key)) {
      dayMap.set(key, item);
    }
  }

  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  let html = '<ul class="forecast-list">';
  for (const [dateStr, item] of dayMap) {
    const date = new Date(dateStr);
    const dayName = days[date.getDay()];
    const icon = getWeatherIcon(item.weather[0].icon);
    const hi  = Math.round(item.main.temp_max);
    const lo  = Math.round(item.main.temp_min);

    html += `
      <li class="forecast-day">
        <span class="forecast-name">${dayName}</span>
        <span class="forecast-icon">${icon}</span>
        <span class="forecast-temp"><strong>${hi}${tempUnit}</strong> / ${lo}${tempUnit}</span>
      </li>
    `;
  }
  html += '</ul>';

  weatherForecast.innerHTML = html;
}

function renderWeatherPlaceholder() {
  const tempUnit = UNITS === 'imperial' ? '°F' : '°C';

  weatherCurrent.innerHTML = `
    <div class="weather-main">
      <div class="weather-icon">${getWeatherIcon('02d')}</div>
      <div class="weather-temps">
        <span class="weather-temp">72${tempUnit}</span>
        <span class="weather-desc">Partly Cloudy</span>
      </div>
    </div>
    <ul class="weather-details">
      <li><span class="wd-label">High</span><span>78${tempUnit}</span></li>
      <li><span class="wd-label">Low</span><span>58${tempUnit}</span></li>
      <li><span class="wd-label">Humidity</span><span>62%</span></li>
      <li><span class="wd-label">Wind</span><span>10 mph</span></li>
      <li><span class="wd-label">Sunrise</span><span>6:44 AM</span></li>
      <li><span class="wd-label">Sunset</span><span>7:58 PM</span></li>
    </ul>
    <p class="weather-api-note">⚠ Add your OpenWeatherMap API key in home.js to show live data.</p>
  `;

  weatherForecast.innerHTML = `
    <ul class="forecast-list">
      <li class="forecast-day">
        <span class="forecast-name">Wednesday</span>
        <span class="forecast-icon">${getWeatherIcon('01d')}</span>
        <span class="forecast-temp"><strong>80${tempUnit}</strong> / 61${tempUnit}</span>
      </li>
      <li class="forecast-day">
        <span class="forecast-name">Thursday</span>
        <span class="forecast-icon">${getWeatherIcon('10d')}</span>
        <span class="forecast-temp"><strong>74${tempUnit}</strong> / 55${tempUnit}</span>
      </li>
      <li class="forecast-day">
        <span class="forecast-name">Friday</span>
        <span class="forecast-icon">${getWeatherIcon('04d')}</span>
        <span class="forecast-temp"><strong>68${tempUnit}</strong> / 52${tempUnit}</span>
      </li>
    </ul>
    <p class="weather-api-note">⚠ Add your OpenWeatherMap API key in home.js to show live data.</p>
  `;
}


const BADGE_LABELS = { 2: 'Silver Member', 3: 'Gold Member' };
const BADGE_CLASSES = { 2: 'badge-silver', 3: 'badge-gold' };

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildSpotlightCard(member) {
  const badgeLabel = BADGE_LABELS[member.membershipLevel] ?? 'Member';
  const badgeClass = BADGE_CLASSES[member.membershipLevel] ?? 'badge-member';

  const card = document.createElement('article');
  card.className = 'spotlight-card';

  card.innerHTML = `
    <div class="spotlight-img-wrap">
      <img
        src="images/${member.image}"
        alt="${member.name} logo"
        loading="lazy"
        onerror="this.src='images/placeholder.svg';"
      />
    </div>
    <div class="spotlight-body">
      <h3 class="spotlight-name">${member.name}</h3>
      <span class="badge ${badgeClass}">${badgeLabel}</span>
      <ul class="spotlight-info">
        <li>
          <span class="label">Phone</span>
          <a href="tel:${member.phone.replace(/\D/g,'')}">${member.phone}</a>
        </li>
        <li>
          <span class="label">Address</span>
          <span>${member.address}</span>
        </li>
        <li>
          <span class="label">Website</span>
          <a href="${member.website}" target="_blank" rel="noopener noreferrer">
            ${member.website.replace(/^https?:\/\//,'')}
          </a>
        </li>
      </ul>
    </div>
  `;

  return card;
}

async function loadSpotlights() {
  try {
    const res = await fetch(MEMBERS_URL);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const data = await res.json();

    const eligible = data.members.filter(m => m.membershipLevel >= 2);
    const selected = shuffle(eligible).slice(0, 3);

    spotlightsOutput.innerHTML = '';
    selected.forEach(m => spotlightsOutput.appendChild(buildSpotlightCard(m)));

  } catch (err) {
    console.error('Spotlights error:', err);
    spotlightsOutput.innerHTML = '<p class="weather-error">Could not load member spotlights.</p>';
  }
}

fetchWeather();
loadSpotlights();