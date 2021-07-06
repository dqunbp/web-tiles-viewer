import * as React from "react";
import {
  H3,
  Button,
  FormGroup,
  InputGroup,
  RadioGroup,
  Radio,
  Menu,
  MenuItem,
  Intent,
} from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";
import { IconNames } from "@blueprintjs/icons";
import {
  layerMenuItems,
  LayerType,
  Placeholders,
  UrlType,
  UrlTypeMenuItem,
} from "lib/constants";
import { randomID } from "lib/get-random-id";
import { DataLayer } from "lib/mapbox-helpers";

function UrlTypeMenu({
  type,
  onChange,
}: {
  type: UrlType;
  onChange(nextType: UrlType): void;
}) {
  return (
    <Popover2
      content={
        <Menu>
          {layerMenuItems.map(({ value, label }) => (
            <MenuItem
              key={value}
              text={label}
              active={type === value}
              onClick={() => (type === value ? undefined : onChange(value))}
            />
          ))}
        </Menu>
      }
      placement="bottom-end"
    >
      <Button minimal rightIcon="caret-down" intent={Intent.PRIMARY}>
        {type}
      </Button>
    </Popover2>
  );
}

const AddLayerForm: React.FC<{
  onSubmit(payload: DataLayer): void;
  onClose(): void;
}> = ({ onSubmit, onClose }) => {
  const [layerType, setLayerType] = React.useState<LayerType>("raster");
  const handleLayerTypeChange = (e: React.FormEvent<HTMLInputElement>) =>
    setLayerType(e.currentTarget.value as LayerType);

  const [urlType, setUrlType] = React.useState<UrlType>("xyz");

  const [name, setName] = React.useState<string>("");
  const [url, setUrl] = React.useState<string>("");
  const [sourceLayer, setSourceLayer] = React.useState<string>("");

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    onSubmit({
      id: randomID(),
      name,
      type: layerType,
      urlType,
      url,
      sourceLayer,
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-7">
        <H3 className="mb-0">Adding new data layer</H3>
        <Button minimal large icon={IconNames.CROSS} onClick={onClose} />
      </div>
      <form onSubmit={handleFormSubmit}>
        <FormGroup
          className="mb-6"
          label={<div className="font-bold">Name</div>}
          labelFor="name"
          // helperText="Layer display name"
          // labelInfo="(required)"
        >
          <InputGroup
            large
            id="name"
            name="name"
            placeholder="Layer name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormGroup>

        <RadioGroup
          inline
          className="mb-6"
          name="layer-type"
          label={<div className="font-bold">Layer type</div>}
          onChange={handleLayerTypeChange}
          selectedValue={layerType}
        >
          <Radio large label="Raster" value="raster" />
          <Radio large label="Vector" value="vector" />
        </RadioGroup>

        <FormGroup
          className="mb-6"
          label={<div className="font-bold">URL</div>}
          labelFor="url"
        >
          <InputGroup
            large
            id="url"
            name="url"
            required
            placeholder={Placeholders[urlType][layerType]}
            rightElement={<UrlTypeMenu type={urlType} onChange={setUrlType} />}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </FormGroup>

        {layerType === "vector" && (
          <FormGroup
            className="mb-6"
            label={<div className="font-bold">Source layer</div>}
            labelFor="source-layer"
          >
            <InputGroup
              large
              id="source-layer"
              name="source-layer"
              required
              placeholder="Source layer name"
              value={sourceLayer}
              onChange={(e) => setSourceLayer(e.target.value)}
            />
          </FormGroup>
        )}
        <Button fill large type="submit" intent={Intent.SUCCESS} text="Save" />
      </form>
    </div>
  );
};

export default AddLayerForm;
