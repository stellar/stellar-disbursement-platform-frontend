// Assets are keyed `CODE:ISSUER` throughout the app — the distribution-wallet balance map
// returned by `/distribution-wallets/balance`, and the preset-asset ids. Native XLM has no
// issuer, so a key with a missing or empty issuer resolves to the "native" sentinel the rest
// of the app already uses (see `AccountBalanceItem.assetIssuer`).
export const parseAssetKey = (assetKey: string): { code: string; issuer: string } => {
  const [code, issuer] = assetKey.split(":");

  return { code, issuer: issuer || "native" };
};
