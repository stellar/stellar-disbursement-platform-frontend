import { useEffect, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Button, Heading } from "@stellar/design-system";

import { DashboardAnalytics } from "@/components/DashboardAnalytics";
import { DisbursementsTable } from "@/components/DisbursementsTable";
import { DistributionWalletPicker } from "@/components/DistributionWalletPicker";
import { NewDisbursementButton } from "@/components/NewDisbursementButton";
import { SectionHeader } from "@/components/SectionHeader";
import { ShowForRoles } from "@/components/ShowForRoles";
import { WalletBalancesOverview } from "@/components/WalletBalancesOverview";

import { resetDisbursementDetailsAction } from "@/store/ducks/disbursementDetails";
import { setDraftIdAction } from "@/store/ducks/disbursementDrafts";
import { getDisbursementsAction } from "@/store/ducks/disbursements";

import { Routes } from "@/constants/settings";

import { localStorageSelectedWallet } from "@/helpers/localStorageSelectedWallet";

import { useIsUserRoleAccepted } from "@/hooks/useIsUserRoleAccepted";
import { useRedux } from "@/hooks/useRedux";

import { AppDispatch } from "@/store";

export const Home = () => {
  const { disbursements, userAccount } = useRedux("disbursements", "userAccount");
  const { isRoleAccepted } = useIsUserRoleAccepted([
    "business",
    "financial_controller",
    "owner",
    "initiator",
    "approver",
  ]);

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Selected distribution wallet ("" = All wallets). Owned here so the picker change
  // re-renders the dashboard and re-keys its queries — no stale-cache lag on switch.
  const [selectedWalletId, setSelectedWalletId] = useState<string>(
    localStorageSelectedWallet.get() ?? "",
  );

  const handleSelectWallet = (walletId: string) => {
    setSelectedWalletId(walletId);
    if (walletId) {
      localStorageSelectedWallet.set(walletId);
    } else {
      localStorageSelectedWallet.remove();
    }
    // Refetch the other wallet-scoped queries (disbursements list, etc.) with the new header.
    queryClient.invalidateQueries();
  };

  useEffect(() => {
    if (userAccount.isAuthenticated) {
      if (isRoleAccepted) {
        dispatch(getDisbursementsAction());
      }
      dispatch(resetDisbursementDetailsAction());
      dispatch(setDraftIdAction(undefined));
    }
  }, [dispatch, isRoleAccepted, userAccount.isAuthenticated]);

  const apiErrorDisbursements =
    disbursements.status === "ERROR" && disbursements.errorString
      ? disbursements.errorString
      : undefined;

  const goToAnalytics = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    navigate(Routes.ANALYTICS);
  };

  const goToDisbursements = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    navigate(Routes.DISBURSEMENTS);
  };

  return (
    <>
      <SectionHeader>
        <SectionHeader.Row>
          <SectionHeader.Content>
            <Heading as="h2" size="sm">
              Dashboard
            </Heading>
          </SectionHeader.Content>
          <SectionHeader.Content align="right">
            <Button size="md" variant="tertiary" onClick={goToAnalytics}>
              View analytics
            </Button>
          </SectionHeader.Content>
        </SectionHeader.Row>
      </SectionHeader>

      <div className="HomeStatistics">
        <DistributionWalletPicker value={selectedWalletId} onSelect={handleSelectWallet} />
        <DashboardAnalytics selectedWalletId={selectedWalletId} />
        <WalletBalancesOverview />
      </div>

      <ShowForRoles
        acceptedRoles={["business", "financial_controller", "owner", "initiator", "approver"]}
      >
        <SectionHeader>
          <SectionHeader.Row>
            <SectionHeader.Content>
              <Heading as="h2" size="xs">
                Recent disbursements
              </Heading>
            </SectionHeader.Content>
            <SectionHeader.Content align="right">
              <Button size="md" variant="tertiary" onClick={goToDisbursements}>
                View all
              </Button>
              <ShowForRoles acceptedRoles={["owner", "financial_controller", "initiator"]}>
                <NewDisbursementButton />
              </ShowForRoles>
            </SectionHeader.Content>
          </SectionHeader.Row>
        </SectionHeader>

        <DisbursementsTable
          disbursementItems={disbursements.items}
          searchParams={undefined}
          apiError={apiErrorDisbursements}
          isFiltersSelected={undefined}
          status={disbursements.status}
        />
      </ShowForRoles>
    </>
  );
};
