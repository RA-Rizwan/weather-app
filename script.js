const apiKey = '362e06cf56944b958aa91411251805'; // Replace with your WeatherAPI.com API key
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const cityElement = document.getElementById('city');
const tempElement = document.getElementById('temp');
const humidityElement = document.getElementById('humidity');
const windElement = document.getElementById('wind');
const descriptionElement = document.getElementById('description');
const weatherIcon = document.getElementById('weather-icon');
const suggestionsContainer = document.getElementById('suggestions');

let debounceTimer;

// Function to get city suggestions
async function getCitySuggestions(query) {
    if (query.length < 2) return [];
    
    try {
        const response = await fetch(
            `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${query}`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch suggestions');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return [];
    }
}

// Function to display suggestions
function displaySuggestions(suggestions) {
    suggestionsContainer.innerHTML = '';
    
    if (suggestions.length === 0) {
        suggestionsContainer.classList.remove('active');
        return;
    }

    suggestions.forEach(city => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.textContent = `${city.name}, ${city.country}`;
        
        suggestionItem.addEventListener('click', () => {
            cityInput.value = `${city.name}, ${city.country}`;
            suggestionsContainer.classList.remove('active');
            getWeatherData(city.name);
        });
        
        suggestionsContainer.appendChild(suggestionItem);
    });
    
    suggestionsContainer.classList.add('active');
}

// Function to get weather data by coordinates
async function getWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(
            `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}&aqi=no`
        );
        
        if (!response.ok) {
            throw new Error('Weather data not found');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        alert('Error: ' + error.message);
        return null;
    }
}

// Function to get weather data by city name
async function getWeatherData(city) {
    try {
        const response = await fetch(
            `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`
        );
        
        if (!response.ok) {
            throw new Error('City not found');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        alert('Error: ' + error.message);
        return null;
    }
}

// Function to update UI with weather data
function updateWeatherUI(data) {
    cityElement.textContent = data.location.name;
    tempElement.textContent = Math.round(data.current.temp_c);
    humidityElement.textContent = data.current.humidity + '%';
    windElement.textContent = data.current.wind_kph + ' km/h';
    descriptionElement.textContent = data.current.condition.text;
    
    // Update weather icon
    const iconCode = data.current.condition.icon;
    weatherIcon.src = `https:${iconCode}`;
    weatherIcon.alt = data.current.condition.text;
}

// Function to get user's location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const weatherData = await getWeatherByCoords(latitude, longitude);
                if (weatherData) {
                    updateWeatherUI(weatherData);
                    cityInput.value = weatherData.location.name;
                }
            },
            (error) => {
                console.log('Error getting location:', error);
                alert('Unable to get your location. Please enter a city manually.');
            }
        );
    } else {
        alert('Geolocation is not supported by your browser. Please enter a city manually.');
    }
}

// Event listener for input changes with debounce
cityInput.addEventListener('input', async (e) => {
    clearTimeout(debounceTimer);
    const query = e.target.value.trim();
    
    if (query.length >= 2) {
        debounceTimer = setTimeout(async () => {
            const suggestions = await getCitySuggestions(query);
            displaySuggestions(suggestions);
        }, 300);
    } else {
        suggestionsContainer.classList.remove('active');
    }
});

// Close suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!cityInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
        suggestionsContainer.classList.remove('active');
    }
});

// Get weather for user's location when page loads
getUserLocation();

// Event listener for search button
searchBtn.addEventListener('click', async () => {
    const city = cityInput.value.trim();
    if (city) {
        const weatherData = await getWeatherData(city);
        if (weatherData) {
            updateWeatherUI(weatherData);
        }
    }
});

// Event listener for Enter key
cityInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            const weatherData = await getWeatherData(city);
            if (weatherData) {
                updateWeatherUI(weatherData);
            }
        }
    }
}); 