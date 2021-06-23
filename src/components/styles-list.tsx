import * as React from "react";
import { Card } from "@blueprintjs/core";
import webMap from "lib/map-wrapper";

type Style = {
  id: string;
  label: string;
  url: string;
};

const styles: Style[] = [
  {
    id: "satellite",
    label: "Satellite",
    url: "mapbox://styles/mapbox/satellite-v9",
  },
  { id: "dark", label: "Dark", url: "mapbox://styles/mapbox/dark-v10" },
  { id: "light", label: "Light", url: "mapbox://styles/mapbox/light-v10" },
  {
    id: "streets",
    label: "Streets",
    url: "mapbox://styles/mapbox/streets-v11",
  },
  {
    id: "outdoors",
    label: "Outdoors",
    url: "mapbox://styles/mapbox/outdoors-v11",
  },
];

const Style: React.FC<Style> = (style) => {
  const handleClickStyle = (nextStyle: Style) => () => {
    console.log("next style", nextStyle);
    webMap.map.setStyle(nextStyle.url);
  };

  return (
    <Card
      className="pointer mb-2 last:mb-0"
      onClick={handleClickStyle(style)}
    >{`${style.label}`}</Card>
  );
};

const StylesList: React.FC = () => {
  return (
    <div className="py-4">
      {styles.map((style) => (
        <Style
          key={style.id}
          id={style.id}
          label={style.label}
          url={style.url}
        />
      ))}
    </div>
  );
};

export default StylesList;
