import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Heading } from "@stellar/design-system";

import { AppDispatch } from "store";
import { getDisbursementsAction } from "store/ducks/disbursements";
import { resetDisbursementDetailsAction } from "store/ducks/disbursementDetails";
import { setDraftIdAction } from "store/ducks/disbursementDrafts";
import { useRedux } from "hooks/useRedux";
import { Routes } from "constants/settings";

import { SectionHeader } from "components/SectionHeader";
import { ShowForRoles } from "components/ShowForRoles";
import { DisbursementsTable } from "components/DisbursementsTable";
import { DashboardAnalytics } from "components/DashboardAnalytics";
import { useIsUserRoleAccepted } from "hooks/useIsUserRoleAccepted";
import { NewDisbursementButton } from "components/NewDisbursementButton";

export const Home = () => {
  const { disbursements, userAccount } = useRedux("disbursements", "userAccount");
  const { isRoleAccepted } = useIsUserRoleAccepted(["business", "financial_controller", "owner"]);

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

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
            <Button size="sm" variant="tertiary" onClick={goToAnalytics}>
              View analytics
            </Button>
          </SectionHeader.Content>
        </SectionHeader.Row>
      </SectionHeader>

      <div className="HomeStatistics">
        <DashboardAnalytics />
      </div>

      <ShowForRoles acceptedRoles={["business", "financial_controller", "owner"]}>
        <SectionHeader>
          <SectionHeader.Row>
            <SectionHeader.Content>
              <Heading as="h2" size="xs">
                Recent disbursements
              </Heading>
            </SectionHeader.Content>
            <SectionHeader.Content align="right">
              <Button size="sm" variant="tertiary" onClick={goToDisbursements}>
                View all
              </Button>
              <ShowForRoles acceptedRoles={["owner", "financial_controller"]}>
                <NewDisbursementButton size="sm" />
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
