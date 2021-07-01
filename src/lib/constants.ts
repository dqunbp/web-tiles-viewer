export enum MapStyleId {
  DARK = "DARK",
  LIGHT = "LIGHT",
  SATELLITE = "SATELLITE",
  STREETS = "STREETS",
  OUTDOORS = "OUTDOORS",
}
export type MapStyle =
  | { id: MapStyleId.DARK; url: "mapbox://styles/mapbox/dark-v10" }
  | { id: MapStyleId.LIGHT; url: "mapbox://styles/mapbox/light-v10" }
  | { id: MapStyleId.SATELLITE; url: "mapbox://styles/mapbox/satellite-v9" }
  | { id: MapStyleId.STREETS; url: "mapbox://styles/mapbox/streets-v11" }
  | { id: MapStyleId.OUTDOORS; url: "mapbox://styles/mapbox/outdoors-v11" };

type InitialMapState = {
  style: MapStyle;
  center: [number, number];
  zoom: number;
};
export const initialMapState: InitialMapState = {
  style: {
    id: MapStyleId.SATELLITE,
    url: "mapbox://styles/mapbox/satellite-v9",
  },
  center: [-74.5, 40],
  zoom: 9,
};

export type LayerType = "raster" | "vector";
export type UrlType = "xyz" | "tilejson";

export const Placeholders: Record<UrlType, Record<LayerType, string>> = {
  xyz: {
    raster: "http(s)://somesite.com/{x}/{y}/{z}.png",
    vector: "http(s)://somesite.com/{x}/{y}/{z}.pbf",
  },
  tilejson: {
    raster: "http(s)://somesite.com/tiles.json",
    vector: "http(s)://somesite.com/tiles.json",
  },
};

export const layerMenuItems: UrlTypeMenuItem[] = [
  { value: "xyz", label: "xyz" },
  { value: "tilejson", label: "tilejson" },
];

export type UrlTypeMenuItem = { value: UrlType; label: string };
