export const validatePasswordMatch = (
  password: string,
  confirmPassword: string,
): string => {
  let errorMsg = "";
  if (confirmPassword) {
    errorMsg = password === confirmPassword ? "" : "Passwords don't match";
  } else {
    errorMsg = "Confirm password is required";
  }

  return errorMsg;
};
