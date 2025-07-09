import "./styles.scss";

interface EmbeddedWalletStatusProps {
  status: string;
}

export const EmbeddedWalletStatus = ({ status }: EmbeddedWalletStatusProps) => {
  const normalizedStatus = status.toUpperCase();

  switch (normalizedStatus) {
    case "SUCCESS":
      return (
        <span className="EmbeddedWalletStatus EmbeddedWalletStatus--success">
          Success
        </span>
      );
    case "FAILED":
      return <span className="EmbeddedWalletStatus">Failed</span>;
    case "PROCESSING":
      return <span className="EmbeddedWalletStatus">Processing</span>;
    case "PENDING":
    default:
      return <span className="EmbeddedWalletStatus">Pending</span>;
  }
};
