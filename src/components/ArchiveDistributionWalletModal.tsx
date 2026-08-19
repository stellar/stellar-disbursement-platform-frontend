import { useEffect } from "react";

import { Button, Modal, Notification } from "@stellar/design-system";

import { CopyWithIcon } from "@/components/CopyWithIcon";
import { ErrorWithExtras } from "@/components/ErrorWithExtras";

import { useArchiveDistributionWallet } from "@/apiQueries/useArchiveDistributionWallet";

import { shortenAccountKey } from "@/helpers/shortenAccountKey";

import { usePrevious } from "@/hooks/usePrevious";

interface ArchiveDistributionWalletModalProps {
  visible: boolean;
  walletId: string | null;
  walletName: string;
  // The on-chain address holding the funds. Shown here because this is the last place the
  // dashboard can show it — an archived account drops out of every account list.
  walletAddress?: string | null;
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
  walletAddress,
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
          Archiving stops any new disbursements or payments from this account, and removes it from
          the account switcher and the balances card — its balance is no longer shown here. Past
          disbursements and payments it funded keep showing its name. Its funds are untouched at the
          account address. This cannot be undone from the dashboard.
        </div>

        {walletAddress ? (
          <div className="Note Note--small">
            Account address{" "}
            <CopyWithIcon textToCopy={walletAddress} iconSizeRem="0.875" doneLabel="Copied">
              <span>{shortenAccountKey(walletAddress, 5, 5)}</span>
            </CopyWithIcon>
          </div>
        ) : null}
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
