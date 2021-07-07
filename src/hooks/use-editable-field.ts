import * as React from "react";

export function useEditableField<T>(
  checkIsValid: (value: T) => boolean,
  onConfirm: (value: T) => void
) {
  const [value, setValue] = React.useState<T>();
  const isValid = typeof value === "undefined" || checkIsValid(value);

  const handleConfirm = () => {
    if (typeof value !== "undefined" && isValid) onConfirm(value);

    setValue(undefined);
  };

  return {
    value,
    isValid,
    setValue,
    handleConfirm,
    isEditing: typeof value !== "undefined",
  };
}
