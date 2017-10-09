/*jshint esversion: 6 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({
	origin: true
});
admin.initializeApp(functions.config().firebase);


/* Begin Functions */

//Get Nearby Places
exports.getNearbyPlaces = functions.https.onRequest((request, response) => {

  const latitude = request.body.latitude;
  const longitude = request.body.longitude;
  var limit = request.body.limit;
  var page = request.body.limit;

  cors(request, response, () => {

    if (latitude === undefined || latitude === null) {
      response.status(400).send("Latitude can't be null or undefined");
    }
    if (longitude === undefined || longitude === null) {
      response.status(400).send("Longitude can't be null or undefined");
    }
    if (limit === undefined || limit === null) {
      limit = 100;
    }
    if (page === undefined || page === null) {
      page = 0;
    }

    admin.database().ref().child('places/').once('value', function (snapshot) {
        if (snapshot.val() !== undefined) {
          response.send(200).send(snapshot.val());
        } else {
          response.status(400).send("Places not found");
        }
    });
  });

});

//Add new Place to Database
exports.addPlace = functions.https.onRequest((request, response) => {

  const idToken = request.body.idToken;

  const name = request.body.name;
  const type = request.body.type;
  const latitude = request.body.latitude;
  const longitude = request.body.longitude;
  const thumbnailURL = request.body.thumbnailURL;

  cors(request, response, () => {

    if (idToken === undefined || idToken === null) {
      response.status(400).send("Token can't be null or undefined");
    }

    admin.auth().verifyIdToken(idToken).then(function (decodedToken) {
      var uid = decodedToken.uid;
      if (uid.localeCompare(functions.config().admin.uid) === 0) {

        if (name === undefined || name === null) {
          response.status(400).send("Name can't be null or undefined");
        }
        if (type === undefined || type === null) {
          response.status(400).send("Type can't be null or undefined");
        }
        if (latitude === undefined || latitude === null) {
          response.status(400).send("Latitude can't be null or undefined");
        }
        if (longitude === undefined || longitude === null) {
          response.status(400).send("Longitude can't be null or undefined");
        }
        if (thumbnailURL === undefined || thumbnailURL === null) {
          response.status(400).send("Thumbnail URL can't be null or undefined");
        }

        admin.database().ref("places").push().set({
          name: name,
          latitude: latitude,
          longitude: longitude,
          thumbnailURL: thumbnailURL
        }).then(function (snapshot) {
          response.status(200).send("Place Created");
        });

      } else {
        response.status(401).send("Unauthorized");
      }

    }).catch(function (error) {
      console.log(error);
      response.status(401).send("Unauthorized: Invalid Token");
    });

  });

});

//Get Current Security Level for Location
exports.getCurrentLocationSecurity = functions.https.onRequest((request, response) => {

  const latitude = request.body.latitude;
  const longitude = request.body.longitude;

  cors(request, response, () => {

    if (latitude === undefined || latitude === null) {
      response.status(400).send("Latitude can't be null or undefined");
    }
    if (longitude === undefined || longitude === null) {
      response.status(400).send("Longitude can't be null or undefined");
    }

    const jsonSecurityDetail = {
      dangerLevel:"NONE"
    };

    response.status(200).send(jsonSecurityDetail);

  });

});




/* End Functions */
