import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Heading, Select } from "@stellar/design-system";

import { AppDispatch } from "store";
import {
  getReceiverPaymentsAction,
  getReceiverPaymentsWithParamsAction,
} from "store/ducks/receiverPayments";
import { useRedux } from "hooks/useRedux";
import { PAGE_LIMIT_OPTIONS } from "constants/settings";

import { SectionHeader } from "components/SectionHeader";
import { PaymentsTable } from "components/PaymentsTable";
import { Pagination } from "components/Pagination";
import { renderTextWithCount } from "helpers/renderTextWithCount";

export const ReceiverPayments = ({ receiverId }: { receiverId: string }) => {
  const { receiverPayments } = useRedux("receiverPayments");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);

  const dispatch: AppDispatch = useDispatch();

  const maxPages = receiverPayments.pagination?.pages || 1;

  useEffect(() => {
    if (receiverId) {
      dispatch(getReceiverPaymentsAction(receiverId));
    }
  }, [receiverId, dispatch]);

  const handlePageLimitChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    event.preventDefault();

    const pageLimit = Number(event.target.value);
    setPageLimit(pageLimit);
    setCurrentPage(1);

    if (receiverId) {
      // Need to make sure we'll be loading page 1
      dispatch(
        getReceiverPaymentsWithParamsAction({
          receiver_id: receiverId,
          page_limit: pageLimit.toString(),
          page: "1",
        }),
      );
    }
  };

  return (
    <div className="DetailsSection">
      <SectionHeader>
        <SectionHeader.Row>
          <SectionHeader.Content>
            <Heading as="h3" size="sm">
              {renderTextWithCount(
                receiverPayments.pagination?.total || 0,
                "Payment",
                "Payments",
              )}
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

                if (receiverId) {
                  dispatch(
                    getReceiverPaymentsWithParamsAction({
                      receiver_id: receiverId,
                      page: page.toString(),
                    }),
                  );
                }
              }}
              isLoading={receiverPayments.status === "PENDING"}
            />
          </SectionHeader.Content>
        </SectionHeader.Row>
      </SectionHeader>

      <PaymentsTable
        paymentItems={receiverPayments.items}
        apiError={receiverPayments.errorString}
        isFiltersSelected={undefined}
        isLoading={receiverPayments.status === "PENDING"}
      />
    </div>
  );
};
