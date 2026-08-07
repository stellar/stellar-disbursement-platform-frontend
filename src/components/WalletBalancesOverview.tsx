import { useState } from "react";

import { Button, Card, Notification } from "@stellar/design-system";

import { AddDistributionWalletModal } from "@/components/AddDistributionWalletModal";
import { ArchiveDistributionWalletModal } from "@/components/ArchiveDistributionWalletModal";
import { AssetAmount } from "@/components/AssetAmount";
import { InfoTooltip } from "@/components/InfoTooltip";
import { ManageWalletAccessModal } from "@/components/ManageWalletAccessModal";
import { ShowForRoles } from "@/components/ShowForRoles";

import { useDistributionWalletBalance } from "@/apiQueries/useDistributionWalletBalance";
import { useDistributionWallets } from "@/apiQueries/useDistributionWallets";

import { useIsUserRoleAccepted } from "@/hooks/useIsUserRoleAccepted";
import { useRedux } from "@/hooks/useRedux";
import { useSelectedWallet } from "@/hooks/useSelectedWallet";

// One row = one distribution wallet + its live on-chain balances. Each row owns its own
// balance query (keyed per wallet), so the overview shows every wallet at a glance without
// touching the picker. Owners also get a per-account "Manage access" action.
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
    <div
      className="WalletBalancesOverview__row"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "1rem",
        padding: "0.5rem 0",
        borderBottom: "1px solid var(--sds-clr-gray-06)",
      }}
    >
      <div style={{ fontWeight: 500 }}>
        {name}
        {isDefault ? " (default)" : ""}
      </div>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {isLoading ? (
            <span className="Note">…</span>
          ) : balances.length ? (
            balances.map(([assetKey, amount]) => (
              <AssetAmount
                key={assetKey}
                amount={amount || "0"}
                assetCode={assetKey.split(":")[0]}
              />
            ))
          ) : (
            <span className="Note">—</span>
          )}
        </div>
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
      </div>
    </div>
  );
};

// All distribution wallet balances on the home screen — see every wallet's balance without
// switching the picker. For Owners this doubles as the account-management
// surface (add an account, manage per-account access). Hidden for single-account non-owners.
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

  // Non-owners only need this card when there's more than one account to compare. Owners always
  // see it so they can add the second account and manage access.
  if (wallets.length < 2 && !isOwner) {
    return null;
  }

  const newlyCreated = wallets.find((w) => w.name === createdName);

  return (
    <>
      {archivedName ? (
        <Notification variant="success" title={`Account "${archivedName}" archived`} isFilled>
          It no longer accepts new disbursements; its history and balances remain visible.
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div className="StatCards__card__title">
            <InfoTooltip infoText="Live on-chain balance of each of your distribution (sending) accounts — no need to switch the picker.">
              Distribution accounts
            </InfoTooltip>
          </div>
          <ShowForRoles acceptedRoles={["owner"]}>
            <Button size="sm" variant="secondary" onClick={() => setShowAdd(true)}>
              Add account
            </Button>
          </ShowForRoles>
        </div>
        <div className="WalletBalancesOverview" style={{ marginTop: "0.75rem" }}>
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
          onClose={() => setArchiveWallet(null)}
          onArchived={(name) => setArchivedName(name)}
        />
      </ShowForRoles>
    </>
  );
};
