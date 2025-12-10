import { Button, Input, Notification } from "@stellar/design-system";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { useSendWalletPayment } from "@/apiQueries/useSendWalletPayment";
import { useSep24Verification } from "@/apiQueries/useSep24Verification";
import { useWalletBalance } from "@/apiQueries/useWalletBalance";
import { Box } from "@/components/Box";
import { Routes } from "@/constants/settings";
import { localStorageWalletSessionToken } from "@/helpers/localStorageWalletSessionToken";
import { useRedux } from "@/hooks/useRedux";
import { AppDispatch } from "@/store";
import { clearWalletInfoAction, fetchWalletProfileAction } from "@/store/ducks/walletAccount";

export const EmbeddedWalletHome = () => {
  const { walletAccount } = useRedux("walletAccount");
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const contractAddress = walletAccount.contractAddress;
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
    if (walletAccount.isAuthenticated && walletAccount.token) {
      dispatch(fetchWalletProfileAction());
    }
  }, [dispatch, walletAccount.isAuthenticated, walletAccount.token]);

  const sendPaymentMutation = useSendWalletPayment({
    contractAddress,
    credentialId: walletAccount.credentialId,
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

  const sep24VerificationErrorNotification = sep24VerificationMutation.error ? (
    <Notification
      variant="error"
      title={sep24VerificationMutation.error.message}
      isFilled
      role="alert"
    />
  ) : null;

  return (
    <div className="SignIn">
      <div className="SignIn__container">
        <div className="SignIn__content">
          <Box gap="md">
            {isLoadingBalance ? (
              <strong>Loading...</strong>
            ) : (
              <strong>
                {balanceData?.balance || "0"} {balanceData?.asset_code || "XLM"}
              </strong>
            )}

            <p>{contractAddress}</p>

            <>
              {sendPaymentErrorNotification}
              {sep24VerificationErrorNotification}
            </>

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

            <Button variant="secondary" size="lg" onClick={handleLogout}>
              Sign Out
            </Button>
            {walletAccount.isVerificationPending ? (
              <Button
                variant="secondary"
                size="lg"
                onClick={handleSep24Verification}
                isLoading={sep24VerificationMutation.isPending}
                disabled={!isWalletReady || sep24VerificationMutation.isPending}
              >
                Start Verification
              </Button>
            ) : (
              <></>
            )}
          </Box>
        </div>
      </div>
    </div>
  );
};
