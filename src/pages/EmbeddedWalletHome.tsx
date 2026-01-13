import { useEffect, useMemo, useState } from "react";

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Button, Icon, Text } from "@stellar/design-system";

import { Box } from "@/components/Box";
import { EmbeddedWalletDismissibleNotice } from "@/components/EmbeddedWalletDismissibleNotice";
import { EmbeddedWalletLayout } from "@/components/EmbeddedWalletLayout";
import { EmbeddedWalletModal } from "@/components/EmbeddedWalletModal";
import { useEmbeddedWalletNotice } from "@/components/EmbeddedWalletNoticesProvider";
import { EmbeddedWalletProfileDropdown } from "@/components/EmbeddedWalletProfileDropdown";
import { EmbeddedWalletProfileModal } from "@/components/EmbeddedWalletProfileModal";
import { EmbeddedWalletTransferModal } from "@/components/EmbeddedWalletTransferModal";

import { clearWalletInfoAction, fetchWalletProfileAction } from "@/store/ducks/walletAccount";

import { Routes } from "@/constants/settings";

import { useSendWalletPayment } from "@/apiQueries/useSendWalletPayment";
import { useSep24Verification } from "@/apiQueries/useSep24Verification";
import { useWalletBalance } from "@/apiQueries/useWalletBalance";

import { getSdpTenantName } from "@/helpers/getSdpTenantName";
import { localStorageWalletNotices } from "@/helpers/localStorageWalletNotices";
import { localStorageWalletSessionToken } from "@/helpers/localStorageWalletSessionToken";

import { useRedux } from "@/hooks/useRedux";

import { AppDispatch } from "@/store";

import "./EmbeddedWalletHome.scss";

const VERIFIED_NOTICE_ID = "embedded-wallet-verified";

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
    profileStatus,
    pendingAsset,
  } = walletAccount;
  const isWalletReady = Boolean(contractAddress);

  const {
    data: balanceData,
    isLoading: isLoadingBalance,
    refetch: refetchBalance,
  } = useWalletBalance(contractAddress);
  const walletBalance = balanceData?.balance || "0";
  const assetCode = "XLM";

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

  useEffect(() => {
    if (isVerificationPending) {
      localStorageWalletNotices.reset(credentialId);
    }
  }, [credentialId, isVerificationPending]);

  const sendPaymentMutation = useSendWalletPayment({
    contractAddress,
    credentialId,
    balance: balanceData?.balance ?? "0",
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
        assetCode: pendingAsset?.code,
        contractAddress,
        credentialId,
      });
    } catch {
      // hook handles error reporting
    } finally {
      await dispatch(fetchWalletProfileAction());
    }
  };

  const isVerified = profileStatus === "SUCCESS" && !isVerificationPending;

  const verifiedNotice = useMemo(() => {
    if (!isVerified) {
      return null;
    }

    return (
      <EmbeddedWalletDismissibleNotice
        noticeId={VERIFIED_NOTICE_ID}
        variant="success"
        title="You're all set!"
        icon={<Icon.InfoCircle />}
        isFilled
        role="status"
        credentialId={credentialId}
        noticeKey="verifiedDismissed"
      >
        Now you can receive crypto or withdraw to a crypto wallet.
      </EmbeddedWalletDismissibleNotice>
    );
  }, [credentialId, isVerified]);

  useEmbeddedWalletNotice(VERIFIED_NOTICE_ID, verifiedNotice);

  const isWithdrawDisabled = !isWalletReady || sendPaymentMutation.isPending;
  const isSendDisabled =
    !isWalletReady || sendPaymentMutation.isPending || !destination.trim() || !amount.trim();

  const handleSendPayment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
      <Box gap="md">
        {isLoadingBalance ? (
          <strong>Loading...</strong>
        ) : (
          <strong>
            {walletBalance} {assetCode}
          </strong>
        )}

        <p>{contractAddress}</p>
        <form onSubmit={handleSendPayment}>
          <Box gap="sm">
            <Button
              variant="primary"
              type="submit"
              size="lg"
              isLoading={sendPaymentMutation.isPending}
              disabled={isWithdrawDisabled}
            >
              Withdraw
            </Button>
          </Box>
        </form>
      </Box>

      <EmbeddedWalletTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        amount={amount}
        destination={destination}
        onAmountChange={setAmount}
        onDestinationChange={setDestination}
        availableBalance={walletBalance}
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
