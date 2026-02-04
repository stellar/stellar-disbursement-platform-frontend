import { useEffect, useMemo, useState } from "react";

import BigNumber from "bignumber.js";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Icon, Notification, Text } from "@stellar/design-system";

import { AssetAmount } from "@/components/AssetAmount";
import { Box } from "@/components/Box";
import { EmbeddedWalletAssetLogo } from "@/components/EmbeddedWalletAssetLogo";
import { EmbeddedWalletBalanceCard } from "@/components/EmbeddedWalletBalanceCard";
import { EmbeddedWalletDismissibleNotice } from "@/components/EmbeddedWalletDismissibleNotice";
import { EmbeddedWalletLayout } from "@/components/EmbeddedWalletLayout";
import { EmbeddedWalletModal } from "@/components/EmbeddedWalletModal";
import { useEmbeddedWalletNotice } from "@/components/EmbeddedWalletNoticesProvider";
import { EmbeddedWalletProfileDropdown } from "@/components/EmbeddedWalletProfileDropdown";
import { EmbeddedWalletProfileModal } from "@/components/EmbeddedWalletProfileModal";
import { EmbeddedWalletReviewTransferModal } from "@/components/EmbeddedWalletReviewTransferModal";
import { EmbeddedWalletSendingTransferModal } from "@/components/EmbeddedWalletSendingTransferModal";
import { EmbeddedWalletTransferModal } from "@/components/EmbeddedWalletTransferModal";
import { EmbeddedWalletTransferStatusModal } from "@/components/EmbeddedWalletTransferStatusModal";

import { clearWalletInfoAction, fetchWalletProfileAction } from "@/store/ducks/walletAccount";

import {
  DEFAULT_EMBEDDED_WALLET_FALLBACK_CODE,
  getEmbeddedWalletAssetMetadata,
} from "@/constants/embeddedWalletAssets";
import { Routes } from "@/constants/settings";

import {
  getTransactionHashFromError,
  isSimulationError,
  isTransactionFailedError,
  useSendWalletPayment,
} from "@/apiQueries/useSendWalletPayment";
import { useSep24Verification } from "@/apiQueries/useSep24Verification";
import { useWalletBalance } from "@/apiQueries/useWalletBalance";

import { getSdpTenantName } from "@/helpers/getSdpTenantName";
import { localStorageWalletNotices } from "@/helpers/localStorageWalletNotices";
import { localStorageWalletSessionToken } from "@/helpers/localStorageWalletSessionToken";

import { useRedux } from "@/hooks/useRedux";

import { ApiStellarAccountBalance } from "@/types";

import { AppDispatch } from "@/store";

import "./EmbeddedWalletHome.scss";

const VERIFIED_NOTICE_ID = "embedded-wallet-verified";
const TRANSFER_STEPS = {
  IDLE: "idle",
  TRANSFER: "transfer",
  REVIEW: "review",
  SENDING: "sending",
  SUCCESS: "success",
  FAILED: "failed",
  SIMULATION_ERROR: "simulation-error",
} as const;
type TransferStep = (typeof TRANSFER_STEPS)[keyof typeof TRANSFER_STEPS];
type TransferDetails = {
  amount: string;
  assetCode: string;
  destination: string;
  transactionHash?: string;
};

const getAssetKey = (code: string, issuer?: string | null) => `${code}-${issuer ?? "native"}`;
const buildAssetOption = (assetCode: string, issuer: string | null, balance: string) => ({
  id: getAssetKey(assetCode, issuer),
  code: assetCode,
  issuer,
  balance,
});

export const EmbeddedWalletHome = () => {
  const { walletAccount, organization } = useRedux("walletAccount", "organization");
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [isExchangeWarningOpen, setIsExchangeWarningOpen] = useState(false);
  const [transferStep, setTransferStep] = useState<TransferStep>(TRANSFER_STEPS.IDLE);
  const [transferDetails, setTransferDetails] = useState<TransferDetails | null>(null);
  const isTransferModalOpen = transferStep === TRANSFER_STEPS.TRANSFER;
  const isReviewModalOpen = transferStep === TRANSFER_STEPS.REVIEW;
  const isSendingModalOpen = transferStep === TRANSFER_STEPS.SENDING;
  const isSimulationErrorOpen = transferStep === TRANSFER_STEPS.SIMULATION_ERROR;
  const isTransferStatusOpen =
    transferStep === TRANSFER_STEPS.SUCCESS || transferStep === TRANSFER_STEPS.FAILED;
  const transferStatus = transferStep === TRANSFER_STEPS.FAILED ? "failed" : "success";
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const {
    contractAddress,
    credentialId,
    isVerificationPending,
    isAuthenticated,
    token,
    profileStatus,
    pendingAsset,
    supportedAssets,
  } = walletAccount;
  const isWalletReady = Boolean(contractAddress);

  const {
    data: balanceData,
    isLoading: isLoadingBalance,
    refetch: refetchBalance,
  } = useWalletBalance(contractAddress, supportedAssets);

  const nonZeroWalletBalances = useMemo<ApiStellarAccountBalance[]>(() => {
    if (!balanceData) {
      return [];
    }

    return balanceData.filter((balance) => !new BigNumber(balance.balance || "0").isZero());
  }, [balanceData]);
  const balanceByAssetKey = useMemo(() => {
    if (!balanceData) {
      return new Map<string, ApiStellarAccountBalance>();
    }

    return new Map(
      balanceData.map((balance) => {
        const code = balance.asset_code || DEFAULT_EMBEDDED_WALLET_FALLBACK_CODE;
        const issuer = balance.asset_issuer ?? null;
        return [getAssetKey(code, issuer), balance];
      }),
    );
  }, [balanceData]);
  const assetOptions = useMemo(() => {
    if (!supportedAssets?.length && !nonZeroWalletBalances.length) {
      return [];
    }

    if (supportedAssets?.length) {
      return supportedAssets
        .map((asset) => {
          const assetCode = asset.code || DEFAULT_EMBEDDED_WALLET_FALLBACK_CODE;
          const issuer = asset.issuer || null;
          const balanceEntry = balanceByAssetKey.get(getAssetKey(assetCode, issuer));
          if (!balanceEntry) {
            return null;
          }
          if (new BigNumber(balanceEntry.balance || "0").isZero()) {
            return null;
          }
          return buildAssetOption(assetCode, issuer, balanceEntry?.balance ?? "0");
        })
        .filter((asset): asset is NonNullable<typeof asset> => Boolean(asset));
    }

    return nonZeroWalletBalances.map((balance) => {
      const assetCode = balance.asset_code || DEFAULT_EMBEDDED_WALLET_FALLBACK_CODE;
      const issuer = balance.asset_issuer ?? null;
      return buildAssetOption(assetCode, issuer, balance.balance);
    });
  }, [balanceByAssetKey, nonZeroWalletBalances, supportedAssets]);
  const activeAsset = assetOptions.find((asset) => asset.id === selectedAssetId) ?? assetOptions[0];
  const activeAssetCode = activeAsset?.code ?? "XLM";
  const activeAssetIssuer = activeAsset?.issuer ?? null;
  const activeAssetBalance = activeAsset?.balance ?? "0";

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

  useEffect(() => {
    if (!assetOptions.length) {
      return;
    }

    setSelectedAssetId((current) => {
      if (current && assetOptions.some((asset) => asset.id === current)) {
        return current;
      }

      const xlmAsset = assetOptions.find((asset) => asset.code === "XLM");
      return (xlmAsset ?? assetOptions[0]).id;
    });
  }, [assetOptions]);

  const sendPaymentMutation = useSendWalletPayment({
    contractAddress,
    credentialId,
    balance: activeAssetBalance,
    assetCode: activeAssetCode,
    assetIssuer: activeAssetIssuer,
    onSigned: () => setTransferStep(TRANSFER_STEPS.SENDING),
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

  const isWithdrawDisabled = !isWalletReady || sendPaymentMutation.isPending || !activeAsset;
  const isSendDisabled =
    !isWalletReady || sendPaymentMutation.isPending || !destination.trim() || !amount.trim();

  const handleSendPayment = () => {
    if (isWithdrawDisabled) {
      return;
    }

    setIsExchangeWarningOpen(true);
  };

  const handleOpenTransferModal = () => {
    setIsExchangeWarningOpen(false);
    setTransferStep(TRANSFER_STEPS.TRANSFER);
  };

  const handleCloseTransferFlow = () => {
    setTransferStep(TRANSFER_STEPS.IDLE);
  };

  const handleAssetChange = (assetId: string) => {
    if (assetId === selectedAssetId) {
      return;
    }

    setSelectedAssetId(assetId);
    setAmount("");
  };

  const handleReviewTransfer = () => {
    setTransferStep(TRANSFER_STEPS.REVIEW);
  };

  const handleBackToTransfer = () => {
    setTransferStep(TRANSFER_STEPS.TRANSFER);
  };

  const handleConfirmTransfer = async () => {
    if (isSendDisabled) {
      return;
    }

    const trimmedDestination = destination.trim();
    const trimmedAmount = amount.trim();
    const snapshot = {
      amount: trimmedAmount,
      assetCode: activeAssetCode,
      destination: trimmedDestination,
    };

    setTransferDetails(snapshot);

    try {
      const result = await sendPaymentMutation.mutateAsync({
        destination: trimmedDestination,
        amount: trimmedAmount,
      });

      setTransferDetails({ ...snapshot, transactionHash: result.transactionHash });
      setTransferStep(TRANSFER_STEPS.SUCCESS);
      setDestination("");
      setAmount("");
      await refetchBalance();
    } catch (error) {
      if (isSimulationError(error)) {
        setTransferStep(TRANSFER_STEPS.SIMULATION_ERROR);
        return;
      }
      if (isTransactionFailedError(error)) {
        setTransferDetails({ ...snapshot, transactionHash: getTransactionHashFromError(error) });
        setTransferStep(TRANSFER_STEPS.FAILED);
        return;
      }
      setTransferStep(TRANSFER_STEPS.REVIEW);
    }
  };

  const handleCloseTransferStatus = () => {
    setTransferStep(TRANSFER_STEPS.IDLE);
    setTransferDetails(null);
    sendPaymentMutation.reset();
  };

  const handleCloseSimulationError = () => {
    setTransferStep(TRANSFER_STEPS.REVIEW);
    sendPaymentMutation.reset();
  };

  const sendPaymentErrorNotification =
    sendPaymentMutation.error &&
    !isSimulationError(sendPaymentMutation.error) &&
    !isTransactionFailedError(sendPaymentMutation.error) ? (
      <Notification
        variant="error"
        title={sendPaymentMutation.error?.message ?? "Unexpected error"}
        isFilled
        role="alert"
      />
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
          <Box gap="md" direction="row" align="center">
            <EmbeddedWalletAssetLogo assetCode={assetCode} size="md" />
            <Box gap="xs">
              <div className="EmbeddedWalletBalanceCard__assetText">{label}</div>
              <div className="EmbeddedWalletBalanceCard__assetSubtext">{assetCode}</div>
            </Box>
          </Box>
          <div className="EmbeddedWalletBalanceCard__assetText">
            <AssetAmount amount={balance.balance} assetCode={assetCode} />
          </div>
        </Box>
      );
    });
  };

  const organizationName = useMemo(
    () => organization?.data?.name || getSdpTenantName() || "Your organization",
    [organization?.data?.name],
  );

  const receiverContact = walletAccount.receiverContact;
  const transferSnapshot = transferDetails ?? {
    amount,
    assetCode: activeAssetCode,
    destination,
    transactionHash: undefined,
  };

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
      {sendPaymentErrorNotification}

      <EmbeddedWalletBalanceCard
        title="My assets"
        tableHeaders={["Asset", "Amount"]}
        renderTableContent={renderAssetRows}
        actionLabel="Withdraw"
        onAction={handleSendPayment}
        onActionDisabled={isWithdrawDisabled}
      />

      <EmbeddedWalletTransferModal
        isOpen={isTransferModalOpen}
        onClose={handleCloseTransferFlow}
        amount={amount}
        destination={destination}
        onAmountChange={setAmount}
        onDestinationChange={setDestination}
        availableBalance={activeAssetBalance}
        assetCode={activeAssetCode}
        assetOptions={assetOptions}
        selectedAssetId={selectedAssetId}
        onAssetChange={handleAssetChange}
        isSubmitDisabled={isSendDisabled}
        isSubmitLoading={sendPaymentMutation.isPending}
        isWalletReady={isWalletReady}
        onReview={handleReviewTransfer}
      />

      <EmbeddedWalletReviewTransferModal
        isOpen={isReviewModalOpen}
        onClose={handleCloseTransferFlow}
        onBack={handleBackToTransfer}
        onConfirm={handleConfirmTransfer}
        amount={amount}
        assetCode={activeAssetCode}
        senderAddress={contractAddress}
        destination={destination}
        isConfirmDisabled={isSendDisabled}
        isConfirmLoading={sendPaymentMutation.isPending}
      />

      <EmbeddedWalletSendingTransferModal
        isOpen={isSendingModalOpen}
        onClose={handleCloseTransferFlow}
        amount={transferSnapshot.amount}
        assetCode={transferSnapshot.assetCode}
      />

      <EmbeddedWalletTransferStatusModal
        isOpen={isTransferStatusOpen}
        onClose={handleCloseTransferStatus}
        status={transferStatus}
        amount={transferSnapshot.amount}
        assetCode={transferSnapshot.assetCode}
        destination={transferSnapshot.destination}
        transactionHash={transferSnapshot.transactionHash}
      />

      <EmbeddedWalletModal
        visible={isSimulationErrorOpen}
        onClose={handleCloseSimulationError}
        containerClassName="EmbeddedWalletHome__transferErrorModal"
        title="Error"
        titleAlign="center"
        contentAlign="center"
        content={
          <div className="EmbeddedWalletHome__transferErrorSummary">
            <div className="EmbeddedWalletHome__transferErrorIcon">
              <Icon.AlertCircle />
            </div>
            <div className="EmbeddedWalletHome__transferErrorMessage">
              Unexpected error. Please try again.
            </div>
          </div>
        }
        primaryActionLabel="Close"
        onPrimaryAction={handleCloseSimulationError}
      />

      <EmbeddedWalletModal
        visible={isExchangeWarningOpen}
        onClose={() => setIsExchangeWarningOpen(false)}
        containerClassName="EmbeddedWalletHome__exchangeWarningModal"
        title={
          <span className="EmbeddedWalletHome__exchangeWarningTitle">
            <span className="EmbeddedWalletHome__exchangeWarningIcon">
              <Icon.AlertCircle />
            </span>
            <span>Exchanges aren't supported by this wallet</span>
          </span>
        }
        content={
          <div className="EmbeddedWalletHome__exchangeWarningBody">
            <Text size="sm" as="p">
              You can send funds only to Stellar wallets.
              <br />
              Sending to an exchange may result in lost funds.
            </Text>
          </div>
        }
        primaryActionLabel="Got it"
        onPrimaryAction={handleOpenTransferModal}
        contentAlign="center"
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
