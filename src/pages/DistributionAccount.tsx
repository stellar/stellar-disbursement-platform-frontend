import { Heading } from "@stellar/design-system";

import { DistributionAccountCircle } from "@/components/DistributionAccountCircle";
import { DistributionAccountStellar } from "@/components/DistributionAccountStellar";
import { LoadingContent } from "@/components/LoadingContent";
import { SectionHeader } from "@/components/SectionHeader";

import { useDistributionWallets } from "@/apiQueries/useDistributionWallets";

import { accountColor } from "@/helpers/accountColor";

import { useCircleAccount } from "@/hooks/useCircleAccount";
import { useRedux } from "@/hooks/useRedux";
import { useSelectedWallet } from "@/hooks/useSelectedWallet";

export const DistributionAccount = () => {
  const { organization, userAccount } = useRedux("organization", "userAccount");
  const { isCircleAccount } = useCircleAccount();
  const { selectedWalletId } = useSelectedWallet();
  const { data: wallets } = useDistributionWallets(userAccount.isAuthenticated);

  if (organization.status === "PENDING") {
    return <LoadingContent />;
  }

  if (isCircleAccount) {
    return <DistributionAccountCircle />;
  }

  // No wallet record at all: last-resort fallback to the legacy tenant-level account. Every
  // other case below renders from GET /distribution-wallets — already scoped server-side to
  // what THIS user can see — so we never fall back to organization.distributionAccountPublicKey
  // once we have real wallet data, since that legacy field reflects the tenant's default account
  // and can belong to a completely different account than the one this user is scoped to.
  if (!wallets || wallets.length === 0) {
    return <DistributionAccountStellar />;
  }

  // Exactly one accessible wallet. This covers both a true legacy single-wallet tenant (that
  // one wallet is always the default, so this renders identically to before) and a user scoped
  // to just one of several wallets in a multi-wallet tenant (e.g. a country officer) — in both
  // cases we render that wallet's own address/balance, never the legacy org-level field.
  if (wallets.length === 1) {
    const only = wallets[0];
    return (
      <DistributionAccountStellar
        key={only.id}
        accountName={only.is_default ? undefined : only.name}
        accountAddress={only.distribution_account_address ?? undefined}
        accountColorHex={only.is_default ? undefined : accountColor(only.id)}
        showTrustlines={only.is_default}
      />
    );
  }

  const selected = wallets.find((w) => w.id === selectedWalletId);

  // A specific account is selected: scope the page to it. Asset/trustline + Bridge config is
  // tenant-level, so only show it on the default account.
  if (selected) {
    return (
      <DistributionAccountStellar
        key={selected.id}
        accountName={`${selected.name}${selected.is_default ? " (default)" : ""}`}
        accountAddress={selected.distribution_account_address ?? undefined}
        accountColorHex={accountColor(selected.id)}
        showTrustlines={selected.is_default}
      />
    );
  }

  // "All accounts": overview listing every account. Deep config lives on the default account;
  // the rest show their own address, balances, and history.
  return (
    <>
      <SectionHeader>
        <SectionHeader.Row>
          <SectionHeader.Content>
            <Heading as="h2" size="sm">
              Distribution accounts
            </Heading>
          </SectionHeader.Content>
        </SectionHeader.Row>
      </SectionHeader>

      <div className="Note" style={{ marginBottom: "1.5rem" }}>
        Showing all {wallets?.length} accounts. Pick a single account in the switcher above to
        manage it, or see each account's live balances on the dashboard.
      </div>

      {(wallets ?? [])
        .slice()
        .sort((a, b) => Number(b.is_default) - Number(a.is_default))
        .map((w) => (
          <DistributionAccountStellar
            key={w.id}
            accountName={`${w.name}${w.is_default ? " (default)" : ""}`}
            accountAddress={w.distribution_account_address ?? undefined}
            accountColorHex={accountColor(w.id)}
            showTrustlines={w.is_default}
          />
        ))}
    </>
  );
};
