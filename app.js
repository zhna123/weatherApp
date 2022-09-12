const HIGH = 'H: ';
const LOW = 'L: ';
const FEEL = 'Feels like ';

class Weather {
    constructor(minTemp, maxTemp, currentTemp, feelsLike, description, wind, name) {
        this.minTemp = minTemp.toFixed(1);
        this.maxTemp = maxTemp.toFixed(1);
        this.currentTemp = currentTemp.toFixed(1);
        this.feelsLike = feelsLike.toFixed(1);
        this.description = description;
        this.wind = wind;   
        this.name = name;
    }
}

const imageDiv = document.querySelector('.image');
const tempDiv = document.querySelector('.temp');
const nameDiv = document.querySelector('.weather_location');
const errorDiv = document.querySelector('.error');
const weatherSummaryDiv = document.querySelector('.summary');
const currentTempDiv = document.querySelector('.current');
const highTempDiv = document.querySelector('.high');
const lowTempDiv = document.querySelector('.low');
const feelsTempDiv = document.querySelector('.feel');
const image = document.querySelector('img');

function getApiURLByCity(cityName, unit) {
    return `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=${unit}&appid=73e9d4d63371c9e3e5c2d2b5b375f125`;
}

function getApiURLByZip(zipCode, unit) {
    return `https://api.openweathermap.org/data/2.5/weather?zip=${zipCode}&units=${unit}&appid=73e9d4d63371c9e3e5c2d2b5b375f125`;
}

function getApiURLByState(cityName, stateCode, countryCode, unit) {
    return `https://api.openweathermap.org/data/2.5/weather?q=${cityName},${stateCode},${countryCode}&units=${unit}&appid=73e9d4d63371c9e3e5c2d2b5b375f125`;
}

function getImageURL(keyword) {
    return `https://api.giphy.com/v1/gifs/translate?api_key=0a5IZqIcSQcj0FtfCoDKaAUfsYNAcXw9&s=${keyword}`;
}

async function fetchWeatherDataByCity(cityName, displayFahrenheit) {
    const response = await fetch(getApiURLByCity(cityName, displayFahrenheit? 'imperial' : 'metric'), {mode: 'cors'});
    return await response.json();
    
}

async function fetchWeatherDataByZip(zipCode, displayFahrenheit) {
    const response = await fetch(getApiURLByZip(zipCode, displayFahrenheit? 'imperial' : 'metric'), {mode: 'cors'});
    return await response.json();
}

async function fetchWeatherDataByState(cityName, stateCode, countryCode, displayFahrenheit) {
    const response = await fetch(getApiURLByState(cityName, stateCode, countryCode, displayFahrenheit? 'imperial' : 'metric'), {mode: 'cors'});
    return await response.json();
}

async function fetchNewImage(keyword) {
    const response = await fetch(getImageURL('weather sky ' + keyword), {mode: 'cors'});
    return await response.json();
}

async function fetchRawData(locationArray, displayFahrenheit) {
    // parse userInput
    // call different functions from above
    // return response 
    if (locationArray.length === 1) {
        // only digits
        if(/^[0-9]+$/.test(locationArray[0])) {
            return await fetchWeatherDataByZip(locationArray[0], displayFahrenheit);
        } else {
            return await fetchWeatherDataByCity(locationArray[0], displayFahrenheit);
        }
    } else if (locationArray.length === 3) {
        return await fetchWeatherDataByState(locationArray[0], locationArray[1], locationArray[2], displayFahrenheit);
    } else {
        // wrong input
        return null;
    }
    
}

// main function to call from client
async function fetchWeatherData(userInput, displayFahrenheit) {
    const locationArray = userInput.split(',');
    const response = await fetchRawData(locationArray, displayFahrenheit);
    // error for invalid input
    if (response === null) {
        console.log('Must enter correct input.')
        const message = "Must enter one of the following: city / city,state,country / zipcode";
        throwError(message);
    }
        // mainly to throw an error for 404 - not found
    if(response.cod !== 200) {
        console.log('Location not found!' + response.cod)
        throwError('Location not found - ' + response.message);
    }
    const weather = extractWeather(response);
    return weather;
}

function throwError(message) {
    imageDiv.style.display = 'none';
    tempDiv.style.display = 'none';
    nameDiv.style.display = 'none';

    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    throw new Error(message);
}

function extractWeather(data) {
    console.log(data)

    const minTemp = data.main.temp_min;
    const maxTemp = data.main.temp_max;
    const currentTemp = data.main.temp;
    const feelsLike = data.main.feels_like;
    const description = data.weather[0].description;
    const wind = data.wind.speed;
    const name = data.name;

    const weather = new Weather(minTemp, maxTemp, currentTemp, feelsLike, description, wind, name);
    return weather;
}

const loader = document.querySelector('.loader');
const searchBtn = document.querySelector('.search');
searchBtn.addEventListener('click', function(e) {

    // show loader - loading...
    loader.style.display = 'block';

    const location = document.querySelector('input[type=search]').value;
    const unitValue = document.querySelector('input[name="unit"]:checked').value;
    const isF = unitValue === 'f' ? true : false;

    errorDiv.style.display = 'none';

    fetchWeatherData(location, isF).then (
        response => {
            // response is back - hide loader
            loader.style.display = 'none';

            nameDiv.style.display = 'block';
            // city name
            nameDiv.textContent = response.name;

            imageDiv.style.display = 'grid';
            tempDiv.style.display = 'grid';

            displayWeather(response);
            fetchAndDisplayImage(response);
        }
    ).catch (
        err => {
            console.log('caught!' + err);
            loader.style.display = 'none';
        });
})

function displayWeather(weather) {
    // summary
    weatherSummaryDiv.textContent = weather.description;

    // temperatures
    displayTempOnDiv(currentTempDiv, weather.currentTemp);

    // high temp
    displayTempOnDiv(highTempDiv, weather.maxTemp);

    // low temp
    displayTempOnDiv(lowTempDiv, weather.minTemp);

    // feels like
    displayTempOnDiv(feelsTempDiv, FEEL + weather.feelsLike);
}

async function fetchAndDisplayImage(weather) {
    const summary = weather.description;
    const response = await fetchNewImage(summary);
    image.src = response.data.images.original.url;
}

function displayTempOnDiv(div, temp) {
    div.textContent = temp;
    addUnit(div);
}

function displayTemp(div, temp, convert, prefix = '') {
    const res = convert(temp);
    div.textContent = prefix + res;
    addUnit(div);
}

function addUnit(div) {
    const unitValue = document.querySelector('input[name="unit"]:checked').value;
    // \u00B0 represents degree
    let unit = unitValue === 'f' ? '\u00B0F' : '\u00B0C';
    const unitDisplay = document.createElement('span');
    unitDisplay.textContent = ' ' + unit;
    div.appendChild(unitDisplay);
}

// bind radio button event listener
const radios = Array.from(document.querySelectorAll('input[type=radio]'));
radios.forEach(radio => radio.addEventListener('change', convertTemp));

function convertTemp(e) {
    // current temp
    const currentTemp = getTempValue(currentTempDiv.textContent);

    // high
    const highTemp = getTempValue(highTempDiv.textContent);

    // low
    const lowTemp = getTempValue(lowTempDiv.textContent);

    // feels like
    const feelsTemp = getTempValue(feelsTempDiv.textContent);

    // this is the checked one, because the radio button must have been changed 
    // from the other value in order to trigger this function
    const changedToUnitValue = document.querySelector('input[name="unit"]:checked').value;
    
    if (changedToUnitValue === 'c') {
        displayTemp(currentTempDiv, currentTemp, fToC);
        displayTemp(highTempDiv, highTemp, fToC, HIGH);
        displayTemp(lowTempDiv, lowTemp, fToC, LOW);
        displayTemp(feelsTempDiv, feelsTemp, fToC, FEEL);
    }

    if (changedToUnitValue === 'f') {
        displayTemp(currentTempDiv, currentTemp, cToF);
        displayTemp(highTempDiv, highTemp, cToF, HIGH);
        displayTemp(lowTempDiv, lowTemp, cToF, LOW);
        displayTemp(feelsTempDiv, feelsTemp, cToF, FEEL);
    }
}

function cToF(celsius) {
    return (celsius * 9 / 5 + 32).toFixed(1);
}

function fToC(fahrenheit) {
    return ((fahrenheit - 32) * 5 / 9).toFixed(1);
} 

function getTempValue(temp) {
    // extract temp number
    let numbers = temp.match(/(-\d+|\d+)(,\d+)*(\.\d+)*/g);
    return numbers[0];
}


