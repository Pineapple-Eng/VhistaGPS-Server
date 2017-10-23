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
				getPlacesForGooglePlaces(responseGoogle.json.results, latitude, longitude, function(places) {
					response.status(200).send(places);
				});
  		} else {
				response.status(500).send(err);
			}
		});
  });

});


function getPlacesForGooglePlaces(googleResults, latitude, longitude, callback) {

	var places  = {};
	var placesIds = [];
	var placesCoordinates = [];

	var index = 0;
	for (let googlePlace of googleResults) {

		if (getDistanceFromLatLonInKm(latitude, longitude,googlePlace.geometry.location.lat, googlePlace.geometry.location.lng) > 0.15) {
			continue;
		}

		var newPlace = {};

		newPlace.name = googlePlace.name;
		newPlace.address = googlePlace.vicinity;
		newPlace.latitude = googlePlace.geometry.location.lat;
		newPlace.longitude = googlePlace.geometry.location.lng;
		newPlace.type = googlePlace.types[0];
		newPlace.pinType = getGooglePlacePinTypeAndThumbnail(googlePlace).pinType;
		newPlace.thumbnailURL = getGooglePlacePinTypeAndThumbnail(googlePlace).thumbnailURL;
		newPlace.serverIndex = index;

		places[googlePlace.id] = newPlace;

		placesIds.push(googlePlace.id);
		placesCoordinates.push({
    	lat: googlePlace.geometry.location.lat,
    	lng: googlePlace.geometry.location.lng
  	});
		index++;
	}

	getAltitudeForLatLongCoordinates(placesCoordinates, function(resultAltitudes) {
		if (resultAltitudes !== undefined) {

			for (placeKey in places) {
				if (places.hasOwnProperty(placeKey)) {
					places[placeKey].elevation = resultAltitudes[places[placeKey].serverIndex]["elevation"];
				}
			}
			
			console.log("Proccesed Places", places);
			callback(places);
		}
	});
}

function getAltitudeForLatLongCoordinates(locations, callback) {
	googleMapsClient.elevation({
      locations: locations
    }, (err, response) => {
      if (err) {
				console.log("Got ElevationAPI Error", err);
				callback(undefined);
			} else {
				callback(response.json.results);
			}
  });
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
  return deg * (Math.PI/180);
}

/* End Functions */
