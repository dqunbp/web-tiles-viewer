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
  Callout,
  Collapse,
  TextArea,
} from "@blueprintjs/core";
import { ItemPredicate, ItemRenderer, Select } from "@blueprintjs/select";
import { Popover2 } from "@blueprintjs/popover2";
import { IconNames } from "@blueprintjs/icons";
import {
  layerMenuItems,
  LayerType,
  Placeholders,
  UrlType,
  VectorLayerItem,
} from "lib/constants";
import { randomID } from "lib/get-random-id";
import { DataLayer } from "lib/mapbox-helpers";
import { TileJSON } from "lib/constants";
import { useMachine } from "@xstate/react";
import { fetchTilejsonMachine } from "machines/fetch-tilejson";
import { useDisclosure } from "hooks/use-disclosure";

function UrlTypeMenu({
  type,
  onChange,
  disabled = false,
}: {
  type: UrlType;
  onChange(nextType: UrlType): void;
  disabled: boolean;
}) {
  return (
    <Popover2
      disabled={disabled}
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

const TileJsonPreview: React.FC<{ tilejson: TileJSON }> = ({ tilejson }) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Callout intent={Intent.SUCCESS}>
      <div className="flex items-center flex-nowrap justify-between">
        <div>TileJSON is valid</div>
        <Button
          minimal
          text="View"
          icon={!isOpen ? IconNames.CHEVRON_DOWN : IconNames.CHEVRON_UP}
          onClick={onToggle}
        />
      </div>
      <Collapse className={isOpen ? "mt-2" : ""} isOpen={isOpen}>
        <TextArea
          fill
          // growVertically
          rows={10}
          value={JSON.stringify(tilejson, null, 2)}
        />
      </Collapse>
    </Callout>
  );
};

const AddLayerForm: React.FC<{
  onSubmit(payload: DataLayer, tilejson?: TileJSON | null): void;
  onClose(): void;
}> = ({ onSubmit, onClose }) => {
  const [layerType, setLayerType] = React.useState<LayerType>("raster");
  const handleLayerTypeChange = (e: React.FormEvent<HTMLInputElement>) =>
    setLayerType(e.currentTarget.value as LayerType);

  const [urlType, setUrlType] = React.useState<UrlType>("xyz");
  const [url, setUrl] = React.useState<string>("");

  const [name, setName] = React.useState<string>("");
  const [sourceLayer, setSourceLayer] = React.useState<string>("");

  const [state, send] = useMachine(fetchTilejsonMachine, {
    devTools: true,
  });

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const typeValue =
      value.includes(".json?") || value.endsWith(".json")
        ? "tilejson"
        : urlType;

    setUrl(value);
    setUrlType(typeValue);

    if (typeValue === "tilejson") send({ type: "URL_CHANGE", value });
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    onSubmit(
      {
        id: randomID(),
        name,
        type: layerType,
        urlType,
        url,
        sourceLayer,
      },
      state.matches("valid") ? state.context.tilejson : null
    );
  };

  const isFetching = state.matches("fetching");

  return (
    <div>
      <div className="flex justify-between items-center mb-7">
        <H3 className="mb-0">Adding new data layer</H3>
        <Button minimal large icon={IconNames.CROSS} onClick={onClose} />
      </div>
      <form onSubmit={handleFormSubmit}>
        <FormGroup
          className="mb-5"
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
          className="mb-5"
          name="layer-type"
          label={<div className="font-bold">Layer type</div>}
          onChange={handleLayerTypeChange}
          selectedValue={layerType}
        >
          <Radio large label="Raster" value="raster" />
          <Radio large label="Vector" value="vector" />
        </RadioGroup>

        <FormGroup
          className="mb-3"
          label={<div className="font-bold">URL</div>}
          labelFor="url"
        >
          <InputGroup
            large
            id="url"
            name="url"
            required
            disabled={isFetching}
            placeholder={Placeholders[urlType][layerType]}
            rightElement={
              <UrlTypeMenu
                type={urlType}
                onChange={setUrlType}
                disabled={isFetching}
              />
            }
            value={url}
            onChange={handleUrlChange}
          />
        </FormGroup>

        <div className="mb-5">
          {state.matches("invalid.tilejson") && (
            <Callout intent={Intent.DANGER}>Invalid TileJSON</Callout>
          )}
          {state.matches("invalid.url") && (
            <Callout intent={Intent.DANGER}>Invalid URL</Callout>
          )}
          {state.matches("invalid.network") && (
            <Callout intent={Intent.DANGER}>
              Network error. Unable to fetch TileJSON
            </Callout>
          )}
          {state.matches("valid") && (
            <TileJsonPreview tilejson={state.context.tilejson!} />
          )}
        </div>

        {layerType === "vector" && (
          <FormGroup
            className="mb-5"
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

        <Button
          loading={isFetching}
          fill
          large
          type="submit"
          intent={Intent.SUCCESS}
          text="Save"
        />
      </form>
    </div>
  );
};

export default AddLayerForm;
