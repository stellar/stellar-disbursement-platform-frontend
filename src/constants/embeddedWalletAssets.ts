import EurocLogoSrc from "@/assets/logo-euroc.png";
import UsdcLogoSrc from "@/assets/logo-usdc.png";
import XlmLogoSrc from "@/assets/logo-xlm.png";

export type EmbeddedWalletAssetMetadata = {
  code: string;
  label: string;
  logo: string;
};

export const DEFAULT_EMBEDDED_WALLET_ASSET_CODE = "XLM";

export const EMBEDDED_WALLET_ASSET_MAP: Record<string, EmbeddedWalletAssetMetadata> = {
  XLM: {
    code: "XLM",
    label: "Stellar Lumens",
    logo: XlmLogoSrc,
  },
  EURC: {
    code: "EURC",
    label: "Euro Coin",
    logo: EurocLogoSrc,
  },
  USDC: {
    code: "USDC",
    label: "USD Coin",
    logo: UsdcLogoSrc,
  },
};

export const getEmbeddedWalletAssetMetadata = (assetCode?: string): EmbeddedWalletAssetMetadata => {
  const normalizedCode = assetCode?.toUpperCase() ?? DEFAULT_EMBEDDED_WALLET_ASSET_CODE;

  return (
    EMBEDDED_WALLET_ASSET_MAP[normalizedCode] ??
    EMBEDDED_WALLET_ASSET_MAP[DEFAULT_EMBEDDED_WALLET_ASSET_CODE]
  );
};
