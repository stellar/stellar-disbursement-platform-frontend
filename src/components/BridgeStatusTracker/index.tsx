import { Button, Icon, Badge } from "@stellar/design-system";

import { BridgeIntegration } from "types";

import "./styles.scss";

interface BridgeStatusTrackerProps {
  kycStatus: BridgeIntegration["kyc_status"];
  onRefresh: () => void;
}

export const BridgeStatusTracker = ({ kycStatus, onRefresh }: BridgeStatusTrackerProps) => {
  const getKycLabel = () => {
    const { kyc_status, type } = kycStatus;
    if (kyc_status === "approved") {
      return type === "business" ? "KYB Approved" : "KYC Approved";
    }
    if (kyc_status === "rejected" || kyc_status === "offboarded") {
      return type === "business" ? "KYB Rejected" : "KYC Rejected";
    }
    if (kyc_status === "under_review") {
      return type === "business" ? "KYB Under Review" : "KYC Under Review";
    }
    return type === "business" ? "Complete KYB" : "Complete KYC";
  };

  const getStatusBadgeText = (status: string) => {
    switch (status) {
      case "approved":
        return "Completed";
      case "rejected":
      case "offboarded":
        return "Rejected";
      case "under_review":
        return "Under review";
      case "pending":
        return "Pending";
      default:
        return "Not started";
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
      case "offboarded":
        return "error";
      default:
        return "tertiary";
    }
  };

  const getKycTitle = () => {
    const { type } = kycStatus;
    return type === "business" ? "Know Your Business (KYB)" : "Know Your Customer (KYC)";
  };

  const kycApproved = kycStatus.kyc_status === "approved";
  const tosApproved = kycStatus.tos_status === "approved";
  const canCreateVirtualAccount = kycApproved && tosApproved;

  return (
    <div className="BridgeStatusTracker">
      <div className="BridgeStatusTracker__header">
        <div className="Note">Complete Bridge Setup</div>
        {!canCreateVirtualAccount && (
          <Button size="sm" variant="tertiary" onClick={onRefresh} icon={<Icon.RefreshCcw04 />}>
            Refresh status
          </Button>
        )}
      </div>

      <div className="BridgeStatusTracker__steps">
        <div className="BridgeStatusTracker__step">
          <div className="BridgeStatusTracker__stepContent">
            <div className="BridgeStatusTracker__stepInfo">
              <span className="BridgeStatusTracker__stepTitle">Terms of Service</span>
              <Badge variant={getBadgeVariant(kycStatus.tos_status)}>
                {getStatusBadgeText(kycStatus.tos_status)}
              </Badge>
            </div>
            {tosApproved ? (
              <Button size="sm" variant="tertiary" disabled icon={<Icon.CheckCircle />}>
                Approved
              </Button>
            ) : kycStatus.tos_link ? (
              <Button
                size="sm"
                variant="tertiary"
                onClick={() => window.open(kycStatus.tos_link, "_blank", "noopener,noreferrer")}
                icon={<Icon.LinkExternal01 />}
              >
                Accept terms
              </Button>
            ) : null}
          </div>
        </div>

        <div className="BridgeStatusTracker__step">
          <div className="BridgeStatusTracker__stepContent">
            <div className="BridgeStatusTracker__stepInfo">
              <span className="BridgeStatusTracker__stepTitle">{getKycTitle()}</span>
              <Badge variant={getBadgeVariant(kycStatus.kyc_status)}>
                {getStatusBadgeText(kycStatus.kyc_status)}
              </Badge>
            </div>
            {kycApproved ? (
              <Button size="sm" variant="tertiary" disabled icon={<Icon.CheckCircle />}>
                Approved
              </Button>
            ) : kycStatus.kyc_link ? (
              <Button
                size="sm"
                variant="tertiary"
                onClick={() => window.open(kycStatus.kyc_link, "_blank", "noopener,noreferrer")}
                icon={<Icon.LinkExternal01 />}
              >
                {getKycLabel()}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
