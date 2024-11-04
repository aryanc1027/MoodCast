# MoodCast: Weather-Based Music Recommendation App

MoodCast is a web application that combines real-time weather data with music recommendations from Spotify, creating a unique user experience that matches your local weather conditions with suitable playlists.

## Features

- Real-time weather information for any city globally
- 5-day weather forecast
- Spotify playlist recommendations based on current weather conditions
- Temperature unit toggle (Celsius/Fahrenheit)
- Spotify user authentication
- Responsive design for various device sizes

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **APIs**: OpenWeatherMap API, Spotify Web API
- **Authentication**: Spotify OAuth 2.0

## Setup and Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/moodcast.git
   cd moodcast
2. **API Keys**: 
    Obtain an API key from OpenWeatherMap.
    Create a Spotify Developer account and obtain your Client ID and Client Secret from the Spotify Developer Dashboard.
3. Create a file named apiKeys.js in the project root and add your API keys:
    - export const WEATHER_API_KEY = 'your_openweathermap_api_key';
    - export const SPOTIFY_CLIENT_ID = 'your_spotify_client_id';
    - export const SPOTIFY_CLIENT_SECRET = 'your_spotify_client_secret';
4. Update the REDIRECT_URI in script.js to match your deployment URL or local development server.
5. Serve the application using a local development server (run python3 https_server.py) or deploy to a hosting service of your choice.


