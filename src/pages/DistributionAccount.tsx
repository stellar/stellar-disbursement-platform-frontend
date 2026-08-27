import { Heading, Notification } from "@stellar/design-system";

import { DistributionAccountCircle } from "@/components/DistributionAccountCircle";
import { DistributionAccountStellar } from "@/components/DistributionAccountStellar";
import { ErrorWithExtras } from "@/components/ErrorWithExtras";
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
  const {
    data: wallets,
    isPending: isWalletsPending,
    isError: isWalletsError,
    error: walletsError,
  } = useDistributionWallets(userAccount.isAuthenticated);

  if (organization.status === "PENDING") {
    return <LoadingContent />;
  }

  if (isCircleAccount) {
    return <DistributionAccountCircle />;
  }

  // `wallets` is undefined while the fetch is in flight and after it fails, so both states have
  // to be handled here: falling through to the legacy fallback below would show this user the
  // tenant's default account — its address, balance and history — when they may only be entitled
  // to a completely different one. isPending rather than isLoading, because between retry attempts
  // react-query reports isLoading false with data still undefined.
  if (isWalletsPending) {
    return <LoadingContent />;
  }

  if (isWalletsError) {
    return (
      <Notification variant="error" title="Error" isFilled={true}>
        <ErrorWithExtras appError={walletsError} />
      </Notification>
    );
  }

  // No wallet record at all (a SUCCESSFUL but empty response): last-resort fallback to the legacy
  // tenant-level account. Every other case below renders from GET /distribution-wallets — already
  // scoped server-side to what THIS user can see — so we never fall back to
  // organization.distributionAccountPublicKey once we have real wallet data, since that legacy
  // field reflects the tenant's default account and can belong to a completely different account
  // than the one this user is scoped to.
  if (wallets.length === 0) {
    return <DistributionAccountStellar />;
  }

  // Exactly one accessible wallet. This covers both a true legacy single-wallet tenant (that
  // one wallet is always the default, so this renders identically to before) and a user scoped
  // to just one of several wallets in a multi-wallet tenant (e.g. a country officer) — in both
  // cases we render that wallet's own address/balance, never the legacy org-level field.
  // Trustlines render here regardless of is_default: a trustline is on-chain state of THIS
  // account, and ActiveWalletBar pins the selection to the single accessible wallet, so the
  // X-Wallet-Id useAssetsAdd sends names the very account shown here.
  if (wallets.length === 1) {
    const only = wallets[0];
    return (
      <DistributionAccountStellar
        key={only.id}
        accountName={only.is_default ? undefined : only.name}
        accountAddress={only.distribution_account_address ?? null}
        accountColorHex={only.is_default ? undefined : accountColor(only.id)}
        // Bridge is tenant-level config, so it belongs on the default account's card only —
        // unlike trustlines, which are this account's own on-chain state.
        showBridgeIntegration={only.is_default}
      />
    );
  }

  const selected = wallets.find((w) => w.id === selectedWalletId);

  // A specific account is selected: scope the page to it, trustline panel included. Trustlines
  // are per-account on-chain state, not tenant config: hiding the panel on secondary accounts
  // left them with no route to a trustline after creation, since adding an asset is the only
  // self-heal for an asset nothing trusts. `selected.id` IS the app-wide selection, so the
  // X-Wallet-Id useAssetsAdd sends targets exactly the account rendered here.
  if (selected) {
    return (
      <DistributionAccountStellar
        key={selected.id}
        accountName={`${selected.name}${selected.is_default ? " (default)" : ""}`}
        accountAddress={selected.distribution_account_address ?? null}
        accountColorHex={accountColor(selected.id)}
        showBridgeIntegration={selected.is_default}
      />
    );
  }

  // "All accounts": overview listing every account. The rest show their own address, balances,
  // and history.
  //
  // The trustline panel stays gated on is_default HERE only, and not as a permissions rule: in
  // this aggregate view there is no selected account, so useAssetsAdd sends no X-Wallet-Id and
  // the backend falls back to the tenant default. The default account's card is therefore the
  // one card whose panel acts on the account it is attached to; a panel on any other card would
  // silently add the trustline to the default account instead. To manage a secondary account's
  // trustlines, pick it in the switcher — the branch above then renders the panel for it.
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
            accountAddress={w.distribution_account_address ?? null}
            accountColorHex={accountColor(w.id)}
            showTrustlines={w.is_default}
            showBridgeIntegration={w.is_default}
          />
        ))}
    </>
  );
};
