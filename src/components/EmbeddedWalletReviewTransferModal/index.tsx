import { Button, Icon } from "@stellar/design-system";

import { Box } from "@/components/Box";
import { CopyWithIcon } from "@/components/CopyWithIcon";
import { EmbeddedWalletAssetLogo } from "@/components/EmbeddedWalletAssetLogo";
import { EmbeddedWalletModal } from "@/components/EmbeddedWalletModal";

import { getEmbeddedWalletAssetMetadata } from "@/constants/embeddedWalletAssets";

import { shortenAccountKey } from "@/helpers/shortenAccountKey";
import { getTransferAmountDisplay } from "@/helpers/transferDisplay";

import "./styles.scss";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onConfirm: () => void;
  amount: string;
  assetCode: string;
  senderAddress: string;
  destination: string;
  isConfirmDisabled: boolean;
  isConfirmLoading: boolean;
};

export const EmbeddedWalletReviewTransferModal = ({
  isOpen,
  onClose,
  onBack,
  onConfirm,
  amount,
  assetCode,
  senderAddress,
  destination,
  isConfirmDisabled,
  isConfirmLoading,
}: Props) => {
  const displayAmount = getTransferAmountDisplay(amount, assetCode);

  const trimmedSender = senderAddress.trim();
  const trimmedDestination = destination.trim();
  const senderDisplay = trimmedSender
    ? shortenAccountKey(trimmedSender, 5, 5)
    : "Wallet address unavailable";
  const destinationDisplay = trimmedDestination
    ? shortenAccountKey(trimmedDestination, 5, 5)
    : "Wallet address unavailable";
  const xlmLogo = getEmbeddedWalletAssetMetadata("XLM")?.logo;
  const shouldShowXlmBadge = assetCode !== "XLM";

  return (
    <EmbeddedWalletModal
      visible={isOpen}
      onClose={onClose}
      title="Review transfer"
      modalAlign="center"
      titleAlign="center"
      contentAlign="left"
      content={
        <Box gap="lg" addlClassName="EmbeddedWalletReviewTransferModal">
          <div className="EmbeddedWalletReviewTransferModal__summary">
            <div className="EmbeddedWalletReviewTransferModal__assetIcon">
              <EmbeddedWalletAssetLogo assetCode={assetCode} size="lg" />
              {shouldShowXlmBadge ? (
                <span className="EmbeddedWalletReviewTransferModal__assetBadge">
                  {xlmLogo ? <img src={xlmLogo} alt="XLM icon" /> : <Icon.Coins03 />}
                </span>
              ) : null}
            </div>
            <div className="EmbeddedWalletReviewTransferModal__summaryLabel">You're sending</div>
            <div className="EmbeddedWalletReviewTransferModal__summaryAmount">{displayAmount}</div>
          </div>

          <div className="EmbeddedWalletReviewTransferModal__details">
            <div className="EmbeddedWalletReviewTransferModal__detail">
              <div className="EmbeddedWalletReviewTransferModal__detailLabel">From (sender)</div>
              <div className="EmbeddedWalletReviewTransferModal__detailRow">
                <span className="EmbeddedWalletReviewTransferModal__address">{senderDisplay}</span>
                {trimmedSender ? (
                  <div className="EmbeddedWalletReviewTransferModal__copyAction">
                    <CopyWithIcon textToCopy={trimmedSender} iconSizeRem="1.1" doneLabel="Copied">
                      <span className="EmbeddedWalletReviewTransferModal__copySpacer" />
                    </CopyWithIcon>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="EmbeddedWalletReviewTransferModal__detail">
              <div className="EmbeddedWalletReviewTransferModal__detailLabel">To (receiver)</div>
              <div className="EmbeddedWalletReviewTransferModal__detailRow">
                <span className="EmbeddedWalletReviewTransferModal__address">
                  {destinationDisplay}
                </span>
                {trimmedDestination ? (
                  <div className="EmbeddedWalletReviewTransferModal__copyAction">
                    <CopyWithIcon
                      textToCopy={trimmedDestination}
                      iconSizeRem="1.1"
                      doneLabel="Copied"
                    >
                      <span className="EmbeddedWalletReviewTransferModal__copySpacer" />
                    </CopyWithIcon>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="EmbeddedWalletReviewTransferModal__actions">
            <Button
              variant="primary"
              size="lg"
              isFullWidth
              onClick={onConfirm}
              isLoading={isConfirmLoading}
              disabled={isConfirmDisabled || isConfirmLoading}
            >
              Confirm
            </Button>
            <Button
              variant="tertiary"
              size="lg"
              isFullWidth
              onClick={onBack}
              disabled={isConfirmLoading}
            >
              Back
            </Button>
          </div>
        </Box>
      }
    />
  );
};
