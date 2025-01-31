import React from "react";
import { Link, Notification } from "@stellar/design-system";
import "./styles.scss";

interface NotificationWithButtonsProps {
  variant: "primary" | "secondary" | "success" | "error" | "warning";
  title: string;
  icon?: React.ReactNode;
  buttons?: {
    label: string;
    onClick: () => void;
  }[];
  children: string | React.ReactNode;
}

export const NotificationWithButtons = React.forwardRef<
  HTMLDivElement,
  NotificationWithButtonsProps
>(({ variant, title, icon, buttons, children }, ref) => {
  return (
    <div ref={ref} className="NotificationWithButtons__wrapper">
      <Notification variant={variant} title={title} icon={icon}>
        <div>{children}</div>

        {buttons && (
          <div className="Notification__buttons">
            {buttons.map((b) => (
              <Link role="button" onClick={b.onClick} key={`btn-${b.label}`}>
                {b.label}
              </Link>
            ))}
          </div>
        )}
      </Notification>
    </div>
  );
});

NotificationWithButtons.displayName = "NotificationWithButtons";
