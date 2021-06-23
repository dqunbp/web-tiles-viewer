import mapboxgl from "mapbox-gl";

class MapWrapper {
  private _map?: mapboxgl.Map;

  get map() {
    if (!this._map)
      throw new Error("Cannot access mapbox map before inilizing it");

    return this._map;
  }

  get initialized() {
    return !!this._map;
  }

  create<T extends HTMLElement>(node: T | null) {
    if (!node) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
    this._map = new mapboxgl.Map({
      container: node,
      style: "mapbox://styles/mapbox/dark-v10", // style URL
      center: [-74.5, 40], // starting position [lng, lat]
      zoom: 9, // starting zoom
    });
  }
}

const map = new MapWrapper();

export default map;
