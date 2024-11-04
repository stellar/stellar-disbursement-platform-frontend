export const formatWithTitleCase = (
  input: string | undefined,
): string | undefined => {
  if (input === undefined) {
    return undefined;
  }

  return input
    .toLowerCase()
    .split(/[-_ ]+/) // Split on hyphens, underscores, or spaces
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
    .join(" ");
};

// const formatWithTitleCase = (str: string) => {
//   return str
//     .toLowerCase()
//     .replace("_", " ")
//     .replace("-", " ")
//     .split(" ")
//     .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//     .join(" ");
// };
