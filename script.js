// // Create the script tag, set the appropriate attributes
// var script = document.createElement('script');
// script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyArNwkn2NJri71A2G-nXlliiNbLzCVHyQ4&callback=initMap';
// script.defer = true;
// script.async = true;

// // Attach your callback function to the `window` object
// window.initMap = function () {
//   // JS API is loaded and available
// };

// // Append the 'script' element to 'head'
// document.head.appendChild(script);

// This makes sure that the document is fully loaded before running any of our script. 
$(document).ready(function () {
// Creates veriables to hold the lat, long and the city
var lat
var lon
var city

// Runs as soon as the window is loaded
window.onload = function () {

  var startPos;
  var geoSuccess = function (position) {
    startPos = position;
    // Assigns 
    lat = startPos.coords.latitude;
    lon = startPos.coords.longitude;
    console.log(lat, lon)
    findCity(lat, lon)
  };
  navigator.geolocation.getCurrentPosition(geoSuccess);


};


function findCity(lat, lon) {
  // Here is our ajax opener. 
  $.ajax({
    // Or request type from the server. 
    type: "GET",
    // the call to the openweathermap with our own API. We are also passing in our search value from the input box above. 
    url: "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + ',' + lon + "&key=AIzaSyArNwkn2NJri71A2G-nXlliiNbLzCVHyQ4",
    // specifying what type of data will be returned from the API 
    dataType: "json",
    // Waiting to run our function until we have successful return from the API.
    success: function (data) {
      console.log(data)
      // Pulling the formatted city data out of the Google Maps object
      city = data.results[5].formatted_address
      console.log(city)
      // Bypassing the button event listener, and calls the function to search for the city 
      searchWeather(city)
    }
  }
  )
}

  // Event listener for the search button. Listening for the click. 
  $("#search-button").on("click", function () {
    // saving the city searched for to be used in the other functions. Getting it from the input box, with the ID search-value. 
    var searchValue = $("#search-value").val();

    // clear input box. So there is no more text left once search is clicked. 
    $("#search-value").val("");

    // calling the search weather function and passing in the searchValue variable when calling it. 
    searchWeather(searchValue);
  });
  // Event listener for the history list. 
  $(".history").on("click", "li", function () {
    // Using the 'this' key word to get which ever city was clicked and then passing that into the search weather function like above. 
    searchWeather($(this).text());
  });
  // using this function to be able to append cities to the list. 
  function makeRow(text) {
    // This adds each city to the list by adding list items. 
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    // here we append the newly made item above to the history list. 
    $(".history").append(li);
  }
  // The main seach weather function. 
  function searchWeather(searchValue) {
    // Here is our ajax opener. 
    $.ajax({
      // Or request type from the server. 
      type: "GET",
      // the call to the openweathermap with our own API. We are also passing in our search value from the input box above. 
      url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=b5e573cd0319e4dd2a82ef44c3a32ecd&units=imperial",
      // specifying what type of data will be returned from the API 
      dataType: "json",
      // Waiting to run our function until we have successful return from the API.
      success: function (data) {
        // create history link for this search
        if (history.indexOf(searchValue) === -1) {
          // pushing the current value to the history array.
          history.push(searchValue);
          // storing the search locally so that it will persist on the browswer. 
          window.localStorage.setItem("history", JSON.stringify(history));
          // calling our makeRow function to add the new search to the history list.  
          makeRow(searchValue);
        }

        // clear any old content
        $("#today").empty();

        // create html content for current weather, each item that we want to return from the API request has to be written to the page. 
        // This is the city name. 
        var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
        // adding a new div with the vlass of card. 
        var card = $("<div>").addClass("card");
        // writing the windspeed to the card with a new <p> tag. This will put each one of the items on a new line. 
        var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
        // add the humidity to the card. 
        var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
        // adding temp to the card. Same method is used for all three of these items. added to the card text and then the text we want around what we are pulling from the api. 
        var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
        // adding another div with the card body class. This div is for the image.  
        var cardBody = $("<div>").addClass("card-body");
        // adding the image for the weather. The image comes from the API. 
        var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");

        // merge and add to page. above we had just added everything to the card, but had not displayed anything. This code will add the information to be displayed. First item is the image we just created. 
        title.append(img);
        // Here we append all 4 items to the page. title, temp, humid, wind. If we wanted to add more data this is where we would have to append it to the page as well. 
        cardBody.append(title, temp, humid, wind);
        // adding the card so that everything can be displayed. Without the card that we have created none of the information will be displayed. 
        card.append(cardBody);
        // append the card to the today id tag on the html page. line 33. 
        $("#today").append(card);

        // call follow-up api endpoints.
        getForecast(searchValue);
        getUVIndex(data.coord.lat, data.coord.lon);
      }
    });
  }
// same action performed for getting the intial weather lines 87-95. 
  function getForecast(searchValue) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=b5e573cd0319e4dd2a82ef44c3a32ecd&units=imperial",
      dataType: "json",
      success: function (data) {
        // overwrite any existing content with title and empty row
        $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");

        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            // create html elements for a bootstrap card
            var col = $("<div>").addClass("col-md-2");
            var card = $("<div>").addClass("card bg-primary text-white");
            var body = $("<div>").addClass("card-body p-2");

            var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());

            var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");

            var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");
            var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");

            // merge together and put on page
            col.append(card.append(body.append(title, img, p1, p2)));
            $("#forecast .row").append(col);
          }
        }
      }
    });
  }
  // same action performed for getting the intial weather lines 87-95. 
  function getUVIndex(lat, lon) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/uvi?appid=b5e573cd0319e4dd2a82ef44c3a32ecd&lat=" + lat + "&lon=" + lon,
      dataType: "json",
      success: function (data) {
        var uv = $("<p>").text("UV Index: ");
        var btn = $("<span>").addClass("btn btn-sm").text(data.value);

        // change color depending on uv value
        if (data.value < 3) {
          btn.addClass("btn-success");
        }
        else if (data.value < 7) {
          btn.addClass("btn-warning");
        }
        else {
          btn.addClass("btn-danger");
        }

        $("#today .card-body").append(uv.append(btn));
      }
    });
  }

  //Delete all the search history from local storage
  $("#clear-history").on("click", function () {
    //To clear the history, do reset the localstorage by setting its value to 'null'
    window.localStorage.setItem("history", null);
    //nullify the search history array
    history = {};
  });

  // get current history, if any
  var history = JSON.parse(window.localStorage.getItem("history")) || [];

  if (history.length > 0) {
    searchWeather(history[history.length - 1]);
  }

  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});
