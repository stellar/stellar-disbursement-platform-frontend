import { useEffect, useState } from "react";

import { Button, Input, Modal, Notification } from "@stellar/design-system";

import { ErrorWithExtras } from "@/components/ErrorWithExtras";
import { InfoTooltip } from "@/components/InfoTooltip";

import { useCreateDistributionWallet } from "@/apiQueries/useCreateDistributionWallet";

import { usePrevious } from "@/hooks/usePrevious";

interface AddDistributionWalletModalProps {
  visible: boolean;
  onClose: () => void;
}

// Owner-only "Add account" flow: names a new distribution (sending) account. The backend
// provisions and funds a fresh, separately-encrypted Stellar account.
export const AddDistributionWalletModal: React.FC<AddDistributionWalletModalProps> = ({
  visible,
  onClose,
}: AddDistributionWalletModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { mutate, isPending, error, reset } = useCreateDistributionWallet();
  const isPrevVisible = usePrevious(visible);

  useEffect(() => {
    // Reset the form + mutation state whenever the modal closes.
    if (isPrevVisible && !visible) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName("");
       
      setDescription("");
      reset();
    }
  }, [visible, isPrevVisible, reset]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }
    mutate(
      { name: name.trim(), description: description.trim() || undefined },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <Modal.Heading>
        <InfoTooltip
          infoText="Creates a new distribution (sending) account with its own on-chain address and separately-encrypted keys. It is funded automatically and ready to send."
          placement="bottom"
        >
          Add distribution account
        </InfoTooltip>
      </Modal.Heading>
      <form onSubmit={handleSubmit} onReset={onClose}>
        <Modal.Body>
          {error ? (
            <Notification variant="error" title="Error" isFilled={true}>
              <ErrorWithExtras appError={error} />
            </Notification>
          ) : null}

          <Input
            fieldSize="sm"
            id="wallet-name"
            name="wallet-name"
            type="text"
            label="Account name"
            placeholder="e.g. Haiti"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            fieldSize="sm"
            id="wallet-description"
            name="wallet-description"
            type="text"
            label="Description (optional)"
            placeholder="e.g. Haiti country office account"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button size="md" variant="tertiary" type="reset" isLoading={isPending}>
            Cancel
          </Button>
          <Button
            size="md"
            variant="primary"
            type="submit"
            disabled={!name.trim()}
            isLoading={isPending}
          >
            Create account
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};
