type GetCurrentPageItemsProps<T> = {
  currentIndex: number | undefined;
  allItems: T[];
  maxCount: number;
  pageSize: number;
  onFetchMore: () => void;
};

export const getCurrentPageItems = <T>({
  currentIndex = 1,
  allItems,
  maxCount,
  pageSize,
  onFetchMore,
}: GetCurrentPageItemsProps<T>) => {
  const index = currentIndex - 1;
  const currentSize = allItems.length;
  const startAt = index * pageSize;
  const endAt = Math.min(maxCount, startAt + pageSize);

  // Have all items to show
  if (currentSize >= endAt) {
    return allItems.slice(startAt, endAt);
  }

  onFetchMore();
  return null;
};
