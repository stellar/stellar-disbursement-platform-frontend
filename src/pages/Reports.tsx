import { Heading } from "@stellar/design-system";

import { AccountStatementCard } from "@/components/AccountStatementCard";
import { LoadingContent } from "@/components/LoadingContent";
import { SectionHeader } from "@/components/SectionHeader";
import { TransactionNoticeCard } from "@/components/TransactionNoticeCard";

import { NotFound } from "@/pages/NotFound";

import { useRedux } from "@/hooks/useRedux";

export const Reports = () => {
  const { organization } = useRedux("organization");

  // The page exists only while the organization has reporting switched on (Settings → Enable Reports).
  // The status is unset until the first organization fetch starts.
  if (!organization.status || organization.status === "PENDING") return <LoadingContent />;
  if (!organization.data.reporting_enabled) return <NotFound />;

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
        <AccountStatementCard />
        <TransactionNoticeCard />
      </div>
    </>
  );
};
