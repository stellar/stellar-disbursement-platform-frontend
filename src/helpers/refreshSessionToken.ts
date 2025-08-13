import { refreshTokenAction } from "@/store/ducks/userAccount";

export const refreshSessionToken = (dispatch: any) => {
  dispatch(refreshTokenAction());
};
