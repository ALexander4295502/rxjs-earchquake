export const QUAKE_URL =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojsonp";
export const MAPBOX_TILE_URL =
  "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}";
export const TILE_LAYER_ATTRIBUTION =
  'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
export const MAP_INIT_COORDINATES = [37.44188, -122.14302];

export const LOAD_DATA_FREQ = 5000;

export const WS_URL = {
  production: "wss://rxjs-earthquake-backend.herokuapp.com",
  development: "ws://192.168.0.16:8081"
};
