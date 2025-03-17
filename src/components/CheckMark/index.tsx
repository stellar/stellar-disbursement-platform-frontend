import { FloaterPlacement, Icon, Tooltip } from "@stellar/design-system";
import "./styles.scss";

interface CheckMarkProps {
  children: React.ReactNode;
  infoText: React.ReactNode;
  placement?: FloaterPlacement;
  hideCheckMark?: boolean;
}

export const CheckMark = ({
  children,
  infoText,
  placement = "right",
  hideCheckMark = false,
}: CheckMarkProps) => {
  if (hideCheckMark) {
    return <>{children}</>;
  }

  return (
    <div className="CheckMark">
      {children}
      <Tooltip
        triggerEl={
          <div className="CheckMark__button">
            <Icon.CheckCircle color="green" />
          </div>
        }
        placement={placement}
      >
        {infoText ? infoText : null}
      </Tooltip>
    </div>
  );
};
