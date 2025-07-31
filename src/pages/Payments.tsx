import { useState } from "react";
import { Button, Heading, Icon, Input, Select, Notification } from "@stellar/design-system";
import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";

import { AppDispatch } from "store";
import { exportDataAction } from "store/ducks/dataExport";

import { FilterMenu } from "components/FilterMenu";
import { Pagination } from "components/Pagination";
import { PaymentsTable } from "components/PaymentsTable";
import { SearchInput } from "components/SearchInput";
import { SectionHeader } from "components/SectionHeader";
import { DirectPaymentCreateModal } from "components/DirectPaymentCreateModal/DirectPaymentCreateModal";
import { ErrorWithExtras } from "components/ErrorWithExtras";

import { usePayments } from "apiQueries/usePayments";
import { useCreateDirectPayment } from "apiQueries/useCreateDirectPayment";
import { PAGE_LIMIT_OPTIONS } from "constants/settings";
import { number } from "helpers/formatIntlNumber";
import { CommonFilters, CreateDirectPaymentRequest } from "types";

export const Payments = () => {
  const [isSearchInProgress] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [isDirectPaymentModalVisible, setIsDirectPaymentModalVisible] = useState(false);

  const initFilters: CommonFilters = {
    status: "",
    created_at_after: "",
    created_at_before: "",
  };

  const [filters, setFilters] = useState<CommonFilters>(initFilters);
  const [queryFilters, setQueryFilters] = useState<CommonFilters>({});
  const [searchQuery, setSearchQuery] = useState<{ q: string } | undefined>();

  const queryClient = useQueryClient();

  const {
    data: payments,
    error,
    isLoading,
    isFetching,
  } = usePayments({
    page: currentPage.toString(),
    page_limit: pageLimit.toString(),
    ...queryFilters,
    ...searchQuery,
  });

  const {
    mutateAsync: createDirectPayment,
    isPending: isCreatingPayment,
    error: createPaymentError,
    reset: resetCreatePaymentQuery,
  } = useCreateDirectPayment({
    onSuccess: () => {
      setIsDirectPaymentModalVisible(false);
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });

  const isFiltersSelected = Object.values(filters).filter((v) => Boolean(v)).length > 0;

  const maxPages = payments?.pagination?.pages || 1;

  const handleSearchChange = (searchText?: string) => {
    setCurrentPage(1);
    setSearchQuery(searchText ? { q: searchText } : undefined);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFilters({
      ...filters,
      [event.target.id]: event.target.value,
    });
  };

  const handleFilterSubmit = () => {
    setCurrentPage(1);
    setQueryFilters(filters);
  };

  const handleFilterReset = () => {
    setCurrentPage(1);
    setFilters(initFilters);
    setQueryFilters(initFilters);
  };

  const dispatch: AppDispatch = useDispatch();

  const handleExport = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if (isLoading || isFetching) {
      return;
    }

    dispatch(
      exportDataAction({
        exportType: "payments",
        searchParams: filters,
      }),
    );
  };

  const handlePageLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    event.preventDefault();
    setCurrentPage(1);
    setPageLimit(Number(event.target.value));
  };

  const handleCreateDirectPayment = () => {
    setIsDirectPaymentModalVisible(true);
  };

  const handleCloseDirectPaymentModal = () => {
    setIsDirectPaymentModalVisible(false);
    resetCreatePaymentQuery();
  };

  const handleSubmitDirectPayment = async (paymentData: CreateDirectPaymentRequest) => {
    await createDirectPayment(paymentData);
  };

  return (
    <>
      <SectionHeader>
        <SectionHeader.Row>
          <SectionHeader.Content>
            <Heading as="h2" size="sm">
              {payments?.pagination?.total && payments.pagination.total > 0
                ? `${number.format(payments.pagination.total)} `
                : ""}
              Payments
            </Heading>
          </SectionHeader.Content>

          <SectionHeader.Content align="right">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCreateDirectPayment}
              disabled={isLoading || isFetching}
            >
              Create Direct Payment
            </Button>
          </SectionHeader.Content>
        </SectionHeader.Row>

        <SectionHeader.Row>
          <SectionHeader.Content>
            <div className="FiltersWithSearch__search">
              <SearchInput
                id="payments-search"
                placeholder="Search payment info"
                onSubmit={handleSearchChange}
                onClear={handleSearchChange}
                isLoading={isSearchInProgress}
              />
            </div>

            <FilterMenu
              onSubmit={handleFilterSubmit}
              onReset={handleFilterReset}
              isSubmitDisabled={!isFiltersSelected}
              isResetDisabled={false}
            >
              <div className="FilterMenu__item">
                <Select
                  id="status"
                  fieldSize="sm"
                  label="Status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value=""></option>
                  <option value="ALL">All</option>
                  <option value="DRAFT">Draft</option>
                  <option value="READY">Ready</option>
                  <option value="PENDING">Pending</option>
                  <option value="PAUSED">Paused</option>
                  <option value="SUCCESS">Success</option>
                  <option value="FAILED">Failed</option>
                  <option value="CANCELED">Canceled</option>
                </Select>
              </div>

              <div className="FilterMenu__item">
                <Input
                  label="Created after"
                  id="created_at_after"
                  fieldSize="sm"
                  type="date"
                  value={filters.created_at_after}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="FilterMenu__item">
                <Input
                  label="Created before"
                  id="created_at_before"
                  fieldSize="sm"
                  type="date"
                  value={filters.created_at_before}
                  onChange={handleFilterChange}
                />
              </div>
            </FilterMenu>

            <Button
              variant="tertiary"
              size="sm"
              icon={<Icon.Download01 />}
              onClick={handleExport}
              disabled={isLoading || isFetching}
            >
              Export
            </Button>
          </SectionHeader.Content>

          <SectionHeader.Content align="right">
            <div className="FiltersWithSearch__pageLimit">
              <Select
                id="payments-page-limit"
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
              onSetPage={(page) => setCurrentPage(page)}
              isLoading={isLoading || isFetching}
            />
          </SectionHeader.Content>
        </SectionHeader.Row>
      </SectionHeader>

      {createPaymentError && (
        <Notification variant="error" title="Error">
          <ErrorWithExtras
            appError={{
              message: createPaymentError.message,
            }}
          />
        </Notification>
      )}

      <PaymentsTable
        paymentItems={payments?.data || []}
        apiError={error?.message}
        isFiltersSelected={isFiltersSelected}
        isLoading={isLoading || isFetching}
      />

      <DirectPaymentCreateModal
        visible={isDirectPaymentModalVisible}
        onClose={handleCloseDirectPaymentModal}
        onSubmit={handleSubmitDirectPayment}
        onResetQuery={resetCreatePaymentQuery}
        isLoading={isCreatingPayment}
        errorMessage={createPaymentError?.message}
      />
    </>
  );
};
