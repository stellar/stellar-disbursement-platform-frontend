// Deterministic per-account color chip (AWS account-color idea): each distribution account
// gets a stable color so users recognize "which account" at a glance, consistently in the
// switcher, page headings, and anywhere else an account is named.
const ACCOUNT_COLORS = [
  "#7B61FF",
  "#0EA5E9",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#8B5CF6",
  "#14B8A6",
];

export const accountColor = (key: string) => {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) & 0xffffffff;
  }
  return ACCOUNT_COLORS[Math.abs(hash) % ACCOUNT_COLORS.length];
};
