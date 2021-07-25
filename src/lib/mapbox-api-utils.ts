import mapboxgl from "mapbox-gl";

type LayerType = mapboxgl.AnyLayer["type"];

abstract class Layer {
  abstract type: LayerType;

  constructor(private map: mapboxgl.Map, public id: string) {}

  setOpacity(value: number): void {
    this.map.setPaintProperty(this.id, `${this.type}-opacity`, value);
  }

  toggleVisibility(): void {
    const isVisible =
      this.map.getLayoutProperty(this.id, "visibility") === "visible";
    this.map.setLayoutProperty(
      this.id,
      "visibility",
      isVisible ? "none" : "visible"
    );
  }
}

class RasterLayer extends Layer implements mapboxgl.RasterLayer {
  type = "raster" as const;
}

class FillLayer extends Layer implements mapboxgl.FillLayer {
  type = "fill" as const;
}

class MapboxMap {
  constructor(private map: mapboxgl.Map) {}

  private layer(id: string, type: LayerType) {
    switch (type) {
      case "fill":
        return new FillLayer(this.map, id);
      case "raster":
        return new RasterLayer(this.map, id);
      default:
        throw new Error(`Unknown layer type ${type}`);
    }
  }

  getLayer(id: string): Layer {
    const layerData = this.map.getLayer(id);
    if (!layerData) throw new Error(`Layer with id ${id} not found`);
    return this.layer(id, layerData.type);
  }
}

export function mapUtils(instance: mapboxgl.Map) {
  return new MapboxMap(instance);
}
