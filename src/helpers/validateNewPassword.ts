export const validateNewPassword = (password: string): string => {
  const passwordStrength = new RegExp(
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})",
  );

  let errorMsg = "";

  if (!password) {
    errorMsg = "Password is required";
  } else if (password.length < 12) {
    errorMsg = "Password must be at least 12 characters long";
  } else if (!passwordStrength.test(password)) {
    errorMsg =
      "Password must have at least one uppercase letter, lowercase letter, number, and symbol.";
  }

  return errorMsg;
};
