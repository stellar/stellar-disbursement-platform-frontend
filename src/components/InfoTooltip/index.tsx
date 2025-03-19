import { FloaterPlacement, Icon, Tooltip } from "@stellar/design-system";
import "./styles.scss";

interface InfoTooltipProps {
  children: React.ReactNode;
  infoText: React.ReactNode;
  placement?: FloaterPlacement;
  hideTooltip?: boolean;
  showCheckMark?: boolean;
}

export const InfoTooltip = ({
  children,
  infoText,
  placement = "right",
  hideTooltip = false,
  showCheckMark = false,
}: InfoTooltipProps) => {
  if (hideTooltip) {
    return <>{children}</>;
  }

  return (
    <div className="InfoTooltip">
      {children}
      <Tooltip
        triggerEl={
          <div className="InfoTooltip__button">
            {showCheckMark ? <Icon.CheckCircle color="green" /> : <Icon.Info />}
          </div>
        }
        placement={placement}
      >
        {infoText}
      </Tooltip>
    </div>
  );
};
