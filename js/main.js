const API_key = "f5c14904ae46654793f1269fb2e8cc75";

const currLocationBtn = document.querySelector(".use-curr-location");
const cityEl = document.querySelector(".city");
const countryEl = document.querySelector(".country");
const currWeatherTempEl = document.querySelector(".curr-weather-temp");
const currWeatherTextEl = document.querySelector(".curr-weather-text");
const currWeatherImgEl = document.querySelector(".curr-weather-img");
const daysEl = document.querySelector(".days");
const uvIndexValue = document.querySelector(".uv-index");
const windSpeedEl = document.querySelector(".windspeed");
const windDirectionEl = document.querySelector(".winddirection");
const sunriseTimeEl = document.querySelector(".sunrise-time");
const sunsetTimeEl = document.querySelector(".sunset-time");
const humidityValueEl = document.querySelector(".humidity");
const humidityTextEl = document.querySelector(".humidity-text");
const pressureValueEl = document.querySelector(".pressure");
const airQualitiValueEl = document.querySelector(".airquality");
const airQualityTextEl = document.querySelector(".airquality-text");
const uvIndexTextEl = document.querySelector(".uvindex-text");
const searchCity = document.querySelector(".search-city");
const searchBtn = document.querySelector(".search-btn");
const spinerEl = document.querySelectorAll(".loading-spinner");
const fsInputEl = document.querySelector(".fs-input");
const fsSearchBtn = document.querySelector(".fs-search-btn");
const fs = document.querySelector(".first-screen");
const app = document.querySelector("#app");
const fsLocationBtn = document.querySelector(".fs-use-location-btn");
const errorContainer = document.querySelector(".error-container");
const errorMsg = document.querySelector(".error-msg");
// Getting curr location cords

let currCoords;

const showSpinner = function () {
  searchBtn.classList.add("hidden");
  fsSearchBtn.classList.add("hidden");
  spinerEl.forEach((spinner) => spinner.classList.remove("hidden"));
};

const hideSpinner = function () {
  searchBtn.classList.remove("hidden");
  fsSearchBtn.classList.remove("hidden");
  spinerEl.forEach((spinner) => spinner.classList.add("hidden"));
};

const showError = async function (msg) {
  errorContainer.style.bottom = "0";
  setTimeout(function () {
    errorContainer.style.bottom = "-100%";
  }, 5000);
};

currLocationBtn.addEventListener("click", function (e) {
  try {
    showSpinner();
    e.preventDefault();
    searchCity.blur();
    navigator.geolocation.getCurrentPosition(async function (pos) {
      currCoords = pos.coords;
      const weatherData = await getWeatherData(
        currCoords.latitude,
        currCoords.longitude
      );
      await getLocationName(currCoords.latitude, currCoords.longitude);
      renderData(weatherData);
      hideSpinner();
    });
  } catch (error) {
    hideSpinner();
    showError();
  }
});

searchCity.addEventListener("keypress", async function (e) {
  try {
    if (e.key === "Enter") {
      showSpinner();
      searchCity.blur();
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${searchCity.value}&appid=${API_key}`
      );
      const data = await res.json();
      console.log(data);
      const lat = data[0].lat;
      const lon = data[0].lon;
      currCoords = { latitude: lat, longitude: lon };
      const weatherData = await getWeatherData(lat, lon);
      await getLocationName(currCoords.latitude, currCoords.longitude);
      renderData(weatherData);
      hideSpinner();
    }
  } catch (error) {
    hideSpinner();
    showError();
  }
});

searchBtn.addEventListener("click", async function () {
  try {
    showSpinner();
    searchCity.blur();
    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${searchCity.value}&appid=${API_key}`
    );
    const data = await res.json();
    console.log(data);
    const lat = data[0].lat;
    const lon = data[0].lon;
    currCoords = { latitude: lat, longitude: lon };
    const weatherData = await getWeatherData(lat, lon);
    await getLocationName(currCoords.latitude, currCoords.longitude);
    renderData(weatherData);
    hideSpinner();
  } catch (error) {
    hideSpinner();
    showError();
  }
});

// Get weather data for location based on coords

const getWeatherData = async function (lat, lon) {
  try {
    showSpinner();
    const res = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&lang=hr&appid=${API_key}`
    );
    const data = await res.json();
    console.log(data);
    return data;
  } catch (error) {
    hideSpinner();
    showError();
  }
};

const getLocationName = async function (lat, lon) {
  try {
    showSpinner();
    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&appid=${API_key}`
    );
    const data = await res.json();
    data[0].local_names.bs
      ? (cityEl.textContent = data[0].local_names.bs)
      : (cityEl.textContent = data[0].name);
    countryEl.textContent = data[0].state;
  } catch (error) {
    hideSpinner();
    showError();
  }
};

const renderData = function (data) {
  try {
    showSpinner();
    currWeatherTempEl.textContent = `${data.current.temp.toFixed(0)}°C`;
    currWeatherTextEl.textContent = `${
      data.current.weather[0].description.charAt(0).toUpperCase() +
      data.current.weather[0].description.slice(1)
    }`;
    currWeatherImgEl.src = `assets/animated-icons/${data.current.weather[0].icon}.svg`;

    daysEl.textContent = "";
    data.daily.forEach((day) => {
      daysEl.insertAdjacentHTML(
        "beforeend",
        `<div class="day">
        <span class="day-name">${getWeekDay(day.dt)}</span>
        <img src="assets/animated-icons/${day.weather[0].icon}.svg" alt=""/>
        <span class="min-max-temp">${day.temp.min.toFixed(
          0
        )}°/${day.temp.max.toFixed(0)}° C</span>
    </div>`
      );
    });

    uvIndexValue.textContent = data.current.uvi;
    checkUVIndex(data.current.uvi);
    windSpeedEl.innerHTML = `${(Number(data.current.wind_speed) * 3.6).toFixed(
      1
    )} <span class="value-unit">km/h</span>`;
    sunriseTimeEl.textContent = getTime(data.current.sunrise);
    sunsetTimeEl.textContent = getTime(data.current.sunset);
    humidityValueEl.textContent = `${data.current.humidity}%`;
    checkHumidityLevel(data.current.humidity);
    pressureValueEl.innerHTML = `${data.current.pressure} <span class="value-unit">hPa</span>`;
    getAirQuality(currCoords.latitude, currCoords.longitude);
  } catch (error) {
    hideSpinner();
    showError();
  }
};

const getWeekDay = function (timestamp) {
  let date = timestamp * 1000;
  date = new Date(date).toLocaleDateString("hr", { weekday: "long" });
  date = date.charAt(0).toUpperCase() + date.slice(1);
  return date;
};

const getTime = function (timestamp) {
  let date = timestamp * 1000;
  const time = new Date(date).toLocaleTimeString("hr", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return time;
};

const getAirQuality = async function (lat, lon) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_key}`
  );
  const data = await res.json();
  const airQualityIndex = data.list[0].main.aqi;
  airQualitiValueEl.textContent = airQualityIndex;
  if (airQualityIndex === 1) airQualityTextEl.textContent = "Odličan";
  if (airQualityIndex === 2) airQualityTextEl.textContent = "Dobar";
  if (airQualityIndex === 3) airQualityTextEl.textContent = "Umjereno dobar";
  if (airQualityIndex === 4) airQualityTextEl.textContent = "Loš";
  if (airQualityIndex === 5) airQualityTextEl.textContent = "Veoma loš";
};

const checkUVIndex = function (uvindex) {
  if (uvindex <= 2.9) uvIndexTextEl.textContent = "Nizak";
  if (uvindex > 2.9 && uvindex <= 5.9) uvIndexTextEl.textContent = "Umjeren";
  if (uvindex > 6 && uvindex <= 7.9) uvIndexTextEl.textContent = "Visok";
  if (uvindex > 8 && uvindex <= 10.9) uvIndexTextEl.textContent = "Vrlo visok";
  if (uvindex > 11) uvIndexTextEl.textContent = "Iznimno visok";
};

const checkHumidityLevel = function (humidity) {
  if (humidity >= 70) humidityTextEl.textContent = "Previsoka";
  if (humidity >= 60 && humidity < 70) humidityTextEl.textContent = "Dobra";
  if (humidity >= 30 && humidity < 60) humidityTextEl.textContent = "Odlična";
  if (humidity >= 25 && humidity < 30) humidityTextEl.textContent = "Dobra";
  if (humidity <= 25) humidityTextEl.textContent = "Preniska";
};

/* First screeen */

fsInputEl.addEventListener("keypress", async function (e) {
  try {
    if (e.key === "Enter") {
      showSpinner();
      fsInputEl.blur();
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${fsInputEl.value}&appid=${API_key}`
      );
      const data = await res.json();
      console.log(data);
      const lat = data[0].lat;
      const lon = data[0].lon;
      currCoords = { latitude: lat, longitude: lon };
      const weatherData = await getWeatherData(lat, lon);
      await getLocationName(currCoords.latitude, currCoords.longitude);
      renderData(weatherData);
      hideSpinner();
      fs.classList.add("hidden");
      app.classList.remove("hidden");
    }
  } catch (error) {
    hideSpinner();
    showError();
  }
});

fsSearchBtn.addEventListener("click", async function (e) {
  try {
    showSpinner();
    fsInputEl.blur();
    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${fsInputEl.value}&appid=${API_key}`
    );
    const data = await res.json();
    console.log(data);
    const lat = data[0].lat;
    const lon = data[0].lon;
    currCoords = { latitude: lat, longitude: lon };
    const weatherData = await getWeatherData(lat, lon);
    await getLocationName(currCoords.latitude, currCoords.longitude);
    renderData(weatherData);
    hideSpinner();
    fs.classList.add("hidden");
    app.classList.remove("hidden");
  } catch (error) {
    hideSpinner();
    showError();
  }
});

fsLocationBtn.addEventListener("click", async function (e) {
  e.preventDefault();
  try {
    showSpinner();
    fsInputEl.blur();
    navigator.geolocation.getCurrentPosition(async function (pos) {
      currCoords = pos.coords;
      const weatherData = await getWeatherData(
        currCoords.latitude,
        currCoords.longitude
      );
      await getLocationName(currCoords.latitude, currCoords.longitude);
      renderData(weatherData);
      hideSpinner();
      fs.classList.add("hidden");
      app.classList.remove("hidden");
    });
  } catch (error) {
    hideSpinner();
    showError();
  }
});
