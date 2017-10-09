/*jshint esversion: 6 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);


/* Begin Functions */

//Get Nearby Places
exports.getNearbyPlaces = functions.https.onRequest((request, response) => {
  response.status(200).send("Places");
});
/* End Functions */
