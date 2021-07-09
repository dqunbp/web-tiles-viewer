import * as React from "react";
import { Card } from "@blueprintjs/core";
import { MapStyle, styles } from "lib/constants";
import { useActor } from "@xstate/react";
import { MapEventType, mapService } from "lib/map-state-machine";
import type { StyleObject } from "lib/constants";

const Style: React.FC<StyleObject> = (style) => {
  const [state, send] = useActor(mapService);

  const handleClickStyle = (nextStyle: StyleObject) => () => {
    send({
      type: MapEventType.CHANGE_STYLE,
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
