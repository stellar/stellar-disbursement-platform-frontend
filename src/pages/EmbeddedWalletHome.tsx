import BigNumber from "bignumber.js";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { useSep24Verification } from "@/apiQueries/useSep24Verification";
import { useWalletBalance } from "@/apiQueries/useWalletBalance";
import { AssetAmount } from "@/components/AssetAmount";
import { Box } from "@/components/Box";
import { EmbeddedWalletCard } from "@/components/EmbeddedWalletCard";
import { EmbeddedWalletLayout } from "@/components/EmbeddedWalletLayout";
import { EmbeddedWalletModal } from "@/components/EmbeddedWalletModal";
import { EmbeddedWalletProfileDropdown } from "@/components/EmbeddedWalletProfileDropdown";
import { EmbeddedWalletProfileModal } from "@/components/EmbeddedWalletProfileModal";
import {
  DEFAULT_EMBEDDED_WALLET_ASSET_CODE,
  getEmbeddedWalletAssetMetadata,
} from "@/constants/embeddedWalletAssets";
import { Routes } from "@/constants/settings";
import { getSdpTenantName } from "@/helpers/getSdpTenantName";
import { localStorageWalletSessionToken } from "@/helpers/localStorageWalletSessionToken";
import { useRedux } from "@/hooks/useRedux";
import { AppDispatch } from "@/store";
import { clearWalletInfoAction, fetchWalletProfileAction } from "@/store/ducks/walletAccount";
import { ApiStellarAccountBalance } from "@/types";

export const EmbeddedWalletHome = () => {
  const { walletAccount, organization } = useRedux("walletAccount", "organization");
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { contractAddress, isVerificationPending, isAuthenticated, token, supportedAssets } =
    walletAccount;
  const isWalletReady = Boolean(contractAddress);

  const { data: balanceData, isLoading: isLoadingBalance } = useWalletBalance(
    contractAddress,
    supportedAssets ?? [],
  );

  const nonZeroWalletBalances = useMemo<ApiStellarAccountBalance[]>(() => {
    if (!balanceData) {
      return [];
    }

    return balanceData.filter((balance) => !new BigNumber(balance.balance || "0").isZero());
  }, [balanceData]);

  const handleLogout = () => {
    localStorageWalletSessionToken.remove();
    dispatch(clearWalletInfoAction());
    navigate(Routes.WALLET, { replace: true });
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      dispatch(fetchWalletProfileAction());
    }
  }, [dispatch, isAuthenticated, token]);

  const sep24VerificationMutation = useSep24Verification();

  const handleSep24Verification = async () => {
    if (!isWalletReady) {
      return;
    }

    try {
      await sep24VerificationMutation.mutateAsync({
        assetCode: walletAccount.pendingAsset?.code,
        contractAddress,
        credentialId: walletAccount.credentialId,
      });
    } catch {
      // hook handles error reporting
    } finally {
      await dispatch(fetchWalletProfileAction());
    }
  };

  const renderAssetRows = () => {
    if (isLoadingBalance) {
      return <div className="EmbeddedWalletCard__empty">Loading assets…</div>;
    }

    if (!nonZeroWalletBalances.length) {
      return <div className="EmbeddedWalletCard__empty">No assets</div>;
    }

    return nonZeroWalletBalances.map((balance) => {
      const assetCode = balance.asset_code || DEFAULT_EMBEDDED_WALLET_ASSET_CODE;
      const { logo, label } = getEmbeddedWalletAssetMetadata(assetCode);

      return (
        <div className="EmbeddedWalletCard__row" key={`${assetCode}-${label}`}>
          <div className="EmbeddedWalletCard__asset">
            <img
              className="EmbeddedWalletCard__assetLogo"
              src={logo}
              alt={`${assetCode} logo`}
              width={32}
              height={32}
            />
            <div className="EmbeddedWalletCard__assetText">
              <div>{label}</div>
              <div className="EmbeddedWalletCard__assetCode">{assetCode}</div>
            </div>
          </div>
          <AssetAmount amount={balance.balance} assetCode={assetCode} />
        </div>
      );
    });
  };

  const organizationName = useMemo(
    () => organization?.data?.name || getSdpTenantName() || "Your organization",
    [organization?.data?.name],
  );

  const receiverContact = walletAccount.receiverContact;
  if (!receiverContact) {
    return null;
  }

  return (
    <EmbeddedWalletLayout
      organizationName={organizationName}
      organizationLogo={organization?.data?.logo}
      headerRight={
        <EmbeddedWalletProfileDropdown
          contact={receiverContact}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onLogout={handleLogout}
        />
      }
    >
      <Box gap="md">
        <EmbeddedWalletCard
          title="My assets"
          tableHeaders={["Asset", "Amount"]}
          renderTableContent={renderAssetRows}
          actionLabel="Withdraw"
          onAction={() => {}}
        />

        <EmbeddedWalletCard
          title="Recent transactions"
          tableHeaders={["Type", "Amount"]}
          renderTableContent={() => (
            <div className="EmbeddedWalletCard__empty">No recent transactions</div>
          )}
        />
      </Box>

      <EmbeddedWalletModal
        visible={isVerificationPending}
        isDismissible={false}
        title="Complete verification"
        description="Verify your account to complete your wallet setup and to get started."
        primaryActionLabel="Start verification"
        onPrimaryAction={handleSep24Verification}
        isPrimaryActionLoading={sep24VerificationMutation.isPending}
        isPrimaryActionDisabled={!isWalletReady || sep24VerificationMutation.isPending}
        contentAlign="left"
      />

      <EmbeddedWalletProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        contact={receiverContact}
        contractAddress={contractAddress}
      />
    </EmbeddedWalletLayout>
  );
};
