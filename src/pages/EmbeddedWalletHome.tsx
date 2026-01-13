import { useEffect, useMemo, useState } from "react";

import BigNumber from "bignumber.js";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Avatar, Icon, Notification, Text } from "@stellar/design-system";

import { AssetAmount } from "@/components/AssetAmount";
import { Box } from "@/components/Box";
import { EmbeddedWalletBalanceCard } from "@/components/EmbeddedWalletBalanceCard";
import { EmbeddedWalletLayout } from "@/components/EmbeddedWalletLayout";
import { EmbeddedWalletModal } from "@/components/EmbeddedWalletModal";
import { EmbeddedWalletProfileDropdown } from "@/components/EmbeddedWalletProfileDropdown";
import { EmbeddedWalletProfileModal } from "@/components/EmbeddedWalletProfileModal";
import { EmbeddedWalletTransferModal } from "@/components/EmbeddedWalletTransferModal";

import { clearWalletInfoAction, fetchWalletProfileAction } from "@/store/ducks/walletAccount";

import {
  DEFAULT_EMBEDDED_WALLET_FALLBACK_CODE,
  getEmbeddedWalletAssetMetadata,
} from "@/constants/embeddedWalletAssets";
import { Routes } from "@/constants/settings";

import { useSendWalletPayment } from "@/apiQueries/useSendWalletPayment";
import { useSep24Verification } from "@/apiQueries/useSep24Verification";
import { useWalletBalance } from "@/apiQueries/useWalletBalance";

import { getSdpTenantName } from "@/helpers/getSdpTenantName";
import { localStorageWalletSessionToken } from "@/helpers/localStorageWalletSessionToken";

import { useRedux } from "@/hooks/useRedux";

import { ApiStellarAccountBalance } from "@/types";

import { AppDispatch } from "@/store";

import "./EmbeddedWalletHome.scss";

export const EmbeddedWalletHome = () => {
  const { walletAccount, organization } = useRedux("walletAccount", "organization");
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [isExchangeWarningOpen, setIsExchangeWarningOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const {
    contractAddress,
    credentialId,
    isVerificationPending,
    isAuthenticated,
    token,
    supportedAssets,
  } = walletAccount;
  const isWalletReady = Boolean(contractAddress);

  const {
    data: balanceData,
    isLoading: isLoadingBalance,
    refetch: refetchBalance,
  } = useWalletBalance(contractAddress, supportedAssets ?? []);

  const nonZeroWalletBalances = useMemo<ApiStellarAccountBalance[]>(() => {
    if (!balanceData) {
      return [];
    }

    return balanceData.filter((balance) => !new BigNumber(balance.balance || "0").isZero());
  }, [balanceData]);
  const assetCode = "XLM";
  const xlmBalance =
    balanceData?.find((balance) => balance.asset_code === assetCode)?.balance ?? "0";

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

  const sendPaymentMutation = useSendWalletPayment({
    contractAddress,
    credentialId,
    balance: xlmBalance,
    onSuccess: async () => {
      setDestination("");
      setAmount("");
      setIsTransferModalOpen(false);
      await refetchBalance();
    },
  });

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

  const isWithdrawDisabled = !isWalletReady || sendPaymentMutation.isPending;
  const isSendDisabled = isWithdrawDisabled || !destination.trim() || !amount.trim();

  const handleSendPayment = () => {
    if (isWithdrawDisabled) {
      return;
    }

    setIsExchangeWarningOpen(true);
  };

  const handleOpenTransferModal = () => {
    setIsExchangeWarningOpen(false);
    setIsTransferModalOpen(true);
  };

  const handleSubmitTransfer = async () => {
    if (isSendDisabled) {
      return;
    }

    try {
      await sendPaymentMutation.mutateAsync({ destination, amount });
    } catch {
      // hook handles error reporting
    }
  };

  const sendPaymentErrorNotification = sendPaymentMutation.error ? (
    <Notification variant="error" title={sendPaymentMutation.error.message} isFilled role="alert" />
  ) : null;

  const renderAssetRows = () => {
    if (isLoadingBalance) {
      return <div className="EmbeddedWalletBalanceCard__empty">Loading assets…</div>;
    }

    if (!nonZeroWalletBalances.length) {
      return <div className="EmbeddedWalletBalanceCard__empty">No assets</div>;
    }

    return nonZeroWalletBalances.map((balance) => {
      const assetCode = balance.asset_code || DEFAULT_EMBEDDED_WALLET_FALLBACK_CODE;
      const assetMetadata = getEmbeddedWalletAssetMetadata(assetCode);
      const label = assetMetadata?.label ?? assetCode;

      return (
        <Box
          key={`${assetCode}-${label}`}
          gap="sm"
          direction="row"
          justify="space-between"
          align="center"
        >
          <Box gap="sm" direction="row" align="center">
            {assetMetadata?.logo ? (
              <img
                className="EmbeddedWalletBalanceCard__assetLogo"
                src={assetMetadata.logo}
                alt={`${assetCode} logo`}
              />
            ) : (
              <Avatar userName={assetCode} size="lg" />
            )}
            <Box gap="xs">
              <div>{label}</div>
              <div className="EmbeddedWalletBalanceCard__assetCode">{assetCode}</div>
            </Box>
          </Box>
          <AssetAmount amount={balance.balance} assetCode={assetCode} />
        </Box>
      );
    });
  };

  const organizationName = useMemo(
    () => organization?.data?.name || getSdpTenantName() || "Your organization",
    [organization?.data?.name],
  );

  const receiverContact = walletAccount.receiverContact;

  return (
    <EmbeddedWalletLayout
      organizationName={organizationName}
      organizationLogo={organization?.data?.logo}
      headerRight={
        receiverContact ? (
          <EmbeddedWalletProfileDropdown
            contact={receiverContact}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onLogout={handleLogout}
          />
        ) : null
      }
    >
      {sendPaymentErrorNotification ?? <></>}

      <EmbeddedWalletBalanceCard
        title="My assets"
        tableHeaders={["Asset", "Amount"]}
        renderTableContent={renderAssetRows}
        actionLabel="Withdraw"
        onAction={handleSendPayment}
      />

      <EmbeddedWalletTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        amount={amount}
        destination={destination}
        onAmountChange={setAmount}
        onDestinationChange={setDestination}
        availableBalance={xlmBalance}
        assetCode={assetCode}
        isSubmitDisabled={isSendDisabled}
        isSubmitLoading={sendPaymentMutation.isPending}
        isWalletReady={isWalletReady}
        onSubmit={handleSubmitTransfer}
      />

      <EmbeddedWalletModal
        visible={isExchangeWarningOpen}
        onClose={() => setIsExchangeWarningOpen(false)}
        title={
          <span className="EmbeddedWalletHome__exchangeWarningTitle">
            <Icon.AlertCircle />
            <span>Exchanges aren't supported yet</span>
          </span>
        }
        content={
          <Text size="sm" as="p">
            You can send funds only to Stellar wallets.
            <br />
            Sending to an exchange may result in lost funds.
          </Text>
        }
        primaryActionLabel="Got it"
        onPrimaryAction={handleOpenTransferModal}
      />

      <EmbeddedWalletModal
        visible={isVerificationPending}
        isDismissible={false}
        title="Complete verification"
        content="Verify your account to complete your wallet setup and to get started."
        primaryActionLabel="Start verification"
        onPrimaryAction={handleSep24Verification}
        isPrimaryActionLoading={sep24VerificationMutation.isPending}
        isPrimaryActionDisabled={!isWalletReady || sep24VerificationMutation.isPending}
        contentAlign="left"
      />

      {receiverContact ? (
        <EmbeddedWalletProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          contact={receiverContact}
          contractAddress={contractAddress}
        />
      ) : null}
    </EmbeddedWalletLayout>
  );
};
