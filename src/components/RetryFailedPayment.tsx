import { useEffect } from "react";
import { Banner, Icon, Link, Loader } from "@stellar/design-system";
import { useQuery } from "@tanstack/react-query";
import { patchPaymentsRetry } from "api/patchPaymentsRetry";
import { useSessionToken } from "hooks/useSessionToken";
import { PaymentDetailsStatusHistoryItem } from "types";

interface RetryFailedPaymentProps {
  paymentId: string;
  paymentStatus: PaymentDetailsStatusHistoryItem[];
  onSuccess: () => void;
}

export const RetryFailedPayment = ({
  paymentId,
  paymentStatus,
  onSuccess,
}: RetryFailedPaymentProps) => {
  const sessionToken = useSessionToken();
  const isFailed = paymentStatus.slice(-1)[0]?.status === "FAILED";

  const retryPayment = async () => {
    const response = await patchPaymentsRetry(sessionToken, [paymentId]);
    return response.message;
  };

  const { isFetching, data, isError, error, refetch } = useQuery({
    queryKey: ["RetryFailedPayment"],
    queryFn: retryPayment,
    enabled: false,
  });

  const isSuccess = Boolean(data);

  useEffect(() => {
    if (isSuccess) {
      onSuccess();
    }
  }, [isSuccess, onSuccess]);

  if (!isFailed) {
    return null;
  }

  return (
    <div className="StatCards StatCards--paymentDetails">
      <div className="StatCards__card__item--fullWidth">
        {data ? (
          <Banner variant="success">{data}</Banner>
        ) : (
          <Banner variant="error">
            <>
              <div className="Banner__message">
                {isError
                  ? (error as any).error
                  : "Unfortunately your payment failed. Click Retry to submit again."}
              </div>
              <Link
                role="button"
                size="sm"
                onClick={() => refetch()}
                isDisabled={isFetching}
                icon={isFetching ? <Loader /> : <Icon.RefreshVert />}
              >
                Retry
              </Link>
            </>
          </Banner>
        )}
      </div>
    </div>
  );
};
