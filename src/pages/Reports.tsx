import { Heading } from "@stellar/design-system";

import { LoadingContent } from "@/components/LoadingContent";
import { SectionHeader } from "@/components/SectionHeader";
import { TransactionNoticeCard } from "@/components/TransactionNoticeCard";
import { WalletStatementCard } from "@/components/WalletStatementCard";

import { NotFound } from "@/pages/NotFound";

import { useAppConfig } from "@/hooks/useAppConfig";

export const Reports = () => {
  // The page exists only while the organization has reporting switched on (Settings → Enable Reports).
  const { isReportingEnabled, isLoading } = useAppConfig();
  if (isLoading) return <LoadingContent />;
  if (!isReportingEnabled) return <NotFound />;

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
