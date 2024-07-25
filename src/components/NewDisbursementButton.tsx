import { Button, Icon } from "@stellar/design-system";
import { useNavigate } from "react-router-dom";
import { ShowForRoles } from "components/ShowForRoles";
import { Routes } from "constants/settings";
import { useCircleAccount } from "hooks/useCircleAccount";

export const NewDisbursementButton = ({
  size = "sm",
}: {
  size?: "sm" | "md" | "xs";
}) => {
  const navigate = useNavigate();
  const { isCircleAccount, isCircleAccountPending } = useCircleAccount();

  const goToNewDisbursement = () => {
    navigate(Routes.DISBURSEMENT_NEW);
  };

  const inActiveCircleAccount = isCircleAccount && isCircleAccountPending;
  const disableMessage = inActiveCircleAccount
    ? "Circle Account is not active"
    : "";

  return (
    <ShowForRoles acceptedRoles={["owner", "financial_controller"]}>
      <Button
        variant="primary"
        size={size}
        icon={<Icon.Add />}
        iconPosition="right"
        onClick={goToNewDisbursement}
        disabled={inActiveCircleAccount}
        title={disableMessage}
      >
        New disbursement
      </Button>
    </ShowForRoles>
  );
};
