// client-side js
// run by the browser each time your view template is loaded
$(function() {

  // testing few calls
  // https://www.surfline.com/surf-report/punta-banco/584204204e65fad6a770913f
  
  // Surf info
  $.getJSON( "https://services.surfline.com/kbyg/spots/forecasts/wave?spotId=584204204e65fad6a770913f&days=6&intervalHours=3", function( data ) {
    var surfMin = data.data.wave[0].surf.min;
    var surfMax = data.data.wave[0].surf.max;
    console.log("Surf min: "+ surfMin + " max: " + surfMax);
    $("#conditions").append("<h4>🏄🏻‍♂️ The surf: " + surfMin + " - " + surfMax + " (ft)<h4>");
  });
  
  //
  // weather
  $.getJSON("https://services.surfline.com/kbyg/spots/forecasts/weather?spotId=584204204e65fad6a770913f&days=6&intervalHours=3", function( data ) {
    var temp = data.data.weather[0].temperature;
    console.log("temp: "+ temp);
    $("#conditions").append("<h4>🌤 Temprture " + temp + " (F)</h4>");
  });

  // wind
  $.getJSON("https://services.surfline.com/kbyg/spots/forecasts/wind?spotId=584204204e65fad6a770913f&days=6&intervalHours=3", function( data ) {
    var direction = data.data.wind[0].direction;
    var speed = data.data.wind[0].speed;
    console.log("* Wind direction: "+ direction + "° speed: " + speed);
    $("#conditions").append("<h4>💨 Wind direction " + direction + " speed:" + speed + " (knots)</h4>");
  });
});
