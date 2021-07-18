import { UrlType, LayerType } from "./constants";

export type DataLayer = {
  id: string;
  url: string;
  name: string;
  type: LayerType;
  urlType: UrlType;
  sourceLayer?: string;
};

export type Source =
  | { type: "raster"; tiles: string[]; tileSize: number }
  | { type: "raster"; url: string; tileSize: number }
  | { type: "vector"; tiles: string[] }
  | { type: "vector"; url: string };

function createSource(layer: DataLayer): Source {
  switch (layer.type) {
    case "raster":
      switch (layer.urlType) {
        case "xyz":
          return { type: "raster", tiles: [layer.url], tileSize: 256 };
        case "tilejson":
          return { type: "raster", url: layer.url, tileSize: 256 };
        default:
          throw new Error("Unexpected url type");
      }
    case "vector":
      switch (layer.urlType) {
        case "xyz":
          return {
            type: "vector",
            tiles: [layer.url],
          };
        case "tilejson":
          return {
            type: "vector",
            url: layer.url,
          };
        default:
          throw new Error("Unexpected url type");
      }
    default:
      throw new Error("Unexpected layer type");
  }
}

type Layer =
  | {
      id: string;
      type: "raster";
      source: string;
      layout?: mapboxgl.RasterLayout;
      paint?: mapboxgl.RasterPaint;
    }
  | {
      id: string;
      type: "fill";
      source: string;
      layout: mapboxgl.FillLayout;
      paint: mapboxgl.FillPaint;
      "source-layer": string;
    };

function createLayer(id: string, sourceId: string, layer: DataLayer): Layer {
  switch (layer.type) {
    case "raster":
      return { id, type: "raster", source: sourceId };
    case "vector":
      return {
        id,
        type: "fill",
        source: sourceId,
        layout: {},
        paint: { "fill-color": "green" },
        "source-layer": layer.sourceLayer!,
      };
  }
}

export function addMapLayer(mapAPI: mapboxgl.Map, layer: DataLayer) {
  const sourceId = `${layer.id}-source`;

  const addSourcePayload = createSource(layer);
  const addLayerPayload = createLayer(`${layer.id}`, sourceId, layer);

  if (!mapAPI.getSource(sourceId)) {
    mapAPI.addSource(sourceId, addSourcePayload);
    mapAPI.addLayer(addLayerPayload);
  }
}

export function removeMapLayer(mapAPI: mapboxgl.Map, layerId: string) {
  const sourceId = `${layerId}-source`;

  if (mapAPI.getSource(sourceId)) {
    mapAPI.removeLayer(`${layerId}`);
    mapAPI.removeSource(sourceId);
  }
}
