import EurocLogoSrc from "@/assets/logo-euroc.png";
import TokenLogoSrc from "@/assets/logo-token.png";
import UsdcLogoSrc from "@/assets/logo-usdc.png";
import XlmLogoSrc from "@/assets/logo-xlm.png";

export type EmbeddedWalletAssetMetadata = {
  code: string;
  label: string;
  logo: string;
};

export const DEFAULT_EMBEDDED_WALLET_FALLBACK_CODE = "UNKNOWN_ASSET";

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

export const getEmbeddedWalletAssetMetadata = (assetCode: string): EmbeddedWalletAssetMetadata => {
  return (
    EMBEDDED_WALLET_ASSET_MAP[assetCode] ?? {
      code: assetCode,
      label: assetCode,
      logo: TokenLogoSrc,
    }
  );
};
