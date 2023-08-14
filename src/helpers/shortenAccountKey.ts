export const shortenAccountKey = (accountKey: string) =>
  `${accountKey.slice(0, 5)}…${accountKey.slice(-5)}`;
