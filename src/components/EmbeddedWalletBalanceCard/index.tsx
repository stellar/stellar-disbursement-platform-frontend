import React from "react";

import { Button, Heading, Icon } from "@stellar/design-system";

import { Box } from "@/components/Box";

import "./styles.scss";

type EmbeddedWalletBalanceCardProps = {
  title: string;
  tableHeaders: string[];
  renderTableContent?: () => React.ReactElement | React.ReactElement[] | null;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmbeddedWalletBalanceCard = ({
  title,
  tableHeaders,
  renderTableContent,
  actionLabel,
  onAction,
}: EmbeddedWalletBalanceCardProps) => {
  return (
    <Box gap="md">
      <Heading as="h3" size="xs" className="EmbeddedWalletBalanceCard__title">
        {title}
      </Heading>
      <Box gap="md">
        <Box
          gap="sm"
          direction="row"
          justify="space-between"
          align="center"
          addlClassName="EmbeddedWalletBalanceCard__tableHeader"
        >
          {tableHeaders.map((header, index) => (
            <span key={`${header}-${index}`}>{header}</span>
          ))}
        </Box>
        <div className="EmbeddedWalletBalanceCard__divider" aria-hidden="true" />
        {renderTableContent ? (
          <Box gap="md" addlClassName="EmbeddedWalletBalanceCard__rows">
            {renderTableContent()}
          </Box>
        ) : (
          <></>
        )}
      </Box>
      {actionLabel ? (
        <Button size="lg" variant="primary" icon={<Icon.ChevronDown />} onClick={onAction}>
          {actionLabel}
        </Button>
      ) : (
        <></>
      )}
    </Box>
  );
};
