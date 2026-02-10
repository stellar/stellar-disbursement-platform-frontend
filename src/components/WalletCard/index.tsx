import React from "react";

import { useNavigate } from "react-router-dom";

import { Button, Card, Icon, Toggle } from "@stellar/design-system";

import { Box } from "@/components/Box";
import { Title } from "@/components/Title";

import { Routes } from "@/constants/settings";

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
  const navigate = useNavigate();
  const walletNameLetter = walletName?.charAt(0).toUpperCase() || "W";

  return (
    <Card noPadding>
      <div className="WalletCard">
        <div className="WalletCard__title">
          <div className="WalletCard__item">
            <div>
              <div className="WalletCard__item">
                <div className="WalletCard__icon">{walletNameLetter}</div>

                <Title size="md">{walletName}</Title>

                <a
                  className="WalletCard__ExternalLink"
                  href={homepageUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <Icon.LinkExternal01 className="ExternalLinkIcon" />
                </a>
              </div>
            </div>

            <Toggle
              id={walletId}
              checked={enabled}
              onChange={onChange}
              disabled={!editable}
              fieldSize="md"
            />
          </div>
        </div>

        <div className="WalletCard__walletData">
          <Box gap="md" direction="row" align="center" justify="space-between">
            <div className="WalletCard--flexCols">
              <label className="WalletCard__item__label">Supported:</label>
              <div className="WalletCard__item__value">{assets?.join(", ")}</div>
            </div>

            <Button
              size="sm"
              variant="tertiary"
              icon={<Icon.Edit01 />}
              onClick={() => {
                navigate(`${Routes.WALLET_PROVIDERS_NEW}/${walletId}`);
              }}
            ></Button>
          </Box>
          <div className="WalletCard--flexCols">
            <label className="WalletCard__item__label">User Managed:</label>
            <div className="WalletCard__item__value">{userManaged ? "Yes" : "No"}</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
