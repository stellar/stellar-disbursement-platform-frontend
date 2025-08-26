export const shortenAccountKey = (
  accountKey: string,
  startChars: number = 5,
  endChars: number = 5,
) => {
  if (!accountKey || accountKey.length <= startChars + endChars + 3) {
    return accountKey;
  }
  return `${accountKey.slice(0, startChars)}…${accountKey.slice(-endChars)}`;
};
