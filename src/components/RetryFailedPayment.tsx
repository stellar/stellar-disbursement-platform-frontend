import { useEffect } from "react";
import { Banner, Icon, Link, Loader } from "@stellar/design-system";
import { useQueryClient } from "@tanstack/react-query";
import { usePaymentsRetry } from "apiQueries/usePaymentsRetry";
import { PaymentStatus } from "types";

interface RetryFailedPaymentProps {
  paymentId: string;
  paymentStatus: PaymentStatus;
}

export const RetryFailedPayment = ({ paymentId, paymentStatus }: RetryFailedPaymentProps) => {
  console.log("paymentStatus", paymentStatus);
  const isFailed = paymentStatus === "FAILED";

  const { isFetching, data, isError, isSuccess, error, refetch } = usePaymentsRetry([paymentId]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (paymentId && isSuccess) {
      // Trigger payment details refetch
      queryClient.invalidateQueries({ queryKey: ["payments", paymentId] });
      // Invalidate all payment retry queries to clear success/error state
      queryClient.invalidateQueries({
        queryKey: ["payments", "retry"],
      });
    }
  }, [isSuccess, paymentId, queryClient]);

  if (!isFailed) {
    return null;
  }

  return (
    <div className="StatCards StatCards--paymentDetails">
      <div className="StatCards__card__item--fullWidth">
        {data ? (
          <Banner variant="success">{data.message}</Banner>
        ) : (
          <Banner variant="error">
            <>
              <div className="Banner__message">
                {isError
                  ? `Payment retry failed: ${error.message}. Click Retry to submit again.`
                  : "Unfortunately your payment failed. Click Retry to submit again."}
              </div>
              <Link
                role="button"
                size="sm"
                onClick={() => refetch()}
                isDisabled={isFetching}
                icon={isFetching ? <Loader /> : <Icon.RefreshCcw04 />}
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
