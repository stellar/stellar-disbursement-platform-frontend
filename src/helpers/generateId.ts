export const generateId = (prefix: string): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  // Fallback: timestamp + random number for better uniqueness
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
