import mapboxgl from "mapbox-gl";
import { initialMapState } from "./constants";

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

  create<T extends HTMLElement>(
    node: T | null,
    cb?: (map: mapboxgl.Map) => void
  ) {
    if (!node) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
    this._map = new mapboxgl.Map({
      container: node,
      zoom: initialMapState.zoom,
      center: initialMapState.center,
      style: initialMapState.style.url,
    });

    if (cb !== undefined) cb(this._map);
  }
}

const map = new MapWrapper();

export default map;
