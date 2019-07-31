import { Observable } from "rxjs";
import L from "leaflet";

import MAPBOX_CONFIG from "../../mapbox.json";
import "../css/leaflet.css";
import "../css/global.css";
// Stupid hack so that leaflet's images work after going through webpack
import marker from "../css/images/marker-icon.png";
import marker2x from "../css/images/marker-icon-2x.png";
import markerShadow from "../css/images/marker-shadow.png";

import {
  QUAKE_URL,
  MAPBOX_TILE_URL,
  TILE_LAYER_ATTRIBUTION,
  MAP_INIT_COORDINATES,
  LOAD_DATA_FREQ,
  WS_URL
} from "./Constants";
import {
  loadJSONP,
  makeRow,
  makeTweetElement,
  identity,
  isDev
} from "./Helper";

// Setup Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker,
  shadowUrl: markerShadow
});

// Setup map container
const mapContainer = document.createElement("div");
mapContainer.id = "map";
document.body.appendChild(mapContainer);

const table = document.getElementById("quakes_info");

// Add window resize listener
window.addEventListener("resize", function() {
  mapContainer.style.height = window.innerHeight + "px";
  mapContainer.style.width = window.innerWidth + "px";
});
window.dispatchEvent(new Event("resize"));

// Add map tile to the map view
const map = L.map("map").setView(MAP_INIT_COORDINATES, 10);
L.tileLayer(MAPBOX_TILE_URL, {
  attribution: TILE_LAYER_ATTRIBUTION,
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: MAPBOX_CONFIG.access_token
}).addTo(map);

const codeLayers = {};
const quakeLayers = L.layerGroup([]).addTo(map);

function isHovering(element) {
  const over = Observable.fromEvent(element, "mouseover").mapTo(identity(true));
  const out = Observable.fromEvent(element, "mouseout").mapTo(identity(false));

  return over.merge(out);
}

function getRowFromEvent(event) {
  return Observable.fromEvent(table, event)
    .pluck("target")
    .filter(target => {
      return target.tagName === "TD" && target.parentNode.id.length;
    })
    .pluck("parentNode")
    .distinctUntilChanged();
}

function initialize() {
  // webSocket setup
  const socket$ = Observable.webSocket(
    isDev() ? WS_URL.development : WS_URL.production
  );

  // Create Observable to retrieve dataset and emits single earthquake
  const quakes$ = Observable.timer(0, LOAD_DATA_FREQ)
    .flatMap(() => {
      return loadJSONP({
        url: QUAKE_URL,
        callbackName: "eqfeed_callback"
      }).retry(3);
    })
    .flatMap(result => Observable.from(result.response.features))
    .distinct(quake => quake.properties.code)
    .share();

  //Draw circle based on the quake coords and mag
  quakes$.subscribe(quake => {
    const coords = quake.geometry.coordinates;
    const size = quake.properties.mag * 10000;

    const circle = L.circle([coords[1], coords[0]], size).addTo(map);
    quakeLayers.addLayer(circle);
    codeLayers[quake.id] = quakeLayers.getLayerId(circle);
  });

  quakes$.bufferTime(3000).bufferCount(100).subscribe(quakes => {
    const quakesData = quakes.map(quake => ({
      id: quake.properties.net + quake.properties.code,
      lat: quake.geometry.coordinates[1],
      lng: quake.geometry.coordinates[0],
      mag: quake.properties.mag
    }));
    socket$.next(JSON.stringify({ quakes: quakesData }));
  });

  socket$.subscribe(data => {
    const tweetContainer = document.getElementById("tweet_container");
    tweetContainer.insertBefore(
      makeTweetElement(data),
      tweetContainer.firstChild
    );
  });

  // Fill table with quake info
  quakes$
    .pluck("properties")
    .map(makeRow)
    .bufferTime(500)
    .filter(rows => rows.length > 0)
    .map(rows => {
      // use createDocumentFragment to avoid unnecessary repaint
      const fragment = document.createDocumentFragment();
      rows.forEach(row => {
        fragment.appendChild(row);
      });
      return fragment;
    })
    .subscribe(fragment => {
      table.appendChild(fragment);
    });

  getRowFromEvent("mouseover")
    .pairwise()
    .subscribe(rows => {
      const prevCircle = quakeLayers.getLayer(codeLayers[rows[0].id]);
      const curCircle = quakeLayers.getLayer(codeLayers[rows[1].id]);
      prevCircle.setStyle({ color: "#0000ff" });
      curCircle.setStyle({ color: "#ff0000" });
    });

  getRowFromEvent("click").subscribe(row => {
    const circle = quakeLayers.getLayer(codeLayers[row.id]);
    map.panTo(circle.getLatLng());
  });
}

Observable.fromEvent(document, "DOMContentLoaded").subscribe(initialize);
