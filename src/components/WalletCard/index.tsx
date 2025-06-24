import React from "react";
import { Card, Icon, Title, Toggle } from "@stellar/design-system";
import { ENABLE_EMBEDDED_WALLETS } from "constants/envVariables";
import { InfoTooltip } from "components/InfoTooltip";
import "./styles.scss";

interface WalletCardProps {
  walletName: string;
  walletId: string;
  homepageUrl: string;
  enabled: boolean;
  assets: string[];
  editable: boolean | null;
  userManaged: boolean | undefined;
  embedded?: boolean;
  onChange: () => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  walletName,
  walletId,
  homepageUrl,
  enabled,
  assets,
  editable = true,
  userManaged,
  embedded = false,
  onChange,
}: WalletCardProps) => {
  const isEmbeddedWalletDisabled = embedded && !ENABLE_EMBEDDED_WALLETS;
  const isToggleDisabled = !editable || isEmbeddedWalletDisabled;

  return (
    <Card noPadding>
      <div className="WalletCard">
        <div className="WalletCard__title">
          <div className="WalletCard__item">
            <div>
              <div className="WalletCard__item">
                <Title size="lg">{walletName}</Title>
                <a
                  className="WalletCard__ExternalLink"
                  href={homepageUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <Icon.ExternalLink className="ExternalLinkIcon" />
                </a>
              </div>
            </div>

            <div className="WalletCard__toggle">
              {isEmbeddedWalletDisabled && (
                <InfoTooltip infoText="Contact your system administrator to enable embedded wallets.">
                  <Toggle
                    id={walletId}
                    checked={enabled}
                    onChange={onChange}
                    disabled={isToggleDisabled}
                  />
                </InfoTooltip>
              )}
              {!isEmbeddedWalletDisabled && (
                <Toggle
                  id={walletId}
                  checked={enabled}
                  onChange={onChange}
                  disabled={isToggleDisabled}
                />
              )}
            </div>
          </div>
        </div>

        <div className="WalletCard__walletData">
          <div className="WalletCard--flexCols">
            <label className="WalletCard__item__label">
              <Icon.Assets /> Supported assets
            </label>
            <div className="WalletCard__item__value">{assets?.join(", ")}</div>
          </div>
          <div className="WalletCard--flexCols">
            <label className="WalletCard__item__label">
              <Icon.Assets /> User Managed?
            </label>
            <div className="WalletCard__item__value">
              {userManaged ? "Yes" : "No"}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
