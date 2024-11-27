import { useState } from "react";
import { Button, Heading, Icon, Input, Select } from "@stellar/design-system";

import { FilterMenu } from "components/FilterMenu";
import { Pagination } from "components/Pagination";
import { PaymentsTable } from "components/PaymentsTable";
import { SearchInput } from "components/SearchInput";
import { SectionHeader } from "components/SectionHeader";

import { usePayments } from "apiQueries/usePayments";
import { PAGE_LIMIT_OPTIONS } from "constants/settings";
import { number } from "helpers/formatIntlNumber";
import { CommonFilters } from "types";

export const Payments = () => {
  const [isSearchInProgress] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);

  const initFilters: CommonFilters = {
    status: "",
    created_at_after: "",
    created_at_before: "",
  };

  const [filters, setFilters] = useState<CommonFilters>(initFilters);
  // Using extra param to trigger API call when we want, not on every filter
  // state change
  const [queryFilters, setQueryFilters] = useState<CommonFilters>({});

  const {
    data: payments,
    error,
    isLoading,
    isFetching,
  } = usePayments({
    page: currentPage.toString(),
    page_limit: pageLimit.toString(),
    ...queryFilters,
  });

  const isFiltersSelected =
    Object.values(filters).filter((v) => Boolean(v)).length > 0;

  const maxPages = payments?.pagination?.pages || 1;

  const handleSearchSubmit = () => {
    alert("TODO: search submit");
  };

  const handleSearchClear = () => {
    alert("TODO: search clear");
  };

  const handleFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
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

  const handleExport = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault();
    alert("TODO: handle export");
  };

  const handlePageLimitChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    event.preventDefault();
    setCurrentPage(1);
    setPageLimit(Number(event.target.value));
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
        </SectionHeader.Row>

        <SectionHeader.Row>
          <SectionHeader.Content>
            <div className="FiltersWithSearch__search">
              <SearchInput
                id="payments-search"
                placeholder="Search by payment ID"
                onSubmit={handleSearchSubmit}
                onClear={handleSearchClear}
                isLoading={isSearchInProgress}
                disabled
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
              variant="secondary"
              size="sm"
              icon={<Icon.Download />}
              onClick={handleExport}
              disabled={true}
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

      <PaymentsTable
        paymentItems={payments?.data || []}
        apiError={error?.message}
        isFiltersSelected={isFiltersSelected}
        isLoading={isLoading || isFetching}
      />
    </>
  );
};
