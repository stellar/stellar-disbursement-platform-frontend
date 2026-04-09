import { Avatar } from "@stellar/design-system";

import { getEmbeddedWalletAssetMetadata } from "@/constants/embeddedWalletAssets";

import "./styles.scss";

type Props = {
  assetCode: string;
  size: "sm" | "md" | "lg";
};

export const EmbeddedWalletAssetLogo = ({ assetCode, size }: Props) => {
  const assetMetadata = getEmbeddedWalletAssetMetadata(assetCode);
  const resolvedLogo = assetMetadata?.logo;
  const resolvedLabel = assetMetadata?.label;
  const altText = resolvedLabel ? `${resolvedLabel} icon` : `${assetCode} icon`;

  return (
    <span className="EmbeddedWalletAssetLogo" data-size={size}>
      {resolvedLogo ? (
        <img src={resolvedLogo} alt={altText} />
      ) : (
        <Avatar userName={assetCode} size={size} />
      )}
    </span>
  );
};
