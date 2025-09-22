import { FloaterPlacement, Icon, Tooltip } from "@stellar/design-system";
import "./styles.scss";

const ICONS = {
  info: <Icon.InfoCircle />,
  check: <Icon.CheckCircle color="green" />,
};

interface InfoTooltipProps {
  children: React.ReactNode;
  infoText: React.ReactNode;
  placement?: FloaterPlacement;
  hideTooltip?: boolean;
  icon?: "info" | "check";
}

export const InfoTooltip = ({
  children,
  infoText,
  placement = "right",
  hideTooltip = false,
  icon = "info",
}: InfoTooltipProps) => {
  if (hideTooltip) {
    return <>{children}</>;
  }

  const iconComponent = ICONS[icon];

  return (
    <div className="InfoTooltip">
      {children}
      <Tooltip
        triggerEl={<div className="InfoTooltip__button">{iconComponent}</div>}
        placement={placement}
      >
        {infoText}
      </Tooltip>
    </div>
  );
};
