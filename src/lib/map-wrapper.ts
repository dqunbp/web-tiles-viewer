import mapboxgl from "mapbox-gl";

class MapWrapper {
  private _map?: mapboxgl.Map;

  get map() {
    if (typeof this._map === "undefined")
      throw new Error("Cannot access mapbox map before inilizing it");
    return this._map;
  }

  set map(instance: mapboxgl.Map) {
    this._map = instance;
  }

  cleanup(removeMap = false) {
    if (removeMap) this.map.remove();
    this._map = undefined;
  }

  create<T extends HTMLElement>(
    container: T,
    options: Omit<mapboxgl.MapboxOptions, "container">
  ) {
    const mapboxMap = new mapboxgl.Map({
      container,
      ...options,
    });

    this._map = mapboxMap;
  }
}

const wrapper = new MapWrapper();

export default wrapper;
