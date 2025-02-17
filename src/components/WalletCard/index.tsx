import React from "react";
import { Card, Icon, Toggle, Title } from "@stellar/design-system";
import "./styles.scss";

interface WalletCardProps {
  walletName: string;
  walletId: string;
  homepageUrl: string;
  enabled: boolean;
  assets: string[];
  editable: boolean | null;
  userManaged: boolean | undefined;
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
  onChange,
}: WalletCardProps) => {
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

            <Toggle
              id={walletId}
              checked={enabled}
              onChange={onChange}
              disabled={!editable}
            />
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
