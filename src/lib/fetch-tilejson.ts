import { TileJSON } from "./constants";

export async function fetchTilejson(url: string): Promise<{ data: TileJSON }> {
  const response = await fetch(url);
  return await response.json();
}
