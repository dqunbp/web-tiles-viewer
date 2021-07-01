import * as React from "react";
import { Card } from "@blueprintjs/core";
import mapbox from "lib/map-wrapper";
import { MapStyle, MapStyleId } from "lib/constants";
import { useActor } from "@xstate/react";
import { EventType, stateService } from "lib/app-state-machine";

type Style = {
  id: MapStyleId;
  label: string;
  url: string;
};

const styles: Style[] = [
  {
    id: MapStyleId.SATELLITE,
    label: "Satellite",
    url: "mapbox://styles/mapbox/satellite-v9",
  },
  {
    id: MapStyleId.DARK,
    label: "Dark",
    url: "mapbox://styles/mapbox/dark-v10",
  },
  {
    id: MapStyleId.LIGHT,
    label: "Light",
    url: "mapbox://styles/mapbox/light-v10",
  },
  {
    id: MapStyleId.STREETS,
    label: "Streets",
    url: "mapbox://styles/mapbox/streets-v11",
  },
  {
    id: MapStyleId.OUTDOORS,
    label: "Outdoors",
    url: "mapbox://styles/mapbox/outdoors-v11",
  },
];

const Style: React.FC<Style> = (style) => {
  const [state, send] = useActor(stateService);

  const handleClickStyle = (nextStyle: Style) => () => {
    send({
      type: EventType.CHANGE_STYLE,
      mapStyle: { id: nextStyle.id, url: nextStyle.url } as MapStyle,
    });
  };

  const hightlightClass = `${
    state.context.mapStyle.id === style.id
      ? "ring-GREEN5"
      : "ring-GRAY5 hover:ring-BLUE5"
  }`;
  return (
    <Card
      className={`
      font-bold
      cursor-pointer mb-4 last:mb-0 
      transition duration-300 ease-in-out
      ring-2
      ${hightlightClass}`}
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
