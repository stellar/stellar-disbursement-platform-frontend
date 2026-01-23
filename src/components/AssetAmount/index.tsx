import { decimal } from "@/helpers/formatIntlNumber";

import EurocLogoSrc from "@/assets/logo-euroc.svg";
import UsdcLogoSrc from "@/assets/logo-usdc.svg";
import XlmLogoSrc from "@/assets/logo-xlm.svg";
import "./styles.scss";

interface AssetAmountProps {
  amount?: string;
  assetCode?: string;
  fallback?: string;
  showIcon?: boolean;
}

export const AssetAmount: React.FC<AssetAmountProps> = ({
  amount,
  assetCode,
  fallback,
  showIcon,
}: AssetAmountProps) => {
  if (!amount) {
    return fallback ? <>{fallback}</> : null;
  }

  const assets = [
    {
      code: "USDC",
      image: UsdcLogoSrc,
    },
    {
      code: "EUROC",
      image: EurocLogoSrc,
    },
    {
      code: "XLM",
      image: XlmLogoSrc,
    },
  ];

  const foundAsset = assets.find((a) => a.code === assetCode);

  return (
    <span className="AssetAmount">
      {decimal.format(Number(amount))}
      {assetCode ? <span className="AssetAmount__code">{assetCode}</span> : null}
      {showIcon ? (
        <span className="AssetAmount__icon">
          {foundAsset ? <img src={foundAsset.image} alt={`${foundAsset.code} icon`} /> : null}
        </span>
      ) : null}
    </span>
  );
};
