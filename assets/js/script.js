/* This file contains, all the functions needed to comoplete the Weather Dashboard program */

$("#currentDate").text("Today " + moment().format('ddd Do'));

// Generate cards 5-day forecast based on current date
for (let i = 0; i < 5; i++) {
    var startForecast = i + 1;
    var forecastCard = $(`div[data-card|="${i}"]`);
    forecastCard.html(`<h4> ${moment().add(startForecast, 'days').format('ddd')} </h4>`);
};

var APIKey = "4a56f566a02550ae1a4ca20559e1de75";
var searchedCity;

//city search is submitted 
$(document).ready(function () {
    $('#city-search').submit(function () {
        event.preventDefault();
        searchedCity = $('#city-text').val().trim();
        currentWeather(searchedCity);
        getUVIndex(searchedCity);
        getForecast(searchedCity);
        addHistory(searchedCity);
    })
});

/* Forecast Function */

function getForecast(cityToSearch) {

    // Sample URL: http://api.openweathermap.org/data/2.5/forecast?q={city%20name}&appid={your%20api%20key}
    // http://api.openweathermap.org/data/2.5/forecast?q=atlanta&appid=4a56f566a02550ae1a4ca20559e1de75
    var forecastURL = "https://api.openweathermap.org/data/2.5/forecast?appid=" + APIKey + "&q=" + cityToSearch + "&units=imperial";
 console.log(forecastURL);
 
    // console.log("Forecast URL: " + forecastURL);

    $.ajax({
        url: forecastURL,
        method: "GET"
    }).then(function (response) {

        // Start at index for 12 noon every day in 5-day forecast
        var forecastStart = 6;

        // i < 5 for cards for 5-day forecast
        for (let i = 0; i < 5; i++) {

            // Where <div data-card="index">
            var forecastCard = $(`div[data-card|="${i}"]`);
            var forecastDay = moment(response.list[forecastStart].dt_txt).format('ddd');
            var forecastTemp = Math.round(response.list[forecastStart].main.temp);
            var forecastHumid = response.list[forecastStart].main.humidity;

            // Get icons for current weather
            var forecastIcon = response.list[forecastStart].weather[0].icon;

            // https://openweathermap.org/img/wn/10d@2x.png
            var iconURL = "https://openweathermap.org/img/wn/" + forecastIcon + ".png";
            var forecastDescription = response.list[forecastStart].weather[0].description;

            forecastCard.html(`
                <h4>${forecastDay}</h4>
                <p class="forecastNumber">${forecastTemp} <span class="units">&#176;F</span></p>
                <p class="weatherDescription">${forecastDescription}</p>
                <img src="${iconURL}">
                <p class="forecastHumid">${forecastHumid} <span class="units">%</span></p>
            `);

            forecastStart += 8;
        }
    });
};


/*  Search Function */

// Once the program starts, it presents the cities that are placed under the local storage array
// I am using the San Francisco Bay area cities as an example 
// If empty, it uses the list of the array

var cityList = [];

if (localStorage.getItem('Cities') === null) {

    cityList = ["San Francisco", "Sunnyvale", "Palo Alto", "San Jose", "San Mateo", "Mountain View"];

    localStorage.setItem('Cities', JSON.stringify(cityList));

    cityList.forEach(element => {
        $('#searchHistory').append(`
            <li class="searchItem">${element}</li>
        `);
    });

    currentWeather(cityList[0]);
    getUVIndex(cityList[0]);
    getForecast(cityList[0]);


// if not creates the list from storage

} else {

    cityList = JSON.parse(localStorage.getItem('Cities'));

    cityList.forEach(element => {

        $('#searchHistory').append(`
            <li class="searchItem">${element}</li>
        `);
    });

    currentWeather(cityList[0]);
    getUVIndex(cityList[0]);
    getForecast(cityList[0]);
}


$('.searchItem').on('click', function (event) {
    var itemText = event.target.innerText;
    $('#city-text').val(itemText);
    currentWeather(itemText);
    getUVIndex(itemText);
    getForecast(itemText);

});

// Adding a new city and saves the array to local storage
function addHistory() {
    $('#searchHistory').prepend(`
        <li class="searchItem">${searchedCity}</li>
    `);
    cityList.unshift(searchedCity);
    localStorage.setItem('Cities', JSON.stringify(cityList));
};

/* Weather Function */
function currentWeather(cityToSearch) {

    // Sample URL: https://api.openweathermap.org/data/2.5/weather?appid=4a56f566a02550ae1a4ca20559e1de75&q=Atlanta&units=imperial;
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?appid=" + APIKey + "&q=" + cityToSearch + "&units=imperial";

    console.log("queryURL: " + queryURL);

    console.log("City searched: " + $('#city-text').val());

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {

        $(".city").html(response.name);

        $("#currentDate").text(moment(response.dt).format('ddd Do'));

        var temp = Math.round(response.main.temp);
        $(".temp").html(`${temp}`);
        $(".temp").append(`<span class="units">&#176;F</span>`);

        $(".humidity").html(`${response.main.humidity} `);
        $(".humidity").append(`<span class="units">%</span>`);

        var wind = Math.round(response.wind.speed);
        $(".wind").html(`${wind}`);
        $(".wind").append(`<span class="units">mph</span>`);

        // Get icons for current weather
        var currentIcon = response.weather[0].icon;

        // https://openweathermap.org/img/wn/10d@2x.png
        var iconURL = "https://openweathermap.org/img/wn/" + currentIcon + ".png";
        
        $('#currentIcon').attr("src", iconURL);

        $('#currentDescription').text(response.weather[0].description);

    });
};

/* UV function - Latitud and Longitude are a requirement */

function getUVIndex(cityToSearch) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?appid=" + APIKey + "&q=" + cityToSearch;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {

        var cityLong = response.coord.lon;
        var cityLat = response.coord.lat;

        var UVqueryURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + cityLat + "&lon=" + cityLong;

        // console.log("UVqueryURL: " + UVqueryURL);

        $.ajax({
            url: UVqueryURL,
            method: "GET"
        }).then(function (response) {

            $('.UV').html(`${response.value}`);

            // Set background color for UV index
            if (response.value <= 2) {
                $('.UV').css('background-color', '#8DC443');
                $('.UV').css('color', 'white');
            } else if (response.value > 2 && response.value <= 5) {
                $('.UV').css('background-color', '#FDD835');
                $('.UV').css('color', 'white');
            } else if (response.value > 5 && response.value <= 7) {
                $('.UV').css('background-color', '#FFB301');
                $('.UV').css('color', 'white');
            } else if (response.value > 7 && response.value <= 10) {
                $('.UV').css('background-color', '#D1394A');
                $('.UV').css('color', 'white');
            } else if (response.value > 10) {
                $('.UV').css('background-color', '#954F71');
                $('.UV').css('color', 'white');
            }
        });
    });
};
