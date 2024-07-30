import { Banner, Icon, Link } from "@stellar/design-system";
import { useLocation, useNavigate } from "react-router-dom";

import { Routes } from "constants/settings";
import { useCircleAccount } from "hooks/useCircleAccount";

export const GlobalBanner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isCircleAccount, isCircleAccountPending } = useCircleAccount();

  // Circle Distribution Account missing info banner
  if (
    !location.pathname.includes("distribution-account") &&
    isCircleAccount &&
    isCircleAccountPending
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
