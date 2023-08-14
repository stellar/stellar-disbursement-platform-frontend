export const shortenString = (text: string, buffer?: number) => {
  const bufferSize = buffer || 5;
  return `${text.slice(0, bufferSize)}…${text.slice(-bufferSize)}`;
};
