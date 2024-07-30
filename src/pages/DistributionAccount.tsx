import { useRedux } from "hooks/useRedux";
import { useCircleAccount } from "hooks/useCircleAccount";
import { DistributionAccountCircle } from "components/DistributionAccountCircle";
import { DistributionAccountStellar } from "components/DistributionAccountStellar";
import { LoadingContent } from "components/LoadingContent";

export const DistributionAccount = () => {
  const { organization } = useRedux("organization");
  const { isCircleAccount } = useCircleAccount();

  if (organization.status === "PENDING") {
    return <LoadingContent />;
  }

  if (isCircleAccount) {
    return <DistributionAccountCircle />;
  }

  return <DistributionAccountStellar />;
};
