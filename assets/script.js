$(document).ready(function () {
  var apiKey = '3f59b63d96bf4f63389d8106a2f334f4'
  var apiBaseUrl = 'https://api.openweathermap.org/data/2.5'
  var weatherContainer = $('.weather-container')
  var forecastCards = $('.forecast-cards')
  var searchHistory = $('#search-history')
  var maxHistoryItems = 5

  // button click listener
  $('#search-button').on('click', function () {
    searchWeather()
  })

  // enter key submission for search box
  $('#city-input').on('keypress', function (e) {
    if (e.which === 13) {
      searchWeather()
    }
  })

  // search history button click listener
  searchHistory.on('click', 'button', function () {
    var cityName = $(this).text()
    $('#city-input').val(cityName)
    searchWeather()
  })

  // hide cards and contents on page load
  function hideCards() {
    weatherContainer.hide()
    forecastCards.hide()
  }

  hideCards()

  function searchWeather() {
    var cityName = $('#city-input').val()
    if (cityName) {
      // clear the previous weather results
      hideCards()
      forecastCards.empty()

      // save the search history and limit it to the most recent 5 cities
      saveSearchHistory(cityName)

      if (searchHistory.children().length > maxHistoryItems) {
        searchHistory.children().last().remove()
      }

      // get current weather
      $.get(
        `${apiBaseUrl}/weather?q=${cityName}&appid=${apiKey}&units=metric`,
        function (data) {
          var city = data.name
          var currentDate = new Date(data.dt * 1000)
          var formattedDate = formatDate(currentDate)
          var weatherIcon = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`
          var temperatureCelsius = data.main.temp
          var temperatureFahrenheit = (temperatureCelsius * 9) / 5 + 32
          var windSpeedMetersPerSecond = data.wind.speed
          var windSpeedMilesPerHour = windSpeedMetersPerSecond * 2.237

          // update the current weather card
          $('.city-name').text(city)
          $('.current-date').text(formattedDate)
          $('#weather-icon').attr('src', weatherIcon)
          $('.temperature').text(
            `Temperature: ${temperatureFahrenheit.toFixed(2)}°F`
          )
          $('.wind-speed').text(`Wind: ${windSpeedMilesPerHour.toFixed(2)} MPH`)
          $('.humidity').text(`Humidity: ${data.main.humidity} %`)

          // get 5-day forecast using coordinates
          $.get(
            `${apiBaseUrl}/forecast?q=${cityName}&appid=${apiKey}&units=metric`,
            function (forecastData) {
              var fiveDayForecast = forecastData.list.filter(
                (item, index) => index % 8 === 0
              )

              // create forecast cards for the next 5 days
              fiveDayForecast.forEach((forecast) => {
                var forecastDate = new Date(forecast.dt * 1000)
                var formattedForecastDate = formatDate(forecastDate)
                var forecastIcon = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`
                var forecastTemperatureCelsius = forecast.main.temp
                var forecastTemperatureFahrenheit =
                  (forecastTemperatureCelsius * 9) / 5 + 32
                var forecastWindSpeedMetersPerSecond = forecast.wind.speed
                var forecastWindSpeedMilesPerHour =
                  forecastWindSpeedMetersPerSecond * 2.237

                var forecastCard = `
                  <div class="forecast-card">
                    <div class="current-date">${formattedForecastDate}</div>
                    <div class="weather-icon">
                      <img src="${forecastIcon}" alt="Weather Icon">
                    </div>
                    <div class="temperature">Temp: ${forecastTemperatureFahrenheit.toFixed(
                      2
                    )}°F</div>
                    <div class="wind-speed">Wind: ${forecastWindSpeedMilesPerHour.toFixed(
                      2
                    )} MPH</div>
                    <div class="humidity">Humidity: ${
                      forecast.main.humidity
                    } %</div>
                  </div>
                `

                forecastCards.append(forecastCard)
              })

              // show weather container and forecast cards
              weatherContainer.show()
              forecastCards.show()
            }
          )
        }
      )
    }
  }

  // save search history as clickable buttons
  function saveSearchHistory(city) {
    var searchButtonWidth = $('#search-button').outerWidth()
    var button = $('<button>')
      .text(city)
      .addClass('btn btn-secondary')
      .css('width', searchButtonWidth)
    var listItem = $('<li>').append(button)
    searchHistory.prepend(listItem)
  }

  // format the date as "m/dd/yyyy"
  function formatDate(date) {
    var month = date.getMonth() + 1
    var day = date.getDate()
    var year = date.getFullYear()
    return `${month}/${day}/${year}`
  }
})
