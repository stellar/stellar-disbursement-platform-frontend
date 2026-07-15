import { useDistributionWallets } from "@/apiQueries/useDistributionWallets";

import { accountColor } from "@/helpers/accountColor";

import { useRedux } from "@/hooks/useRedux";
import { useSelectedWallet } from "@/hooks/useSelectedWallet";

// The Disbursements/Payments tables only need a source-account column when rows can mix
// accounts — a multi-account tenant viewing "All accounts". Under a concrete selection (or a
// single-account tenant) the column would repeat the account bar.
export const useShowSourceAccountColumn = (): boolean => {
  const { userAccount } = useRedux("userAccount");
  const { selectedWalletId } = useSelectedWallet();
  const { data: wallets } = useDistributionWallets(userAccount.isAuthenticated);
  return (wallets?.length ?? 0) >= 2 && !selectedWalletId;
};

// Dot + name of the distribution (sending) account a disbursement/payment left from.
// Rows predating the multi-wallet migration carry no source_wallet_id; those were funded by
// the tenant default account, so an EMPTY id falls back to the default. An id we can't
// resolve (e.g. a wallet outside this user's read scope) renders "-" rather than mislabeling.
export const SourceAccount = ({ sourceWalletId }: { sourceWalletId?: string }) => {
  const { userAccount } = useRedux("userAccount");
  const { data: wallets } = useDistributionWallets(userAccount.isAuthenticated);

  if (!wallets?.length) {
    return <>-</>;
  }

  const wallet = sourceWalletId
    ? wallets.find((w) => w.id === sourceWalletId)
    : wallets.find((w) => w.is_default);

  if (!wallet) {
    return <>-</>;
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
      <span
        style={{
          width: "0.625rem",
          height: "0.625rem",
          borderRadius: "50%",
          flexShrink: 0,
          backgroundColor: accountColor(wallet.id),
        }}
        aria-hidden="true"
      />
      {wallet.name}
    </span>
  );
};

// A labeled "Source account" row for the detail pages. Renders nothing for single-account
// tenants, where the source is unambiguous.
export const SourceAccountDetailItem = ({
  sourceWalletId,
  variant = "statCard",
}: {
  sourceWalletId?: string;
  variant?: "statCard" | "paymentInfo";
}) => {
  const { userAccount } = useRedux("userAccount");
  const { data: wallets } = useDistributionWallets(userAccount.isAuthenticated);

  if ((wallets?.length ?? 0) < 2) {
    return null;
  }

  if (variant === "paymentInfo") {
    return (
      <div className="PaymentDetails__info">
        <label className="Label">Source account</label>
        <div>
          <SourceAccount sourceWalletId={sourceWalletId} />
        </div>
      </div>
    );
  }

  return (
    <div className="StatCards__card__item">
      <label className="StatCards__card__item__label">Source account</label>
      <div className="StatCards__card__item__value">
        <SourceAccount sourceWalletId={sourceWalletId} />
      </div>
    </div>
  );
};
