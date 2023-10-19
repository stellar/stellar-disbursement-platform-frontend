import React from "react";
import { Card, Icon, Toggle, Title } from "@stellar/design-system";
import { AppDispatch } from "store";
import { useDispatch } from "react-redux";
import { actions } from "store/ducks/wallets";
import "./styles.scss";

interface WalletCardProps {
  walletName: string;
  walletId: string;
  homepageUrl: string;
  enabled: boolean;
  assets: string[];
}

export const WalletCard: React.FC<WalletCardProps> = ({
  walletName,
  walletId,
  homepageUrl,
  enabled,
  assets,
}: WalletCardProps) => {
  const dispatch: AppDispatch = useDispatch();
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
              onChange={() => {
                dispatch(
                  actions.setUpdateWalletModalState({
                    modalWalletId: walletId,
                    modalWalletEnabled: enabled,
                  }),
                );
              }}
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
        </div>
      </div>
    </Card>
  );
};
