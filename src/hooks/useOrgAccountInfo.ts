import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "store";
import { getStellarAccountAction } from "store/ducks/organization";

export const useOrgAccountInfo = (
  distributionAccountPublicKey: string | undefined,
) => {
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    if (distributionAccountPublicKey) {
      dispatch(getStellarAccountAction(distributionAccountPublicKey));
    }
  }, [dispatch, distributionAccountPublicKey]);
};
