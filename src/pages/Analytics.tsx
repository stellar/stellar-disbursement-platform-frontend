import { Heading } from "@stellar/design-system";
import { DashboardAnalytics } from "components/DashboardAnalytics";
import { SectionHeader } from "components/SectionHeader";

export const Analytics = () => {
  return (
    <>
      <SectionHeader>
        <SectionHeader.Row>
          <SectionHeader.Content>
            <Heading as="h2" size="sm">
              Analytics
            </Heading>
          </SectionHeader.Content>
        </SectionHeader.Row>
      </SectionHeader>

      <DashboardAnalytics />
    </>
  );
};
