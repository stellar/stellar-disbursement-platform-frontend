import { PaymentStatus as PaymentStatusType } from "types";
import "./styles.scss";

export const PaymentStatus = ({ status }: { status: PaymentStatusType }) => {
  switch (status) {
    case "DRAFT":
      return <span className="PaymentStatus">Draft</span>;
    case "FAILED":
      return <span className="PaymentStatus">Failed</span>;
    case "CANCELED":
      return <span className="PaymentStatus">Canceled</span>;
    case "PAUSED":
      return <span className="PaymentStatus">Paused</span>;
    case "PENDING":
      return <span className="PaymentStatus">Pending</span>;
    case "READY":
      return <span className="PaymentStatus PaymentStatus--accent">Ready</span>;
    case "SUCCESS":
      return (
        <span className="PaymentStatus PaymentStatus--accent">Success</span>
      );
    default:
      return null;
  }
};
