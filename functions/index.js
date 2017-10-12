/*jshint esversion: 6 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({
	origin: true
});
const googleMapsClient = require('@google/maps').createClient({
  key: functions.config().keys.googlemaps
});
admin.initializeApp(functions.config().firebase);


/* Begin Functions */

//Get Nearby Places
exports.getNearbyPlacesLegacy = functions.https.onRequest((request, response) => {

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

		var places = {}
    admin.database().ref().child('COL/BOGOTA/TRAFFICLIGHTS').limitToFirst(1).once('value', function (snapshotTF) {
        if (snapshotTF.val() !== undefined) {
					for (var key in snapshotTF.val()) {
      			if (snapshotTF.val().hasOwnProperty(key)) {
							places[key] = snapshotTF.val()[key];
      			}
    			}
					admin.database().ref().child('COL/BOGOTA/FOOD').limitToFirst(1).once('value', function (snapshotFD) {
			        if (snapshotFD.val() !== undefined) {
								for (var key in snapshotFD.val()) {
			      			if (snapshotFD.val().hasOwnProperty(key)) {
										places[key] = snapshotFD.val()[key];
			      			}
			    			}
								admin.database().ref().child('COL/BOGOTA/CULTURE').limitToFirst(1).once('value', function (snapshotCT) {
						        if (snapshotCT.val() !== undefined) {
											for (var key in snapshotCT.val()) {
						      			if (snapshotCT.val().hasOwnProperty(key)) {
													places[key] = snapshotCT.val()[key];
						      			}
						    			}
											admin.database().ref().child('COL/BOGOTA/HEALTH').limitToFirst(1).once('value', function (snapshotHT) {
									        if (snapshotHT.val() !== undefined) {
														for (var key in snapshotHT.val()) {
									      			if (snapshotHT.val().hasOwnProperty(key)) {
																places[key] = snapshotHT.val()[key];
									      			}
									    			}
														admin.database().ref().child('COL/BOGOTA/STORE').limitToFirst(1).once('value', function (snapshotST) {
												        if (snapshotST.val() !== undefined) {
																	for (var key in snapshotST.val()) {
												      			if (snapshotST.val().hasOwnProperty(key)) {
																			places[key] = snapshotST.val()[key];
												      			}
												    			}
																	admin.database().ref().child('COL/BOGOTA/SECURITY').limitToFirst(1).once('value', function (snapshotSC) {
															        if (snapshotSC.val() !== undefined) {
																				for (var key in snapshotSC.val()) {
															      			if (snapshotSC.val().hasOwnProperty(key)) {
																						places[key] = snapshotSC.val()[key];
															      			}
															    			}

																				places["STOR-10"] = {
																					latitude:4.762194091798653,
																					longitude: -74.04640302593384,
																					type: "Centro Comercial",
																					address: "Avenida Carrera 45 # 185",
																					name: "Centro Comercial SantaFe",
																					pinType: "STORE",
																					thumbnailURL: "https://firebasestorage.googleapis.com/v0/b/vhistaapp.appspot.com/o/Vhista-GPS%2FDefaults%2FPlacesTypes%2FStore%2Fstore-2.png?alt=media"
																				}

																				places["SEMA-R"] = {
																					latitude:4.761370822815775,
																					longitude: -74.04748663837586,
																					type: "Semáforo no accesible",
																					address: "Calle 183 # 50b",
																					name: "Semáforo no accesible",
																					pinType: "TRAFFICLIGHT",
																					thumbnailURL: "https://firebasestorage.googleapis.com/v0/b/vhistaapp.appspot.com/o/Vhista-GPS%2FDefaults%2FPlacesTypes%2FSemaforo%2Ftraffic-light.png?alt=media"
																				}

															          response.status(200).send(places);
															        } else {
															          response.status(400).send("Places not found");
															        }
															    });
												        } else {
												          response.status(400).send("Places not found");
												        }
												    });
									        } else {
									          response.status(400).send("Places not found");
									        }
									    });
						        } else {
						          response.status(400).send("Places not found");
						        }
						    });
			        } else {
			          response.status(400).send("Places not found");
			        }
			    });
        } else {
          response.status(400).send("Places not found");
        }
    });
  });

});

exports.getNearbyPlaces = functions.https.onRequest((request, response) => {

  const latitude = request.body.latitude;
  const longitude = request.body.longitude;

  cors(request, response, () => {

    if (latitude === undefined || latitude === null) {
      response.status(400).send("Latitude can't be null or undefined");
    }
    if (longitude === undefined || longitude === null) {
      response.status(400).send("Longitude can't be null or undefined");
    }
		googleMapsClient.placesNearby({
      language: 'es',
      location: [latitude, longitude],
      radius: 150
    }, function(err, responseGoogle) {
  		if (!err) {
    		response.status(200).send(getPlacesForGooglePlaces(responseGoogle.json.results, latitude, longitude));
  		} else {
				response.status(500).send(err);
			}
		});
  });

});


function getPlacesForGooglePlaces(googleResults, latitude, longitude) {

	var places  = {};

	for (let googlePlace of googleResults) {

		if (getDistanceFromLatLonInKm(latitude, longitude,googlePlace.geometry.location.lat, googlePlace.geometry.location.lng) > 0.15) {
			continue;
		}

		var newPlace = {}

		newPlace.name = googlePlace.name;
		newPlace.address = googlePlace.vicinity;
		newPlace.latitude = googlePlace.geometry.location.lat;
		newPlace.longitude = googlePlace.geometry.location.lng;
		newPlace.type = googlePlace.types[0];
		newPlace.pinType = getGooglePlacePinTypeAndThumbnail(googlePlace)["pinType"];
		newPlace.thumbnailURL = getGooglePlacePinTypeAndThumbnail(googlePlace)["thumbnailURL"];

		places[googlePlace.id] = newPlace;
	}

	return places;

}

function getGooglePlacePinTypeAndThumbnail(googlePlace) {
	var result = {};

	switch (googlePlace.types[0]) {

		case "airport":
		case "bus_station":
		case "car_dealer":
		case "car_rental":
		case "car_repair":
		case "car_wash":
		case "gas_station":
		case "lodging":
		case "moving_company":
		case "parking":
		case "post_office":
		case "subway_station":
		case "taxi_stand":
		case "train_station":
		case "transit_station":
		case "travel_agency":
		case "intersection":
			result.pinType = "TRANSPORT";
			result.thumbnailURL = "https://firebasestorage.googleapis.com/v0/b/vhistaapp.appspot.com/o/Vhista-GPS%2FDefaults%2FPlacesTypes%2FTransport%2Fcar-2.png?alt=media";
			break;

		case "amusement_park":
		case "aquarium":
		case "art_gallery":
		case "campground":
		case "cemetery":
		case "church":
		case "city_hall":
		case "courthouse":
		case "embassy":
		case "hindu_temple":
		case "local_government_office":
		case "mosque":
		case "movie_theater":
		case "museum":
		case "night_club":
		case "park":
		case "place_of_worship":
		case "rv_park":
		case "stadium":
		case "synagogue":
		case "zoo":
		case "natural_feature":
		case "point_of_interest":
			result.pinType = "CULTURE";
			result.thumbnailURL = "https://firebasestorage.googleapis.com/v0/b/vhistaapp.appspot.com/o/Vhista-GPS%2FDefaults%2FPlacesTypes%2FCulture%2Ftheater.png?alt=media";
			break;

		case "atm":
		case "bank":
		case "accounting":
		case "casino":
		case "finance":
		case "insurance_agency":
			result.pinType = "STORE";
			result.thumbnailURL = "https://firebasestorage.googleapis.com/v0/b/vhistaapp.appspot.com/o/Vhista-GPS%2FDefaults%2FPlacesTypes%2FMoney%2Fpayment.png?alt=media";
			break;

		case "bakery":
		case "cafe":
		case "grocery_or_supermarket":
		case "food":
		case "liquor_store":
		case "meal_delivery":
		case "meal_takeaway":
		case "restaurant":
			result.pinType = "FOOD";
			result.thumbnailURL = "https://firebasestorage.googleapis.com/v0/b/vhistaapp.appspot.com/o/Vhista-GPS%2FDefaults%2FPlacesTypes%2FFood%2Fwine-bottle.png?alt=media";
			break;

		case "bar":
		case "beauty_salon":
		case "book_store":
		case "bowling_alley":
		case "bicycle_store":
		case "clothing_store":
		case "convenience_store":
		case "department_store":
		case "electrician":
		case "electronics_store":
		case "establishment":
		case "florist":
		case "funeral_home":
		case "furniture_store":
		case "general_contractor":
		case "hair_care":
		case "hardware_store":
		case "home_goods_store":
		case "jewelry_store":
		case "laundry":
		case "lawyer":
		case "locksmith":
		case "movie_rental":
		case "painter":
		case "pet_store":
		case "plumber":
		case "real_estate_agency":
		case "roofing_contractor":
		case "shoe_store":
		case "shopping_mall":
		case "spa":
		case "storage":
		case "store":
		case "veterinary_care":
			result.pinType = "STORE";
			result.thumbnailURL = "https://firebasestorage.googleapis.com/v0/b/vhistaapp.appspot.com/o/Vhista-GPS%2FDefaults%2FPlacesTypes%2FStore%2Fstore-2.png?alt=media";
			break;

		case "dentist":
		case "doctor":
		case "gym":
		case "health":
		case "hospital":
		case "pharmacy":
		case "physiotherapist":
			result.pinType = "HEALTH";
			result.thumbnailURL = "https://firebasestorage.googleapis.com/v0/b/vhistaapp.appspot.com/o/Vhista-GPS%2FDefaults%2FPlacesTypes%2FHealth%2Fhospital.png?alt=media";
			break;

		case "fire_station":
		case "police":
			result.pinType = "SECURITY";
			result.thumbnailURL = "https://firebasestorage.googleapis.com/v0/b/vhistaapp.appspot.com/o/Vhista-GPS%2FDefaults%2FPlacesTypes%2FSecurity%2Fpolice.png?alt=media";
			break;

		case "library":
		case "school":
		case "university":
			result.pinType = "EDUCATION";
			result.thumbnailURL = "https://firebasestorage.googleapis.com/v0/b/vhistaapp.appspot.com/o/Vhista-GPS%2FDefaults%2FPlacesTypes%2FEducation%2Flibrary.png?alt=media";
			break;

		default:
			result.pinType = "OTHER";
			result.thumbnailURL = "https://firebasestorage.googleapis.com/v0/b/vhistaapp.appspot.com/o/Vhista-GPS%2FDefaults%2FPlacesTypes%2FDefault%2Fmap.png?alt=media";
	}

	return result;
}

//Add new Place to Database
exports.addPlace = functions.https.onRequest((request, response) => {

  const idToken = request.body.idToken;

  const name = request.body.name;
  const type = request.body.type;
  const latitude = request.body.latitude;
  const longitude = request.body.longitude;
  const thumbnailURL = request.body.thumbnailURL;

  cors(request, response, () => {

    // if (idToken === undefined || idToken === null) {
    //   response.status(400).send("Token can't be null or undefined");
    // }

    // admin.auth().verifyIdToken(idToken).then(function (decodedToken) {
      // var uid = decodedToken.uid;
      // if (uid.localeCompare(functions.config().admin.uid) === 0) {

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

      // } else {
      //   response.status(401).send("Unauthorized");
      // }

    // }).catch(function (error) {
    //   console.log(error);
    //   response.status(401).send("Unauthorized: Invalid Token");
    // });

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
      dangerLevel:"No Peligroso"
    };

    response.status(200).send(jsonSecurityDetail);

  });

});


function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}




/* End Functions */
