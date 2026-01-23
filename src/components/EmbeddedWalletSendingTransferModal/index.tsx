import { Icon } from "@stellar/design-system";

import { Box } from "@/components/Box";
import { EmbeddedWalletAssetLogo } from "@/components/EmbeddedWalletAssetLogo";
import { EmbeddedWalletModal } from "@/components/EmbeddedWalletModal";

import { getEmbeddedWalletAssetMetadata } from "@/constants/embeddedWalletAssets";

import { getTransferAmountDisplay } from "@/helpers/transferDisplay";

import "./styles.scss";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
  assetCode: string;
};

export const EmbeddedWalletSendingTransferModal = ({
  isOpen,
  onClose,
  amount,
  assetCode,
}: Props) => {
  const displayAmount = getTransferAmountDisplay(amount, assetCode);
  const xlmLogo = getEmbeddedWalletAssetMetadata("XLM")?.logo;
  const shouldShowXlmBadge = assetCode !== "XLM";

  return (
    <EmbeddedWalletModal
      visible={isOpen}
      onClose={onClose}
      title={`Sending ${displayAmount}`}
      modalAlign="center"
      titleAlign="center"
      contentAlign="center"
      content={
        <Box gap="lg" addlClassName="EmbeddedWalletSendingTransferModal">
          <div className="EmbeddedWalletSendingTransferModal__summary">
            <div className="EmbeddedWalletSendingTransferModal__iconRow">
              <div className="EmbeddedWalletSendingTransferModal__assetIcon">
                <EmbeddedWalletAssetLogo assetCode={assetCode} size="lg" />
                {shouldShowXlmBadge ? (
                  <span className="EmbeddedWalletSendingTransferModal__badge">
                    {xlmLogo ? <img src={xlmLogo} alt="XLM icon" /> : <Icon.Coins03 />}
                  </span>
                ) : null}
              </div>
              <span className="EmbeddedWalletSendingTransferModal__arrow">
                <Icon.ChevronRightDouble />
              </span>
              <div className="EmbeddedWalletSendingTransferModal__icon EmbeddedWalletSendingTransferModal__icon--wallet">
                <Icon.Wallet02 />
                {xlmLogo ? (
                  <span className="EmbeddedWalletSendingTransferModal__badge">
                    <img src={xlmLogo} alt="XLM icon" />
                  </span>
                ) : (
                  <span className="EmbeddedWalletSendingTransferModal__badge">
                    <Icon.Coins03 />
                  </span>
                )}
              </div>
            </div>
          </div>
        </Box>
      }
    />
  );
};
