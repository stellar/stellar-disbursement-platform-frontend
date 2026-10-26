import { useState } from "react";

import { Button, Card, Notification } from "@stellar/design-system";

import { AddDistributionWalletModal } from "@/components/AddDistributionWalletModal";
import { ArchiveDistributionWalletModal } from "@/components/ArchiveDistributionWalletModal";
import { AssetAmount } from "@/components/AssetAmount";
import { Box } from "@/components/Box";
import { DistributionAccountLabel } from "@/components/DistributionAccountLabel";
import { InfoTooltip } from "@/components/InfoTooltip";
import { ManageWalletAccessModal } from "@/components/ManageWalletAccessModal";
import { ShowForRoles } from "@/components/ShowForRoles";

import { useDistributionWalletBalance } from "@/apiQueries/useDistributionWalletBalance";
import { useDistributionWallets } from "@/apiQueries/useDistributionWallets";

import { parseAssetKey } from "@/helpers/parseAssetKey";

import { useIsUserRoleAccepted } from "@/hooks/useIsUserRoleAccepted";
import { useRedux } from "@/hooks/useRedux";
import { useSelectedWallet } from "@/hooks/useSelectedWallet";

import "./styles.scss";

// One row = one distribution wallet + its live on-chain balances.
// Owners get a per-account "Manage access" action.
const WalletBalanceRow = ({
  walletId,
  name,
  isDefault,
  canArchive,
  isAuthenticated,
  onManageAccess,
  onArchive,
}: {
  walletId: string;
  name: string;
  isDefault: boolean;
  canArchive: boolean;
  isAuthenticated: boolean;
  onManageAccess: (walletId: string, name: string) => void;
  onArchive: (walletId: string, name: string) => void;
}) => {
  const { data, isLoading } = useDistributionWalletBalance(isAuthenticated, walletId);
  const balances = Object.entries(data?.balances ?? {});

  return (
    <div className="WalletBalancesOverview__row">
      <div className="WalletBalancesOverview__name">
        <DistributionAccountLabel
          wallet={{ id: walletId, name, is_default: isDefault }}
          defaultMarker="badge"
        />
      </div>
      <Box gap="lg" direction="row" align="center">
        {isLoading ? (
          <span className="Note">…</span>
        ) : balances.length ? (
          <>
            {balances.map(([assetKey, amount]) => (
              <AssetAmount
                key={assetKey}
                amount={amount || "0"}
                assetCode={parseAssetKey(assetKey).code}
              />
            ))}
          </>
        ) : (
          <span className="Note">—</span>
        )}
        <ShowForRoles acceptedRoles={["owner"]}>
          <Button size="sm" variant="tertiary" onClick={() => onManageAccess(walletId, name)}>
            Manage access
          </Button>
          {/* The default account can't be archived (promote another first), so no button. */}
          {canArchive && !isDefault ? (
            <Button size="sm" variant="tertiary" onClick={() => onArchive(walletId, name)}>
              Archive
            </Button>
          ) : null}
        </ShowForRoles>
      </Box>
    </div>
  );
};

// All distribution wallet balances on the home screen.
// Hidden for single-account non-owners.
export const WalletBalancesOverview = () => {
  const { userAccount } = useRedux("userAccount");
  const { data: wallets } = useDistributionWallets(userAccount.isAuthenticated);
  const { isRoleAccepted: isOwner } = useIsUserRoleAccepted(["owner"]);
  const { setSelectedWalletId } = useSelectedWallet();

  const [showAdd, setShowAdd] = useState(false);
  const [manageWallet, setManageWallet] = useState<{ id: string; name: string } | null>(null);
  const [archiveWallet, setArchiveWallet] = useState<{ id: string; name: string } | null>(null);
  const [createdName, setCreatedName] = useState<string | null>(null);
  const [archivedName, setArchivedName] = useState<string | null>(null);

  if (!wallets || wallets.length === 0) {
    return null;
  }

  if (wallets.length < 2 && !isOwner) {
    return null;
  }

  const newlyCreated = wallets.find((w) => w.name === createdName);
  const archiveWalletAddress = wallets.find(
    (w) => w.id === archiveWallet?.id,
  )?.distribution_account_address;

  return (
    <>
      {archivedName ? (
        <Notification variant="success" title={`Account "${archivedName}" archived`} isFilled>
          It no longer accepts new disbursements or payments, and is gone from the account switcher
          and the list below. Past disbursements and payments it funded still show its name.
        </Notification>
      ) : null}

      {createdName ? (
        <Notification
          variant="success"
          title={`Account "${createdName}" created and funded`}
          isFilled
        >
          It's ready to send from.{" "}
          {newlyCreated ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setSelectedWalletId(newlyCreated.id);
                setCreatedName(null);
              }}
            >
              Switch to it
            </Button>
          ) : null}
        </Notification>
      ) : null}

      <Card>
        <div className="CardStack__title">
          <InfoTooltip infoText="Live on-chain balance of each of your distribution (sending) accounts — no need to switch the picker.">
            Distribution accounts
          </InfoTooltip>
          <ShowForRoles acceptedRoles={["owner"]}>
            <Button size="sm" variant="secondary" onClick={() => setShowAdd(true)}>
              Add account
            </Button>
          </ShowForRoles>
        </div>
        <div className="WalletBalancesOverview">
          <div className="WalletBalancesOverview__rows">
            {wallets.map((wallet) => (
              <WalletBalanceRow
                key={wallet.id}
                walletId={wallet.id}
                name={wallet.name}
                isDefault={wallet.is_default}
                canArchive={wallets.length >= 2}
                isAuthenticated={userAccount.isAuthenticated}
                onManageAccess={(id, name) => setManageWallet({ id, name })}
                onArchive={(id, name) => setArchiveWallet({ id, name })}
              />
            ))}
          </div>
        </div>
      </Card>

      <ShowForRoles acceptedRoles={["owner"]}>
        <AddDistributionWalletModal
          visible={showAdd}
          onClose={() => setShowAdd(false)}
          onCreated={(name) => setCreatedName(name)}
        />
        <ManageWalletAccessModal
          visible={Boolean(manageWallet)}
          walletId={manageWallet?.id ?? null}
          walletName={manageWallet?.name ?? ""}
          onClose={() => setManageWallet(null)}
        />
        <ArchiveDistributionWalletModal
          visible={Boolean(archiveWallet)}
          walletId={archiveWallet?.id ?? null}
          walletName={archiveWallet?.name ?? ""}
          walletAddress={archiveWalletAddress}
          onClose={() => setArchiveWallet(null)}
          onArchived={(name) => setArchivedName(name)}
        />
      </ShowForRoles>
    </>
  );
};
