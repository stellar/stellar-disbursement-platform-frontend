import { useEffect } from "react";

import { Button, Modal, Notification } from "@stellar/design-system";

import { ErrorWithExtras } from "@/components/ErrorWithExtras";

import { useArchiveDistributionWallet } from "@/apiQueries/useArchiveDistributionWallet";

import { usePrevious } from "@/hooks/usePrevious";

interface ArchiveDistributionWalletModalProps {
  visible: boolean;
  walletId: string | null;
  walletName: string;
  onClose: () => void;
  // Fired after the account is archived so the parent can confirm it visibly.
  onArchived?: (name: string) => void;
}

// Owner-only two-step confirm for archiving a distribution (sending) account. Archiving is a
// money-permission change (the account stops accepting new disbursements), so it must never
// be one click. The backend independently refuses to archive the default account or the last
// active one; those errors render inline.
export const ArchiveDistributionWalletModal: React.FC<ArchiveDistributionWalletModalProps> = ({
  visible,
  walletId,
  walletName,
  onClose,
  onArchived,
}: ArchiveDistributionWalletModalProps) => {
  const { mutate, isPending, error, reset } = useArchiveDistributionWallet();
  const isPrevVisible = usePrevious(visible);

  useEffect(() => {
    // Reset the mutation state whenever the modal closes.
    if (isPrevVisible && !visible) {
      reset();
    }
  }, [visible, isPrevVisible, reset]);

  const handleConfirm = () => {
    if (!walletId) {
      return;
    }
    mutate(walletId, {
      onSuccess: () => {
        onArchived?.(walletName);
        onClose();
      },
    });
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <Modal.Heading>Archive “{walletName}”?</Modal.Heading>
      <Modal.Body>
        {error ? (
          <Notification variant="error" title="Error" isFilled={true}>
            <ErrorWithExtras appError={error} />
          </Notification>
        ) : null}

        <div className="Note">
          Archiving stops any new disbursements or payments from this account. Its history and
          balances stay visible, and its funds remain on the account address. This cannot be undone
          from the dashboard.
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button size="md" variant="tertiary" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          size="md"
          variant="destructive"
          onClick={handleConfirm}
          isLoading={isPending}
          disabled={!walletId}
        >
          Archive account
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
