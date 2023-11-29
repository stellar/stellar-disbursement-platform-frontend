export const formatVerificationFieldString = (input: string) => {
  // Split the input string into words based on underscores
  const words: string[] = input.split("_");

  // Capitalize the first letter of each word
  const capitalizedWords: string[] = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
  );

  // Join the words back together with spaces
  const result: string = capitalizedWords.join(" ");

  return result;
};
