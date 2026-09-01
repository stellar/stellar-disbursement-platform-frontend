import React from "react";

import { DistributionWallet } from "@/apiQueries/useDistributionWallets";

import { distributionAccountColor } from "@/helpers/distributionAccountColor";
import { distributionAccountDisplayName } from "@/helpers/distributionAccountDisplayName";

import "./styles.scss";

// Colour dot + name of a distribution account. `defaultMarker` renders the default account either
// as the pill badge (switcher rows) or as literal "(default)" text; `showArchived` appends an
// "(archived)" note for historical rows. Inline so it can sit in a heading, a table cell or a
// button label. The colour is the only dynamic value, so it travels as a CSS custom property.
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
      {defaultMarker === "text" ? distributionAccountDisplayName(wallet) : wallet.name}
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
