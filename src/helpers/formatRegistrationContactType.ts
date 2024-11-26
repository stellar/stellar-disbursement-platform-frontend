import { RegistrationContactType, RegistrationContactTypeMap } from "types";

export const formatRegistrationContactType = (
  input: RegistrationContactType | string | undefined,
): string => {
  if (!input) {
    return "";
  }

  return RegistrationContactTypeMap[input] || input;
};
