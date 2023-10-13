import { number } from "helpers/formatIntlNumber";

export const renderTextWithCount = (
  itemCount: number,
  singularText: string,
  pluralText: string,
) => {
  if (itemCount === 1) {
    return `1 ${singularText}`;
  } else if (itemCount > 1) {
    return `${number.format(itemCount)} ${pluralText}`;
  }

  return pluralText;
};
