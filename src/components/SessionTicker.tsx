import { refreshSessionToken } from "helpers/refreshSessionToken";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "store";

const TOKEN_REFRESH_INTERVAL = 60000; // 60,000ms = 1 minute

export const SessionTicker: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  useEffect(() => {
    console.log("setting up ticker");
    // Function to call refreshSessionToken every minute
    const ticker = setInterval(() => {
      console.log("tick");
      try {
        refreshSessionToken(dispatch);
      } catch (error) {
        console.error("Error refreshing session token: ", error);
      }
    }, TOKEN_REFRESH_INTERVAL); // 60,000ms = 1 minute

    // Cleanup function to clear the interval when component unmounts
    return () => clearInterval(ticker);
  }, [dispatch]);

  return <></>;
};
