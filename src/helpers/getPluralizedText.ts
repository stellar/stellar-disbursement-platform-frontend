import { capitalizeString } from "helpers/capitalizeString";

export const getPluralizedText = ({
  count,
  singular,
  plural,
}: {
  count: number;
  singular: string;
  plural: string;
}) => {
  if (count === 0) {
    return capitalizeString(plural);
  }

  if (count === 1) {
    return `1 ${singular}`;
  }

  if (count > 1) {
    return `${count} ${plural}`;
  }

  return "";
};
