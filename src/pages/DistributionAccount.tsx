import { useRedux } from "hooks/useRedux";
import { DistributionAccountCircle } from "components/DistributionAccountCircle";
import { DistributionAccountStellar } from "components/DistributionAccountStellar";
import { LoadingContent } from "components/LoadingContent";

export const DistributionAccount = () => {
  const { organization } = useRedux("organization");

  if (organization.status === "PENDING") {
    return <LoadingContent />;
  }

  if (
    organization.data.distributionAccount?.type ===
    "DISTRIBUTION_ACCOUNT.CIRCLE.DB_VAULT"
  ) {
    return <DistributionAccountCircle />;
  }

  return <DistributionAccountStellar />;
};
