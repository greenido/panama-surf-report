// 
// Action on google to get 
// @author: Ido Green | @greenido
// @date: Nov 2018
// @see:
// http://expressjs.com/en/starter/static-files.html
// 

// init project pkgs
const express = require('express');
const {dialogflow} = require('actions-on-google');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
const Map = require('es6-map');

// Pretty JSON output for logs
const prettyjson = require('prettyjson');
const toSentence = require('underscore.string/toSentence');

app.use(bodyParser.json({type: 'application/json'}));
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});


// Calling GA to make sure how many invocations we had on this skill
const GAurl = "https://ga-beacon.appspot.com/UA-65622529-1/panama-surf-report-glitch-server/?pixel=0";
request.get(GAurl, (error, response, body) => {
  console.log("👉🏼 Called the GA - " + new Date());
});

// Instantiate the Dialogflow client
const appD = dialogflow({debug: false});
appD.intent('actions.intent.CHECK_WATERSPORTS_CONDITIONS', (conv, {location}) => {
  console.log('** Handling action: ' + LOCATION_ACTION + " on location: " + location);
  // punta-palmar = 584204214e65fad6a7709bfb
  // Venao = 584204204e65fad6a770913f
  // punta rocas = 58581a836630e24c44878feb
  if (location.indexOf("palmar") > -1 ||
      location.indexOf("venao") > -1 ||
      location.indexOf("rocas") > -1) {
    return getSurfConditions(conv, location).then( (str) => {
      console.log('then: ' + str);
    });
  }
  else {
    conv.close("At the moment we can give you the surf conditions for Punta Palmar, Playa Venao and Punta Rocas. Please choose one of these, ok?");
  }
});

// Handle webhook requests
app.post('/', appD);
  const LOCATION_ACTION = 'surf-conditions'; 
  
  // Create functions to handle intents here
  function getSurfConditions(assistant, location) {
  console.log('** Handling action: ' + LOCATION_ACTION + " on location: " + location);
  var spotId = "584204204e65fad6a770913f"; // venao is the default ;)
  
  if (location.indexOf("palmar") > -1) {
    spotId = "584204214e65fad6a7709bfb";
  }
  else if (location.indexOf("rocas") > -1) {
    spotId = "58581a836630e24c44878feb";
  }
    
  return new Promise( function( resolve, reject ){
    // Surf info
    request({
      url: "https://services.surfline.com/kbyg/spots/forecasts/wave?spotId=" + spotId + "&days=6&intervalHours=3",
      json: true
    }, function (error, response, data) {
        if (!error && response.statusCode === 200) {
          var surfMin = data.data.wave[0].surf.min;
          var surfMax = data.data.wave[0].surf.max;
          console.log("Surf min: "+ surfMin + " max: " + surfMax + " ==== " + location);
          
          // weather
          request({
            url: "https://services.surfline.com/kbyg/spots/forecasts/weather?spotId=" + spotId + "&days=6&intervalHours=3",
            json: true
          }, function (error, response, data) {
              var temp = data.data.weather[0].temperature;
              console.log("temp: "+ temp);

              // wind
              request({
                url: "https://services.surfline.com/kbyg/spots/forecasts/wind?spotId=" + spotId + "&days=6&intervalHours=3",
                json: true
              }, function (error, response, data) {
                  if (!error && response.statusCode === 200) {
                    var direction = data.data.wind[0].direction;
                    var speed = data.data.wind[0].speed;
                    console.log("* Wind direction: "+ direction + " speed: " + speed + "Surf min: "+ surfMin + " max: " + surfMax + "temp: "+ temp );
                    var retStr = "The surf is between " + surfMin + " feet and " +surfMax + " feet, the temperature is " +
                                temp + " fahrenheit and the wind speed is " + speed + " in a direction of " +
                                direction + " degrees. Do you wish to check another location?";
                    assistant.ask(retStr);  
                    resolve(retStr);
                  }
                else {
                  assistant.close("Sorry cloud not get the surf report. Please come back later.");
                  reject( console.log("reject err: "+ error) );
                }
            });  
        });  
      }
      else {
         assistant.close("Sorry cloud not get the surf report. See you later.");
        reject( console.log("reject err: "+ error) );
      }
    });  
  }); // permise
}


//
// Handle errors
//
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Oppss... could not check the western state results');
})

//
// Pretty print objects for logging
//
function logObject(message, object, options) {
  console.log(message);
  console.log(prettyjson.render(object, options));
}


//
// Listen for requests -- Start the party
//
let server = app.listen(process.env.PORT, function () {
  console.log('--> Our Webhook is listening on ' + JSON.stringify(server.address()));
});