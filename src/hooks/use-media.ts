import * as React from "react";

export function useMedia<T>(queries: string[], values: T[], defaultValue: T) {
  const mediaQueryLists =
    typeof window === "undefined"
      ? []
      : queries.map((q) => window.matchMedia(q));

  const getValue = () => {
    const index = mediaQueryLists.findIndex((mql) => mql.matches);
    return values?.[index] || defaultValue;
  };

  const [value, setValue] = React.useState<T>(getValue);

  React.useEffect(() => {
    const handler = () => setValue(getValue);

    mediaQueryLists.forEach((mql) => mql.addEventListener("change", handler));

    return () =>
      mediaQueryLists.forEach((mql) =>
        mql.removeEventListener("change", handler)
      );
  }, []);
  return value;
}
