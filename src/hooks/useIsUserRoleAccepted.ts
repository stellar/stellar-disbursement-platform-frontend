import { useRedux } from "hooks/useRedux";
import { UserRole } from "types";

export const useIsUserRoleAccepted = (acceptedRoles: UserRole[]) => {
  const { userAccount } = useRedux("userAccount");
  return {
    isRoleAccepted:
      userAccount.role && acceptedRoles.includes(userAccount.role),
  };
};
