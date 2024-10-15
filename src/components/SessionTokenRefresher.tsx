import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "store";

import { refreshSessionToken } from "helpers/refreshSessionToken";

const TOKEN_REFRESH_INTERVAL = 60000; // 60,000ms = 1 minute

export const SessionTokenRefresher: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    // Function to call refreshSessionToken every minute
    const ticker = setInterval(() => {
      try {
        refreshSessionToken(dispatch);
      } catch (error) {
        console.error("Error refreshing session token: ", error);
      }
    }, TOKEN_REFRESH_INTERVAL);

    // Cleanup function to clear the interval when component unmounts
    return () => clearInterval(ticker);
  }, [dispatch]);

  return <></>;
};
