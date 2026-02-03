import { Button, Heading, Icon } from "@stellar/design-system";

import { CopyWithIcon } from "@/components/CopyWithIcon";
import { EmbeddedWalletModal } from "@/components/EmbeddedWalletModal";

import { STELLAR_EXPERT_URL } from "@/constants/envVariables";

import { shortenAccountKey } from "@/helpers/shortenAccountKey";

import { EmbeddedWalletReceiverContact } from "@/types";

import "./styles.scss";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  contact: EmbeddedWalletReceiverContact;
  contractAddress: string;
};

export const EmbeddedWalletProfileModal = ({
  isOpen,
  onClose,
  contact,
  contractAddress,
}: Props) => {
  const formattedAddress = contractAddress
    ? shortenAccountKey(contractAddress, 5, 5)
    : "Wallet address unavailable";

  const handleViewOnExplorer = () => {
    if (!contractAddress) {
      return;
    }

    const url = `${STELLAR_EXPERT_URL}/contract/${contractAddress}`;
    window.open(url, "_blank", "noopener");
  };

  return (
    <EmbeddedWalletModal
      visible={isOpen}
      onClose={onClose}
      title={
        <div>
          <Heading as="h2" size="sm" className="EmbeddedWalletProfileModal__title">
            My profile
          </Heading>
          <div className="EmbeddedWalletProfileModal__contact">{contact.value}</div>
        </div>
      }
      content={
        <div className="EmbeddedWalletProfileModal__content">
          <div className="EmbeddedWalletProfileModal__field">
            <div className="EmbeddedWalletProfileModal__label">Stellar wallet address</div>
            <div className="EmbeddedWalletProfileModal__addressRow">
              <span className="EmbeddedWalletProfileModal__copyText">{formattedAddress}</span>
              {contractAddress ? (
                <div className="EmbeddedWalletProfileModal__copyAction">
                  <CopyWithIcon textToCopy={contractAddress} iconSizeRem="1.25" doneLabel="Copied">
                    <span />
                  </CopyWithIcon>
                </div>
              ) : null}
            </div>
          </div>

          <div className="EmbeddedWalletProfileModal__actions">
            <Button variant="primary" size="lg" isFullWidth onClick={onClose}>
              Close
            </Button>
            <Button
              variant="tertiary"
              size="lg"
              isFullWidth
              icon={<Icon.LinkExternal01 />}
              iconPosition="right"
              onClick={handleViewOnExplorer}
              disabled={!contractAddress}
            >
              View on Stellar.expert
            </Button>
          </div>
        </div>
      }
      contentAlign="left"
    />
  );
};
