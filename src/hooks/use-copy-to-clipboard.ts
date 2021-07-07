import * as React from "react";

type CopyStatus = "inactive" | "copied" | "failed";

export const useCopyToClipboard = (
  text: string,
  notifyTimeout = 1000
): [CopyStatus, () => void] => {
  const [copyStatus, setCopyStatus] = React.useState<CopyStatus>("inactive");
  const copy = React.useCallback(() => {
    navigator.clipboard.writeText(text).then(
      () => setCopyStatus("copied"),
      () => setCopyStatus("failed")
    );
  }, [text]);

  React.useEffect(() => {
    if (copyStatus === "inactive") {
      return;
    }

    const timeoutId = setTimeout(
      () => setCopyStatus("inactive"),
      notifyTimeout
    );

    return () => clearTimeout(timeoutId);
  }, [copyStatus]);

  return [copyStatus, copy];
};
