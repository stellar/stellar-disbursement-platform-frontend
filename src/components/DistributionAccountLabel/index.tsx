import React from "react";

import { DistributionWallet } from "@/apiQueries/useDistributionWallets";

import { distributionAccountColor } from "@/helpers/distributionAccountColor";
import { distributionAccountDisplayName } from "@/helpers/distributionAccountDisplayName";

import "./styles.scss";

export const DistributionAccountLabel = ({
  wallet,
  defaultMarker,
  showArchived = false,
}: {
  wallet: Pick<DistributionWallet, "id" | "name" | "is_default"> &
    Partial<Pick<DistributionWallet, "status">>;
  defaultMarker?: "badge" | "text";
  showArchived?: boolean;
}) => {
  const dotStyle = {
    "--DistributionAccountLabel-dot-color": distributionAccountColor(wallet.id),
  } as React.CSSProperties;

  return (
    <span className="DistributionAccountLabel">
      <span className="DistributionAccountLabel__dot" style={dotStyle} aria-hidden="true" />
      <span className="DistributionAccountLabel__name">
        {defaultMarker === "text" ? distributionAccountDisplayName(wallet) : wallet.name}
      </span>
      {defaultMarker === "badge" && wallet.is_default ? (
        <span className="DistributionAccountLabel__badge">default</span>
      ) : null}
      {showArchived && wallet.status === "ARCHIVED" ? (
        <span className="DistributionAccountLabel__archived Note Note--small Note--noMargin">
          (archived)
        </span>
      ) : null}
    </span>
  );
};
