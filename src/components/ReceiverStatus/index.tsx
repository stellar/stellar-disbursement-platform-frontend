import { ReceiverStatus as ReceiverStatusType } from "types";
import "./styles.scss";

export const ReceiverStatus = ({ status }: { status: ReceiverStatusType }) => {
  switch (status) {
    case "DRAFT":
      return <span className="ReceiverStatus">Draft</span>;
    case "FLAGGED":
      return <span className="ReceiverStatus">Flagged</span>;
    case "READY":
      return (
        <span className="ReceiverStatus ReceiverStatus--accent">Ready</span>
      );
    case "REGISTERED":
      return (
        <span className="ReceiverStatus ReceiverStatus--accent">
          Registered
        </span>
      );
    default:
      return null;
  }
};
