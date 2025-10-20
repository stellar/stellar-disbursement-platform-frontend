import { Card, Heading, Input, Button, Notification } from "@stellar/design-system";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { useCircleBalances } from "@/apiQueries/useCircleBalances";
import { useUpdateCircleConfig } from "@/apiQueries/useUpdateCircleConfig";
import { AssetAmount } from "@/components/AssetAmount";
import { Box } from "@/components/Box";
import { DropdownMenu } from "@/components/DropdownMenu";
import { InfoTooltip } from "@/components/InfoTooltip";
import { LoadingContent } from "@/components/LoadingContent";
import { MoreMenuButton } from "@/components/MoreMenuButton";
import { NotificationWithButtons } from "@/components/NotificationWithButtons";
import { SectionHeader } from "@/components/SectionHeader";
import { useRedux } from "@/hooks/useRedux";
import { AppDispatch } from "@/store";
import { getOrgCircleInfoAction } from "@/store/ducks/organization";

export const DistributionAccountCircle = () => {
  const CIRCLE_API_MASKED_VALUE = "**************";

  const { organization } = useRedux("organization");
  const { distributionAccount } = organization.data;
  const isPendingAccount = distributionAccount?.status === "PENDING_USER_ACTIVATION";

  const [isEditMode, setIsEditMode] = useState(isPendingAccount);
  const [circleApiKey, setCircleApiKey] = useState("");
  const [walletId, setWalletId] = useState("");
  const [configResponse, setConfigResponse] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);

  const {
    data: balances,
    error: balanceError,
    isFetching: isBalancesFetching,
    isLoading: isBalancesLoading,
  } = useCircleBalances(distributionAccount?.circleWalletId || "");

  const {
    data: circleConfig,
    isFetching: isCircleConfigFetching,
    isError: isCircleConfigError,
    isSuccess: isCircleConfigSuccess,
    error: circleConfigError,
    refetch: updateCircleConfig,
  } = useUpdateCircleConfig({ api_key: circleApiKey, wallet_id: walletId });

  const queryClient = useQueryClient();
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    if (isEditMode && (isCircleConfigSuccess || isCircleConfigError)) {
      setConfigResponse({
        message: isCircleConfigSuccess ? circleConfig.message : circleConfigError.message,
        type: isCircleConfigSuccess ? "success" : "error",
      });

      // Reset query
      queryClient.resetQueries({
        queryKey: ["organization", "circle", "config"],
      });

      // Fetch new data
      if (isCircleConfigSuccess) {
        dispatch(getOrgCircleInfoAction());
        setIsEditMode(false);
      }
    }
    // Not including circleConfig.message and circleConfigError.message
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCircleConfigSuccess, isCircleConfigError, queryClient, dispatch]);

  const isSaveEnabled = Boolean(
    (circleApiKey && circleApiKey !== CIRCLE_API_MASKED_VALUE) ||
      (walletId && walletId !== distributionAccount?.circleWalletId),
  );

  const handleUpdate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateCircleConfig();
  };

  const renderInputs = () => {
    if (isEditMode) {
      return (
        <form onSubmit={handleUpdate}>
          <Box gap="md">
            <Input
              id="circle-api-key"
              fieldSize="md"
              label="Circle API Key"
              value={circleApiKey}
              disabled={!isEditMode}
              onChange={(e) => {
                setConfigResponse(null);
                setCircleApiKey(e.target.value);
              }}
            />

            <Input
              id="circle-wallet-id"
              fieldSize="md"
              label="Wallet ID"
              value={walletId}
              disabled={!isEditMode}
              onChange={(e) => {
                setConfigResponse(null);
                setWalletId(e.target.value);
              }}
            />

            <Box gap="md" direction="row" justify="end">
              <>
                <Button
                  variant="tertiary"
                  size="md"
                  type="button"
                  onClick={() => {
                    setIsEditMode(false);
                    setCircleApiKey("");
                    setWalletId("");
                    setConfigResponse(null);
                  }}
                  disabled={isCircleConfigFetching}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={!isSaveEnabled}
                  isLoading={isCircleConfigFetching}
                >
                  Save configuration
                </Button>
              </>
            </Box>
          </Box>
        </form>
      );
    }

    return (
      <Box gap="md">
        <div className="CardStack__infoItem">
          <label className="Label Label--sm">Circle API Key</label>
          <div className="CardStack__infoItem__value">{CIRCLE_API_MASKED_VALUE}</div>
        </div>

        <div className="CardStack__infoItem">
          <label className="Label Label--sm">Wallet ID</label>
          <div className="CardStack__infoItem__value">{distributionAccount?.circleWalletId}</div>
        </div>
      </Box>
    );
  };

  const renderBalances = () => {
    if (isBalancesFetching || isBalancesLoading) {
      return <LoadingContent />;
    }

    if (balanceError) {
      return <div className="Note Note--noMargin Note--error">{balanceError.message}</div>;
    }

    if (balances?.balances.length === 0) {
      return <div className="Note Note--noMargin">There are no balances to show</div>;
    }

    return balances?.balances.map((b) => (
      <AssetAmount
        key={`${b.asset_code}-${b.asset_issuer}`}
        amount={b.amount}
        assetCode={b.asset_code}
      />
    ));
  };

  return (
    <>
      <SectionHeader>
        <SectionHeader.Row>
          <SectionHeader.Content>
            <Heading as="h2" size="sm">
              Circle Distribution Account
            </Heading>
          </SectionHeader.Content>
        </SectionHeader.Row>
      </SectionHeader>

      <div className="CardStack">
        {configResponse?.message && configResponse?.type === "error" ? (
          <Notification variant="error" title="Error" isFilled={true}>
            {configResponse.message}
          </Notification>
        ) : null}

        {configResponse?.message && configResponse?.type === "success" ? (
          <NotificationWithButtons
            variant="success"
            title="Circle Account Configuration updated"
            buttons={[
              {
                label: "Dismiss",
                onClick: () => {
                  setConfigResponse(null);
                },
              },
            ]}
          >
            {configResponse.message}
          </NotificationWithButtons>
        ) : null}
        <Card>
          <Box gap="sm">
            <div className="CardStack__title">
              <InfoTooltip infoText="TODO: info text">Circle Account Configuration</InfoTooltip>

              {!isEditMode ? (
                <DropdownMenu triggerEl={<MoreMenuButton />}>
                  <DropdownMenu.Item
                    onClick={() => {
                      setIsEditMode(true);
                      setCircleApiKey("");
                      setWalletId(distributionAccount?.circleWalletId || "");
                    }}
                  >
                    Edit configuration
                  </DropdownMenu.Item>
                </DropdownMenu>
              ) : null}
            </div>

            <Box gap="lg">
              <div className="Note Note--noMargin">
                Fund your distribution account by sending Stellar-based digital assets to the public
                key above.
              </div>
              <div className="Note Note--noMargin">
                Your distribution account serves as the source of funds for all outgoing payments.
                It can also receive incoming payments. To receive payments, provide your public key
                to the sender (no memo required). Assets sent to this address will appear
                immediately in your distribution account.
              </div>
              <div className="Note__emphasis">
                Note: For security and operational best practice, only fund this account when you’re
                ready to send disbursements. Any authorized SDP user with disbursement permissions
                can initiate payments from this account.
              </div>

              {renderInputs()}

              <>
                {isPendingAccount ? null : (
                  <Card noPadding>
                    <Box gap="sm" addlClassName="CircleBalances">
                      <div className="CircleBalances__title">Current Balances</div>
                      <>{renderBalances()}</>
                    </Box>
                  </Card>
                )}
              </>
            </Box>
          </Box>
        </Card>
      </div>
    </>
  );
};
