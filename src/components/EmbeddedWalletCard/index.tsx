import { Button, Card, Heading, Icon } from "@stellar/design-system";
import React from "react";

import "./styles.scss";

type EmbeddedWalletCardProps = {
  title: string;
  tableHeaders: [string, string];
  renderTableContent?: () => React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmbeddedWalletCard = ({
  title,
  tableHeaders,
  renderTableContent,
  actionLabel,
  onAction,
}: EmbeddedWalletCardProps) => {
  return (
    <Card>
      <div className="EmbeddedWalletCard">
        <Heading as="h3" size="xs" className="EmbeddedWalletCard__title">
          {title}
        </Heading>
        <div className="EmbeddedWalletCard__table">
          <div className="EmbeddedWalletCard__tableHeader">
            <span>{tableHeaders[0]}</span>
            <span>{tableHeaders[1]}</span>
          </div>
          <div className="EmbeddedWalletCard__divider" aria-hidden="true" />
          {renderTableContent ? renderTableContent() : null}
        </div>
        {actionLabel ? (
          <Button size="lg" variant="primary" icon={<Icon.ChevronDown />} onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </Card>
  );
};
