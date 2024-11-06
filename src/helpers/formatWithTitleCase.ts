export const formatWithTitleCase = (input: string | undefined): string => {
  if (!input) {
    return "";
  }

  return input
    .toLowerCase()
    .split(/[-_ ]+/) // Split on hyphens, underscores, or spaces
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
    .join(" ");
};
