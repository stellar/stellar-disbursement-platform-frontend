import { Button, Icon } from "@stellar/design-system";
import { useNavigate } from "react-router-dom";
import { ShowForRoles } from "components/ShowForRoles";
import { Routes } from "constants/settings";

export const NewDisbursementButton = () => {
  const navigate = useNavigate();

  const goToNewDisbursement = () => {
    navigate(Routes.DISBURSEMENT_NEW);
  };

  return (
    <ShowForRoles acceptedRoles={["owner", "financial_controller"]}>
      <Button
        variant="primary"
        size="sm"
        icon={<Icon.Add />}
        iconPosition="right"
        onClick={goToNewDisbursement}
      >
        New disbursement
      </Button>
    </ShowForRoles>
  );
};
