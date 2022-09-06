const HIGH = 'H: ';
const LOW = 'L: ';
const FEEL = 'Feels like ';

class Weather {
    constructor(minTemp, maxTemp, currentTemp, feelsLike, description, wind) {
        this.minTemp = minTemp.toFixed(1);
        this.maxTemp = maxTemp.toFixed(1);
        this.currentTemp = currentTemp.toFixed(1);
        this.feelsLike = feelsLike.toFixed(1);
        this.description = description;
        this.wind = wind;   
    }
}

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
        return null;
    }
    
}

// main function to call from client
async function fetchWeatherData(userInput, displayFahrenheit) {
    const locationArray = userInput.split(',');
    try {
        const response = await fetchRawData(locationArray, displayFahrenheit);
        if (response === null) {
            console.log("Must enter one of the following: city / city,state,country / zipcode");
            return;
        }
        // mainly to throw an error for 404
        if(response.cod !== 200) {
            throw new Error(response.message)
        }
        const weather = extractWeather(response);
        // console.log(weather)
        return weather;
    } catch(e) {
        console.log("ERROR: " + e);
    }
    
}

function extractWeather(data) {
    console.log(data)

    const minTemp = data.main.temp_min;
    const maxTemp = data.main.temp_max;
    const currentTemp = data.main.temp;
    const feelsLike = data.main.feels_like;
    const description = data.weather[0].description;
    const wind = data.wind.speed;

    const weather = new Weather(minTemp, maxTemp, currentTemp, feelsLike, description, wind);
    return weather;
}

const loader = document.querySelector('.loader');
const searchBtn = document.querySelector('.search');
searchBtn.addEventListener('click', function(e) {

    // show loader - loading...
    loader.style.display = 'block';

    const imageDiv = document.querySelector('.image');
    const tempDiv = document.querySelector('.temp');
    imageDiv.classList.add('show');
    tempDiv.classList.add('show');

    const location = document.querySelector('input[type=search]').value;
    const unitValue = document.querySelector('input[name="unit"]:checked').value;
    const isF = unitValue === 'f' ? true : false;

    fetchWeatherData(location, isF).then (
        response => {
            // response is back - hide loader
            loader.style.display = 'none';
            displayWeather(response);
            fetchAndDisplayImage(response);
        }
    );
})

function displayWeather(weather) {
    // summary
    const weatherSummaryDiv = document.querySelector('.summary');
    weatherSummaryDiv.textContent = weather.description;
    // temperatures
    const currentTempDiv = document.querySelector('.current');
    currentTempDiv.textContent = weather.currentTemp;
    addUnit(currentTempDiv);

    // high temp
    const highTempDiv = document.querySelector('.high');
    highTempDiv.textContent = HIGH + weather.maxTemp;
    addUnit(highTempDiv);

    // low temp
    const lowTempDiv = document.querySelector('.low');
    lowTempDiv.textContent = LOW + weather.minTemp;
    addUnit(lowTempDiv);

    // feels like
    const feelDiv = document.querySelector('.feel');
    feelDiv.textContent = FEEL + weather.feelsLike;
    addUnit(feelDiv)
}

async function fetchAndDisplayImage(weather) {
    const summary = weather.description;
    const response = await fetchNewImage(summary);

    const image = document.querySelector('img');
    image.src = response.data.images.original.url;
}

function addUnit(div) {
    const unitValue = document.querySelector('input[name="unit"]:checked').value;
    let unit = unitValue === 'f' ? '\u2109' : '\u2103';
    // C -> \u2103
    // F -> \u2109
    const unitDisplay = document.createElement('span');
    unitDisplay.textContent = ' ' + unit;
    div.appendChild(unitDisplay);
}

// bind radio button event listener
const radios = Array.from(document.querySelectorAll('input[type=radio]'));
radios.forEach(radio => radio.addEventListener('change', convertTemp));

function convertTemp(e) {
    // current temp
    const currentTempDiv = document.querySelector('.current');
    const currentTemp = getTempValue(currentTempDiv.textContent);

    // high
    const highTempDiv = document.querySelector('.high');
    const highTemp = getTempValue(highTempDiv.textContent);

    console.log(highTemp);

    // low
    const lowTempDiv = document.querySelector('.low');
    const lowTemp = getTempValue(lowTempDiv.textContent);

    // feels like
    const feelsTempDiv = document.querySelector('.feel');
    const feelsTemp = getTempValue(feelsTempDiv.textContent);

    // this is the checked one, because the radio button must have been changed 
    // from the other value in order to trigger this function
    const changedToUnitValue = document.querySelector('input[name="unit"]:checked').value;
    
    if (changedToUnitValue === 'c') {
        const currentCValue = fToC(currentTemp);
        currentTempDiv.textContent = currentCValue;
        addUnit(currentTempDiv);

        const highCValue = fToC(highTemp);
        highTempDiv.textContent = HIGH + highCValue;
        addUnit(highTempDiv);

        const lowCValue = fToC(lowTemp);
        lowTempDiv.textContent = LOW + lowCValue;
        addUnit(lowTempDiv);

        const feelsCValue = fToC(feelsTemp);
        feelsTempDiv.textContent = FEEL + feelsCValue;
        addUnit(feelsTempDiv);
    }

    if (changedToUnitValue === 'f') {
        const currentFValue = cToF(currentTemp);
        currentTempDiv.textContent = currentFValue;
        addUnit(currentTempDiv);

        const highFValue = cToF(highTemp);
        highTempDiv.textContent = HIGH + highFValue;
        addUnit(highTempDiv);

        const lowFValue = cToF(lowTemp);
        lowTempDiv.textContent = LOW + lowFValue;
        addUnit(lowTempDiv);

        const feelsFValue = cToF(feelsTemp);
        feelsTempDiv.textContent = FEEL + feelsFValue;
        addUnit(feelsTempDiv);
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
    let numbers;
    // if (!text || typeof text !== 'string') {
    //     return [];
    // }

    numbers = temp.match(/(-\d+|\d+)(,\d+)*(\.\d+)*/g);
    return numbers[0];
}


