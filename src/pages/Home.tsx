import { useEffect } from "react";

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Button, Heading } from "@stellar/design-system";

import { DashboardAnalytics } from "@/components/DashboardAnalytics";
import { DisbursementsTable } from "@/components/DisbursementsTable";
import { NewDisbursementButton } from "@/components/NewDisbursementButton";
import { SectionHeader } from "@/components/SectionHeader";
import { ShowForRoles } from "@/components/ShowForRoles";
import { WalletBalancesOverview } from "@/components/WalletBalancesOverview";

import { resetDisbursementDetailsAction } from "@/store/ducks/disbursementDetails";
import { setDraftIdAction } from "@/store/ducks/disbursementDrafts";
import { getDisbursementsAction } from "@/store/ducks/disbursements";

import { Routes } from "@/constants/settings";

import { useIsUserRoleAccepted } from "@/hooks/useIsUserRoleAccepted";
import { useRedux } from "@/hooks/useRedux";
import { useSelectedWallet } from "@/hooks/useSelectedWallet";

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

  // Active distribution account comes from the global ActiveWalletBar (shared context).
  const { selectedWalletId } = useSelectedWallet();

  useEffect(() => {
    if (userAccount.isAuthenticated) {
      if (isRoleAccepted) {
        // Re-fetch recent disbursements scoped to the active account when it changes. The id is
        // passed along so the reducer can drop a late response for a previously active account.
        dispatch(getDisbursementsAction({ walletId: selectedWalletId }));
      }
      dispatch(resetDisbursementDetailsAction());
      dispatch(setDraftIdAction(undefined));
    }
  }, [dispatch, isRoleAccepted, userAccount.isAuthenticated, selectedWalletId]);

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
              Home
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
        <DashboardAnalytics showAverageAmount={false} />
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
