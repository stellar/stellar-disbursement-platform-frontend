import { useState } from "react";
import { Heading, Select } from "@stellar/design-system";

import { PAGE_LIMIT_OPTIONS } from "constants/settings";

import { SectionHeader } from "components/SectionHeader";
import { PaymentsTable } from "components/PaymentsTable";
import { Pagination } from "components/Pagination";

import { usePayments } from "apiQueries/usePayments";
import { renderTextWithCount } from "helpers/renderTextWithCount";

export const ReceiverPayments = ({ receiverId }: { receiverId: string }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);

  const {
    data: receiverPayments,
    error,
    isLoading,
    isFetching,
  } = usePayments({
    receiver_id: receiverId,
    page: currentPage.toString(),
    page_limit: pageLimit.toString(),
  });

  const maxPages = receiverPayments?.pagination?.pages || 1;

  const handlePageLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    event.preventDefault();
    setCurrentPage(1);
    setPageLimit(Number(event.target.value));
  };

  return (
    <div className="DetailsSection">
      <SectionHeader>
        <SectionHeader.Row>
          <SectionHeader.Content>
            <Heading as="h3" size="xs">
              {renderTextWithCount(receiverPayments?.pagination?.total || 0, "Payment", "Payments")}
            </Heading>
          </SectionHeader.Content>

          <SectionHeader.Content align="right">
            <div className="FiltersWithSearch__pageLimit">
              <Select
                id="receiver-payments-page-limit"
                fieldSize="sm"
                value={pageLimit}
                onChange={handlePageLimitChange}
              >
                {PAGE_LIMIT_OPTIONS.map((p) => (
                  <option key={p} value={p}>{`Show ${p} results`}</option>
                ))}
              </Select>
            </div>

            <Pagination
              currentPage={Number(currentPage)}
              maxPages={Number(maxPages)}
              onSetPage={(page) => {
                setCurrentPage(page);
              }}
              isLoading={isLoading || isFetching}
            />
          </SectionHeader.Content>
        </SectionHeader.Row>
      </SectionHeader>

      <PaymentsTable
        paymentItems={receiverPayments?.data || []}
        apiError={error?.message}
        isFiltersSelected={undefined}
        isLoading={isLoading || isFetching}
      />
    </div>
  );
};
