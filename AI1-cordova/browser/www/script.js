document.getElementById('getWeatherBtn').addEventListener('click', function () {
    let city = document.getElementById('city').value;
    if (city) {
        getCurrentWeather(city);
        getFiveDayForecast(city);
    }
});

function getCurrentWeather(city) {
    const apiKey = 'a6639027693cd3815ab7023904f5fd19'; // API key
    const xhr = new XMLHttpRequest();
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&lang=en&units=metric`;

    xhr.open('GET', url, true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            console.log(data);
            const weatherIcon = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
            document.getElementById('currentTemp').innerText = `Temperature: ${data.main.temp}°C`;
            document.getElementById('currentDesc').innerText = `${data.weather[0].description}`;
            document.getElementById('currentIcon').innerHTML = `<img src="${weatherIcon}" alt="Ikona pogody">`;
        } else {
            alert('Error!');
        }
    };
    xhr.send();
}

function getFiveDayForecast(city) {
    const apiKey = 'a6639027693cd3815ab7023904f5fd19'; // API key
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&lang=en&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const forecastList = document.getElementById('forecastList');
            forecastList.innerHTML = '';
            data.list.forEach(item => {
                const li = document.createElement('li');
                const date = new Date(item.dt * 1000).toLocaleString();
                const weatherIcon = `http://openweathermap.org/img/wn/${item.weather[0].icon}.png`;
                li.innerHTML = `${date}: ${item.main.temp}°C, ${item.weather[0].description} <img src="${weatherIcon}" alt="Weather icon">`;
                forecastList.appendChild(li);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
