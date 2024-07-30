import { useRedux } from "hooks/useRedux";

export const useCircleAccount = () => {
  const { organization } = useRedux("organization");
  const { distributionAccount } = organization.data;

  return {
    isCircleAccount:
      distributionAccount?.type === "DISTRIBUTION_ACCOUNT.CIRCLE.DB_VAULT",
    isCircleAccountActive: distributionAccount?.status === "ACTIVE",
    isCircleAccountPending:
      distributionAccount?.status === "PENDING_USER_ACTIVATION",
    walletId: distributionAccount?.circleWalletId,
  };
};
