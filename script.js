import Weather from './WeatherService.js';
import Music from './MusicService.js';
import { WEATHER_API_KEY, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, REDIRECT_URI } from './apiKeys.js';

const weather = new Weather(WEATHER_API_KEY);
const music = new Music(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET);



let isCelsius = true;

function checkLoginState() {
    const accessToken = localStorage.getItem('spotifyAccessToken');
    if(accessToken) {
        music.setAccessToken(accessToken);
        updateUI(true);
    }
    else {
        updateUI(false);
    }
}
function getSpotifyAccessToken() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        
        exchangeCodeForToken(code);
        return null; 
    }

    const accessToken = localStorage.getItem('spotifyAccessToken');
    return accessToken;
}

async function exchangeCodeForToken(code) {
    const tokenEndpoint = 'https://accounts.spotify.com/api/token';
    const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        client_id: SPOTIFY_CLIENT_ID,
        client_secret: SPOTIFY_CLIENT_SECRET 
    });

    try {
        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body
        });

        if (!response.ok) {
            throw new Error('Failed to exchange code for token');
        }

        const data = await response.json();
        localStorage.setItem('spotifyAccessToken', data.access_token);
        music.setAccessToken(data.access_token);
        updateUI(true);
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        updateUI(false);
    }
}


function redirectToSpotifyLogin() {
    //console.log('Redirecting to Spotify login...');
    const scopes = 'playlist-read-private';
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scopes)}`;
    //console.log('Auth URL:', authUrl);
    window.location.href = authUrl;
}


document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    loginButton.addEventListener('click', () => {
        redirectToSpotifyLogin();
    });

    const toggleButton = document.getElementById('unit-toggle');
    toggleButton.addEventListener('click', () => {
        changeTemperatureUnit(); 
    });

    const searchForm = document.getElementById('search-form');
    searchForm.addEventListener('submit', handleSearch);

    getSpotifyAccessToken();

    checkLoginState();
});



function changeTemperatureUnit() {
    isCelsius = !isCelsius;
    const weatherDisplay = document.getElementById('weather-display');
    const temperatureElement = weatherDisplay.querySelector('p:nth-child(3)');
    
    if (temperatureElement) {
        const curr = parseFloat(temperatureElement.textContent.split(':')[1]);
        const newTemp = isCelsius ? convertToCelsius(curr) : convertToFahrenheit(curr);
        temperatureElement.textContent = `Temperature: ${newTemp.toFixed(1)} ${isCelsius ? '°C' : '°F'}`;
    }
    
    const forecastDisplay = document.getElementById('forecast-display');
    const forecastTemps = forecastDisplay.querySelectorAll('.forecast-day p:nth-child(3)');
    forecastTemps.forEach(tempElement => {
        const curr = parseFloat(tempElement.textContent);
        const newTemp = isCelsius ? convertToCelsius(curr) : convertToFahrenheit(curr);
        tempElement.textContent = `${newTemp.toFixed(1)}${isCelsius ? '°C' : '°F'}`;
    });

    document.getElementById('unit-toggle').textContent = isCelsius ? '°C/°F' : '°F/°C';
}

function convertToFahrenheit(temp) {
    return (temp * (9/5)) + 32;
}

function convertToCelsius(temp) {
    return (temp - 32) * (5/9);
}


async function handleSearch(event) {
    event.preventDefault();
    const cityInput = document.getElementById('city-input');
    const city = cityInput.value;

    if (city) {
        try {
            const weatherData = await weather.getWeather(city);
            displayWeather(weatherData);

            const forcastData = await weather.getForcast(city);
            displayForcast(forcastData);

            document.querySelector('.container').classList.add('search-performed');

            const accessToken = localStorage.getItem('spotifyAccessToken');
            if (accessToken) {
                music.setAccessToken(accessToken); 
                const playlists = await music.getPlaylistRecommendations(weatherData.condition);
                displayPlaylists(playlists);
            } else {
                console.log('User not logged in to Spotify');
            }
        } catch (e) {
            console.error(`Error fetching data: ${e.message}`);
            alert("We couldn't find that city. Could you double-check the spelling?");
        }
    }
}

function displayForcast(forecastData) {
    const forecastDisplay = document.getElementById('forecast-display');
    forecastDisplay.innerHTML = '<h2>5-Day Forecast</h2>';

    const dailyForecasts = {};

    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!dailyForecasts[date]) {
            dailyForecasts[date] = item;
        }
    });

    Object.values(dailyForecasts).slice(0, 5).forEach(day => {
        const date = new Date(day.dt * 1000).toDateString();
        let temp = day.main.temp;
        const description = day.weather[0].description;
        const icon = day.weather[0].icon;

        if (!isCelsius) {
            temp = convertToFahrenheit(temp);
        }

        const unit = isCelsius ? '°C' : '°F';

        const dayElement = document.createElement('div');
        dayElement.classList.add('forecast-day');
        dayElement.innerHTML = `
            <p>${date}</p>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}">
            <p>${temp.toFixed(1)}${unit}</p>
            <p>${description.charAt(0).toUpperCase() + description.slice(1)}</p>
        `;
        forecastDisplay.appendChild(dayElement);
    });
}


function displayWeather(weatherData) {
    const weatherDisplay = document.getElementById('weather-display');
    weatherDisplay.innerHTML = '';

    const weatherCard = document.createElement('div');
    weatherCard.classList.add('weather-card');
    //console.log`Weather card: ${weatherCard}`
    const temperature = isCelsius ? weatherData.temperature : convertToFahrenheit(weatherData.temperature);
    const unit = isCelsius ? '°C' : '°F';
    weatherCard.innerHTML = `
        <h2>Weather in ${weatherData.city}, ${weatherData.country}</h2>
        <img src="${weatherData.icon}" alt="${weatherData.description}">
        <p>Temperature: ${temperature.toFixed(1)} ${unit}</p>
        <p>Condition: ${weatherData.condition.charAt(0).toUpperCase() + weatherData.condition.slice(1)}</p>
        <p>Description: ${weatherData.description.charAt(0).toUpperCase() + weatherData.description.slice(1)}</p>
    `;
    //console.log('Weather card:', weatherCard)

    weatherDisplay.appendChild(weatherCard);

    document.body.style.background = getBackgroundStyle(weatherData.condition);
}


function displayPlaylists(playlists) {
    const playlistDisplay = document.getElementById('playlist-display');
    playlistDisplay.innerHTML = '';

    playlists.forEach(playlist => {
        const playlistCard = document.createElement('div');
        playlistCard.classList.add('playlist-card');

        playlistCard.innerHTML = `
            <h3>${playlist.name}</h3>
            <p>${playlist.description}</p>
            <a href="${playlist.url}" target="_blank">Listen on Spotify</a>
            <img src="${playlist.imageUrl}" alt="Playlist cover image">
        `;

        playlistDisplay.appendChild(playlistCard);
    });
}

function updateUI(isLoggedIn) {
    const loginButton = document.getElementById('login-button');
    const searchForm = document.getElementById('search-form');

    if (isLoggedIn) {
        loginButton.style.display = 'none';
        searchForm.style.display = 'block';
    } else {
        loginButton.style.display = 'block';
        searchForm.style.display = 'none';
    }
}

function getBackgroundStyle(weatherCondition) {
    const backgroundMap = {
        'Clear': 'linear-gradient(to bottom right, #e0eafc, #cfdef3)',
        'Clouds': 'linear-gradient(to bottom right, #bdc3c7, #2c3e50)',
        'Rain': 'linear-gradient(to bottom right, #3a7bd5, #3a6073)',
        'Snow': 'linear-gradient(to bottom right, #e6dada, #274046)',
        'Thunderstorm': 'linear-gradient(to bottom right, #373b44, #4286f4)',
        'Drizzle': 'linear-gradient(to bottom right, #89f7fe, #66a6ff)',
        'Mist': 'linear-gradient(to bottom right, #606c88, #3f4c6b)'
    };
    return backgroundMap[weatherCondition] || 'linear-gradient(to bottom right, #e0eafc, #cfdef3)';
}

