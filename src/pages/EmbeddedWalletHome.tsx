import { Button, Input, Notification } from "@stellar/design-system";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { useSendWalletPayment } from "@/apiQueries/useSendWalletPayment";
import { useSep24Verification } from "@/apiQueries/useSep24Verification";
import { useWalletBalance } from "@/apiQueries/useWalletBalance";
import { Box } from "@/components/Box";
import { EmbeddedWalletLayout } from "@/components/EmbeddedWalletLayout";
import { EmbeddedWalletModal } from "@/components/EmbeddedWalletModal";
import { EmbeddedWalletProfileDropdown } from "@/components/EmbeddedWalletProfileDropdown";
import { EmbeddedWalletProfileModal } from "@/components/EmbeddedWalletProfileModal";
import { Routes } from "@/constants/settings";
import { getSdpTenantName } from "@/helpers/getSdpTenantName";
import { localStorageWalletSessionToken } from "@/helpers/localStorageWalletSessionToken";
import { useRedux } from "@/hooks/useRedux";
import { AppDispatch } from "@/store";
import { clearWalletInfoAction, fetchWalletProfileAction } from "@/store/ducks/walletAccount";

export const EmbeddedWalletHome = () => {
  const { walletAccount, organization } = useRedux("walletAccount", "organization");
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { contractAddress, credentialId, isVerificationPending, isAuthenticated, token } =
    walletAccount;
  const isWalletReady = Boolean(contractAddress);

  const {
    data: balanceData,
    isLoading: isLoadingBalance,
    refetch: refetchBalance,
  } = useWalletBalance(contractAddress);

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
    balance: balanceData?.balance ?? "0",
    onSuccess: async () => {
      setDestination("");
      setAmount("");
      await refetchBalance();
    },
  });

  const sep24VerificationMutation = useSep24Verification();

  const handleSendPayment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isWalletReady) {
      return;
    }

    try {
      await sendPaymentMutation.mutateAsync({ destination, amount });
    } catch {
      // hook handles error reporting
    }
  };

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

  const isSendDisabled =
    !isWalletReady || sendPaymentMutation.isPending || !destination.trim() || !amount.trim();

  const sendPaymentErrorNotification = sendPaymentMutation.error ? (
    <Notification variant="error" title={sendPaymentMutation.error.message} isFilled role="alert" />
  ) : null;

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
            {balanceData?.balance || "0"} {balanceData?.asset_code || "XLM"}
          </strong>
        )}

        <p>{contractAddress}</p>

        {sendPaymentErrorNotification ?? <></>}

        <form onSubmit={handleSendPayment}>
          <Box gap="sm">
            <Input
              id="wallet-send-destination"
              label="Destination address"
              fieldSize="md"
              value={destination}
              onChange={(event) => setDestination(event.currentTarget.value)}
              required
              disabled={!isWalletReady || sendPaymentMutation.isPending}
            />

            <Input
              id="wallet-send-amount"
              label="Amount"
              fieldSize="md"
              type="number"
              step="0.0000001"
              min="0"
              value={amount}
              onChange={(event) => setAmount(event.currentTarget.value)}
              required
              disabled={!isWalletReady || sendPaymentMutation.isPending}
            />

            <Button
              variant="primary"
              type="submit"
              size="lg"
              isLoading={sendPaymentMutation.isPending}
              disabled={isSendDisabled}
            >
              Send Payment
            </Button>
          </Box>
        </form>
      </Box>

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
