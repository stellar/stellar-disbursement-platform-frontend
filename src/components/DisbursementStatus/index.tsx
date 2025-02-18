import { DisbursementStatusType } from "types";
import "./styles.scss";

export const DisbursementStatus = ({
  status,
}: {
  status: DisbursementStatusType;
}) => {
  switch (status) {
    case "DRAFT":
      return (
        <span className="DisbursementStatus DisbursementStatus--disabled">
          Draft
        </span>
      );
    case "READY":
      return <span className="DisbursementStatus">Ready</span>;
    case "STARTED":
      return <span className="DisbursementStatus">Started</span>;
    case "PAUSED":
      return (
        <span className="DisbursementStatus DisbursementStatus--disabled">
          Paused
        </span>
      );
    case "COMPLETED":
      return (
        <span className="DisbursementStatus DisbursementStatus--success">
          Completed
        </span>
      );
    default:
      return null;
  }
};
