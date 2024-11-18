import { FloaterPlacement, Icon, Tooltip } from "@stellar/design-system";
import "./styles.scss";

interface InfoTooltipProps {
  children: React.ReactNode;
  infoText: React.ReactNode;
  placement?: FloaterPlacement;
}

export const InfoTooltip = ({
  children,
  infoText,
  placement = "right",
}: InfoTooltipProps) => {
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

interface OptionalInfoTooltipProps extends InfoTooltipProps {
  showTooltip?: boolean;
}

export const OptionalInfoTooltip = ({
  children,
  infoText,
  placement = "right",
  showTooltip = true,
}: OptionalInfoTooltipProps) => {
  if (!showTooltip) {
    return <>{children}</>;
  }

  return (
    <InfoTooltip infoText={infoText} placement={placement}>
      {children}
    </InfoTooltip>
  );
};
