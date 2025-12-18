import { Button, Icon, Modal, Select } from "@stellar/design-system";
import { useEffect, useState } from "react";

import { CopyWithIcon } from "@/components/CopyWithIcon";
import { STELLAR_EXPERT_URL } from "@/constants/envVariables";
import { shortenAccountKey } from "@/helpers/shortenAccountKey";
import { EmbeddedWalletReceiverContact } from "@/types";

import "./styles.scss";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  contact: EmbeddedWalletReceiverContact;
  contractAddress: string;
  currencies: string[];
};

export const EmbeddedWalletProfileModal = ({
  isOpen,
  onClose,
  contact,
  contractAddress,
  currencies,
}: Props) => {
  const defaultCurrency = currencies[0];
  const [currency, setCurrency] = useState(defaultCurrency);

  useEffect(() => {
    setCurrency(defaultCurrency);
  }, [defaultCurrency]);

  const formattedAddress = contractAddress
    ? shortenAccountKey(contractAddress, 5, 5)
    : "Wallet address unavailable";

  const handleViewOnExplorer = () => {
    if (!contractAddress) {
      return;
    }

    const url = `${STELLAR_EXPERT_URL}/account/${contractAddress}`;
    window.open(url, "_blank", "noopener");
  };

  return (
    <Modal visible={isOpen} onClose={onClose}>
      <Modal.Body>
        <div className="EmbeddedWalletProfileModal__content">
          <div className="EmbeddedWalletProfileModal__title">My profile</div>
          <div className="EmbeddedWalletProfileModal__contact">{contact.value}</div>

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

          <div className="EmbeddedWalletProfileModal__field">
            <div className="EmbeddedWalletProfileModal__label">Currency</div>
            <Select
              id="embedded-wallet-currency"
              fieldSize="lg"
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </Select>
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
      </Modal.Body>
    </Modal>
  );
};
