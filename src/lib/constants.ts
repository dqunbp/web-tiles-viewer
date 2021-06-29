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
