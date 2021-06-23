import * as React from "react";
import mapbox from "lib/map-wrapper";

const WebMap: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      id="map"
      ref={(node) => mapbox.create(node)}
      className={className}
    ></div>
  );
};

export default WebMap;
