import { useRedux } from "hooks/useRedux";

export const useSessionToken = () => {
  const { userAccount } = useRedux("userAccount");
  return userAccount.token;
};
