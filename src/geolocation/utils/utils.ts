import * as nodeGeocoder from 'node-geocoder';
import { Location } from '../model/Location';

var LatLon = require('geodesy').LatLonEllipsoidal;
var options = {
  provider: 'google'
};

var geocoder = nodeGeocoder(options);

export function convertLatLongToUtm(location: Location): Location {
  let utmLoc = new LatLon(location.latitude, location.longitude).toUtm();
  location.x = utmLoc.easting;
  location.y = utmLoc.northing;
  return location;
}

export function geoCode(address: String): Promise<Location> {
  let result = new Location();
  return geocoder.geocode(address + ' montevideo, uruguay').then(function (res) {
    if (res.length > 0) {
      result.latitude = res[0].latitude;
      result.longitude = res[0].longitude;
      return result;
    } else {
      return null;
    }
  });
}