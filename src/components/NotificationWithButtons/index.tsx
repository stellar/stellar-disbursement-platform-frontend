import { Link, Notification } from "@stellar/design-system";
import "./styles.scss";

interface NotificationWithButtonsProps {
  variant: "primary" | "secondary" | "success" | "error" | "warning";
  title: string;
  icon?: React.ReactNode;
  buttons: {
    label: string;
    onClick: () => void;
  }[];
  children: string | React.ReactNode;
}

export const NotificationWithButtons: React.FC<
  NotificationWithButtonsProps
> = ({
  variant,
  title,
  icon,
  buttons,
  children,
}: NotificationWithButtonsProps) => {
  return (
    <Notification variant={variant} title={title} icon={icon}>
      <div>{children}</div>

      <div className="Notification__buttons">
        {buttons.map((b) => (
          <Link role="button" onClick={b.onClick} key={`btn-${b.label}`}>
            {b.label}
          </Link>
        ))}
      </div>
    </Notification>
  );
};
