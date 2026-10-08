import { Icon } from "@stellar/design-system";

import "./styles.scss";

interface EmptyStateMessageProps {
  icon?: React.ReactNode;
  message: string;
  variant?: "inline" | "stacked";
  description?: string;
}

export const EmptyStateMessage = ({
  icon = <Icon.Key01 />,
  message,
  variant = "inline",
  description,
}: EmptyStateMessageProps) => (
  <div className={`EmptyStateMessage EmptyStateMessage--${variant}`}>
    {icon}
    <span className="EmptyStateMessage__message">{message}</span>
    {variant === "stacked" && description ? (
      <span className="EmptyStateMessage__description">{description}</span>
    ) : null}
  </div>
);
