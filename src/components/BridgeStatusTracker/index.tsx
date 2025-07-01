import { Button, Icon } from "@stellar/design-system";

import { BridgeIntegration } from "types";

import "./styles.scss";

interface BridgeStatusTrackerProps {
  kycStatus: BridgeIntegration["kyc_status"];
  onRefresh: () => void;
}

export const BridgeStatusTracker = ({
  kycStatus,
  onRefresh,
}: BridgeStatusTrackerProps) => {
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

  const kycApproved = kycStatus.kyc_status === "approved";
  const tosApproved = kycStatus.tos_status === "approved";
  const canCreateVirtualAccount = kycApproved && tosApproved;

  return (
    <div className="BridgeStatusTracker">
      <div className="BridgeStatusTracker__header">
        <h4>Complete Bridge Setup</h4>
        {!canCreateVirtualAccount && (
          <Button
            size="xs"
            variant="tertiary"
            onClick={onRefresh}
            icon={<Icon.RefreshVert />}
          >
            Refresh Status
          </Button>
        )}
      </div>

      <div className="BridgeStatusTracker__steps">
        <div className="BridgeStatusTracker__step">
          <div className="BridgeStatusTracker__stepHeader">
            <span
              className="BridgeStatusTracker__statusDot"
              data-status={kycStatus.kyc_status}
            />
            <span>{getKycLabel()}</span>
            <span
              className="BridgeStatusTracker__statusText"
              data-status={kycStatus.kyc_status}
            >
              {kycStatus.kyc_status.toLowerCase()}
            </span>
          </div>
          {kycStatus.kyc_status !== "approved" && kycStatus.kyc_link && (
            <a
              href={kycStatus.kyc_link}
              target="_blank"
              rel="noopener noreferrer"
              className="BridgeStatusTracker__link"
            >
              Upload Documents
              <Icon.ExternalLink className="BridgeStatusTracker__linkIcon" />
            </a>
          )}
        </div>

        <div className="BridgeStatusTracker__step">
          <div className="BridgeStatusTracker__stepHeader">
            <span
              className="BridgeStatusTracker__statusDot"
              data-status={kycStatus.tos_status}
            />
            <span>Terms of Service</span>
            <span
              className="BridgeStatusTracker__statusText"
              data-status={kycStatus.tos_status}
            >
              {kycStatus.tos_status.toLowerCase()}
            </span>
          </div>
          {kycStatus.tos_status === "pending" && kycStatus.tos_link && (
            <a
              href={kycStatus.tos_link}
              target="_blank"
              rel="noopener noreferrer"
              className="BridgeStatusTracker__link"
            >
              Accept Terms
              <Icon.ExternalLink className="BridgeStatusTracker__linkIcon" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
