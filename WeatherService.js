class Weather {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.openweathermap.org/data/2.5/';
    }

    async getWeather(city) {
        try {
            const url = `${this.baseUrl}/weather?q=${city}&appid=${this.apiKey}&units=metric`;
            const response = await fetch(url);
    
            if(!response.ok) {
                throw new Error(`Failed to fetch weather data: ${response.status}`);
            }
            const data = await response.json();
            //console.log('Raw weather data:', data);  
            return this.parseWeatherData(data);
        }
        catch(e) {
            console.error('Error in getWeather:', e);  
            throw new Error(`Error fetching weather data: ${e.message}`);
        }
    }
    async getForcast(city) {
        try {
            const weatherData = await this.getWeather(city);
            const lat = weatherData.coord.lat;
            const lon = weatherData.coord.lon;
    
            const url = `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch forecast data: ${response.status}`);
            }
            return response.json();
        } catch (error) {
            console.error('Error in getForcast:', error);
            throw error;
        }
    }

    parseWeatherData(data) {
        const parsedData = {
            temperature: data.main.temp,
            condition: data.weather[0].main,
            description: data.weather[0].description,
            icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
            city: data.name,
            country: data.sys.country,
            coord: {
                lat: data.coord.lat,
                lon: data.coord.lon
            }
        };
        console.log('Parsed weather data:', parsedData);
        return parsedData;
    }

    getMoodFromWeather(condition) {
        const moodMap  = {
            'Clear': 'happy',
            'Clouds': 'chill',
            'Rain': 'melancholic',
            'Snow': 'peaceful',
            'Thunderstorm': 'intense',
            'Drizzle': 'relaxed',
            'Mist': 'mysterious',
        };
        return moodMap[condition] || 'neutral';
    }
}

export default Weather;