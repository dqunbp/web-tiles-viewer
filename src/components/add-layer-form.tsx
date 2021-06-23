import * as React from "react";
import { Button, Classes, Drawer } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { useDisclosure } from "hooks/use-disclosure";

const AddLayerForm: React.FC = () => {
  const { isOpen, onToggle, onClose } = useDisclosure();

  return (
    <div>
      <Button
        fill
        icon={IconNames.ADD}
        text="Add new layer"
        onClick={onToggle}
      />
      <Drawer isOpen={isOpen} onClose={onClose}>
        <div className={Classes.DRAWER_BODY}>
          <div className={Classes.DIALOG_BODY}>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos rem
              numquam modi fugiat possimus hic, placeat aut similique quo
              aliquam et sequi iusto pariatur accusamus rerum sunt officia sit
              perspiciatis.
            </p>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default AddLayerForm;
