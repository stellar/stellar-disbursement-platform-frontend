import { Banner, Icon, Link } from "@stellar/design-system";
import { useLocation, useNavigate } from "react-router-dom";

import { useRedux } from "hooks/useRedux";
import { Routes } from "constants/settings";

export const GlobalBanner = () => {
  const { organization } = useRedux("organization");

  const navigate = useNavigate();
  const location = useLocation();

  // Show Circle Distribution Account missing info banner
  if (
    !location.pathname.includes("distribution-account") &&
    organization.data.distributionAccount?.type ===
      "DISTRIBUTION_ACCOUNT.CIRCLE.DB_VAULT" &&
    organization.data.distributionAccount?.status === "PENDING_USER_ACTIVATION"
  ) {
    return (
      <div className="CircleDistributionAccountPending">
        <Banner variant="warning">
          <div>
            You must configure your Circle Account to continue. One or more
            fields are incomplete.
          </div>
          <Link
            onClick={() => {
              navigate(Routes.DISTRIBUTION_ACCOUNT);
            }}
            icon={<Icon.ArrowRight />}
          >
            Configure Account
          </Link>
        </Banner>
      </div>
    );
  }

  return null;
};
