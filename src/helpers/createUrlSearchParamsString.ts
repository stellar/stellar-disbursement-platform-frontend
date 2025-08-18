export const createUrlSearchParamsString = <T extends Record<string, string>>(
  params: T,
) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, value);
  });

  return `?${searchParams.toString()}`;
};
