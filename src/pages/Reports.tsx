import { Heading } from "@stellar/design-system";

import { SectionHeader } from "@/components/SectionHeader";
import { TransactionNoticeCard } from "@/components/TransactionNoticeCard";
import { WalletStatementCard } from "@/components/WalletStatementCard";

export const Reports = () => {
  return (
    <>
      <SectionHeader>
        <SectionHeader.Row>
          <SectionHeader.Content>
            <Heading as="h2" size="sm">
              Reports / Exports
            </Heading>
          </SectionHeader.Content>
        </SectionHeader.Row>
      </SectionHeader>

      <div className="CardStack">
        <WalletStatementCard />
        <TransactionNoticeCard />
      </div>
    </>
  );
};
