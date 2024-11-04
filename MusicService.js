class Music {
    constructor(clientId, clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.baseUrl = 'https://api.spotify.com/v1';
        this.tokenUrl = 'https://accounts.spotify.com/api/token';
        this.accessToken = null;
        this.tokenExpiration = null;
    }

    async getPlaylistRecommendations(weatherCondition) {
        if(!this.accessToken) {
            throw new Error('User not logged in to Spotify');
        }
        if(!this.accessToken || this.isTokenExpired()) {
            await this.refreshToken();
        }

        const mood = this.mapWeatherToMood(weatherCondition);
        const endpoint = `${this.baseUrl}/search?q=${mood}&type=playlist`;

        try {
            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            if(!response.ok) {
                throw new Error(`Failed to fetch playlist data: ${response.status}`);
            }

            const data = await response.json();
            return this.parsePlaylistData(data.playlists.items);
        }
        catch(e) {
            throw new Error(`Error fetching playlist data: ${e.message}`);
        }
    }

    isTokenExpired() {
        return this.tokenExpiration && Date.now() > this.tokenExpiration;
    }

    async refreshToken() {
        const refreshToken = localStorage.getItem('spotifyRefreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }
    
        const response = await fetch(this.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(this.clientId + ':' + this.clientSecret)
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            })
        });
    
        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }
    
        const data = await response.json();
        this.accessToken = data.access_token;
        this.tokenExpiration = Date.now() + (data.expires_in * 1000);
        localStorage.setItem('spotifyAccessToken', this.accessToken);
    }
    
    


    async handleSpotifyCallback(code) {
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(this.clientId + ':' + this.clientSecret)
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI
            })
        });
    
        if (!tokenResponse.ok) {
            throw new Error('Failed to obtain access token');
        }
    
        const tokenData = await tokenResponse.json();
        this.accessToken = tokenData.access_token;
        this.tokenExpiration = Date.now() + (tokenData.expires_in * 1000);
        localStorage.setItem('spotifyAccessToken', this.accessToken);
        localStorage.setItem('spotifyRefreshToken', tokenData.refresh_token);
        return this.accessToken;
    }

    setAccessToken(token) {
        this.accessToken = token;
    }

    async handleSpotifyCallback(code) {
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(this.clientId + ':' + this.clientSecret)
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI
            })
        });
    
        if (!tokenResponse.ok) {
            throw new Error('Failed to obtain access token');
        }
    
        const tokenData = await tokenResponse.json();
        this.accessToken = tokenData.access_token;
        this.tokenExpiration = Date.now() + (tokenData.expires_in * 1000);
        localStorage.setItem('spotifyAccessToken', this.accessToken);
        return this.accessToken;
    }

    parsePlaylistData(playlists) {
        return playlists.map(playlist => ({
            name: playlist.name,
            description: playlist.description,
            url: playlist.external_urls.spotify,
            imageUrl: playlist.images[0]?.url,
        }));
    }

    mapWeatherToMood(condition) {
        const moodMap = {
          'Clear': 'happy',
          'Clouds': 'chill',
          'Rain': 'melancholy',
          'Snow': 'peaceful',
          'Thunderstorm': 'intense',
          'Drizzle': 'relaxing',
          'Mist': 'ambient'
        };
        return moodMap[condition] || 'neutral';
    }
}

export default Music;