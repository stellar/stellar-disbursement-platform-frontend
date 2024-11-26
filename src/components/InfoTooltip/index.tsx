import { FloaterPlacement, Icon, Tooltip } from "@stellar/design-system";
import "./styles.scss";

interface InfoTooltipProps {
  children: React.ReactNode;
  infoText: React.ReactNode;
  placement?: FloaterPlacement;
  hideTooltip?: boolean;
}

export const InfoTooltip = ({
  children,
  infoText,
  placement = "right",
  hideTooltip = false,
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
            <Icon.Info />
          </div>
        }
        placement={placement}
      >
        {infoText}
      </Tooltip>
    </div>
  );
};
