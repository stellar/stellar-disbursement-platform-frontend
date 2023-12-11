export const getOrganizationName = (): string => {
  const words = window.location.hostname.split(".")[0].split("-");

  for (let i = 0; i < words.length; i++) {
    words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
  }

  return words.join(" ");
};
