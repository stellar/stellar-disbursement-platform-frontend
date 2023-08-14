import { Notification } from "@stellar/design-system";

interface QueryStatusHandlerProps {
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  errorMessage?: string;
  children: React.ReactNode;
}

export const QueryStatusHandler = ({
  isLoading,
  isError,
  isEmpty,
  emptyMessage = "No data",
  errorMessage = "Something went wrong",
  children,
}: QueryStatusHandlerProps) => {
  if (isLoading) {
    return <div className="Note">Loading…</div>;
  }

  if (isError) {
    return (
      <Notification variant="error" title="Error">
        {errorMessage}
      </Notification>
    );
  }

  if (isEmpty) {
    return <div className="Note">{emptyMessage}</div>;
  }

  return <>{children}</>;
};
