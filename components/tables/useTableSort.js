import { useCallback, useState } from "react";

const compareTableValues = (a, b) => {
  if (a === b) return 0;

  const aText = String(a ?? "").trim().toLowerCase();
  const bText = String(b ?? "").trim().toLowerCase();

  return aText.localeCompare(bText, undefined, {
    numeric: true,
    sensitivity: "base",
  });
};

export default function useTableSort(getSortValue) {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const handleSort = useCallback((key) => {
    if (!key) return;

    setSortConfig((previous) => ({
      key,
      direction:
        previous.key === key && previous.direction === "asc"
          ? "desc"
          : "asc",
    }));
  }, []);

  const sortData = useCallback(
    (items = []) => {
      if (!sortConfig.key) return items;

      return items
        .map((row, index) => ({ row, index }))
        .sort((a, b) => {
          const result = compareTableValues(
            getSortValue(a.row, sortConfig.key),
            getSortValue(b.row, sortConfig.key),
          );

          if (result !== 0) {
            return sortConfig.direction === "asc" ? result : -result;
          }

          return a.index - b.index;
        })
        .map(({ row }) => row);
    },
    [getSortValue, sortConfig],
  );

  return { sortConfig, handleSort, sortData };
}
