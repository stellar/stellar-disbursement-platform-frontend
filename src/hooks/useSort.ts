import { useState } from "react";
import { SortDirection } from "types";

export const useSort = <T>(
  onSort?: (sort?: T, direction?: SortDirection) => void,
) => {
  const [sortBy, setSortBy] = useState<T>();
  const [sortDir, setSortDir] = useState<SortDirection | undefined>(
    onSort ? "default" : undefined,
  );

  const handleSort = (id: T) => {
    let _sortDir: SortDirection;

    // Sorting by new id
    if (sortBy && id !== sortBy) {
      _sortDir = "asc";
    } else {
      // Sorting the same id
      if (sortDir === "default") {
        _sortDir = "asc";
      } else if (sortDir === "asc") {
        _sortDir = "desc";
      } else {
        // from descending
        _sortDir = "default";
      }
    }

    setSortDir(_sortDir);
    setSortBy(id);

    if (onSort) {
      onSort(id, _sortDir);
    }
  };

  return { handleSort, sortBy, sortDir };
};
