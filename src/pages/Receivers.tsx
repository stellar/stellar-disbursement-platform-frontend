import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Heading, Icon, Input, Select } from "@stellar/design-system";
import { useDispatch } from "react-redux";

import { AppDispatch } from "store";
import { exportDataAction } from "store/ducks/dataExport";

import { FilterMenu } from "components/FilterMenu";
import { SearchInput } from "components/SearchInput";
import { SectionHeader } from "components/SectionHeader";
import { Pagination } from "components/Pagination";
import { ReceiversTable } from "components/ReceiversTable";

import { useReceivers } from "apiQueries/useReceivers";
import { PAGE_LIMIT_OPTIONS, Routes } from "constants/settings";
import { number } from "helpers/formatIntlNumber";
import { CommonFilters, SortByReceivers, SortDirection, SortParams } from "types";

export const Receivers = () => {
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
  const [queryFilters, setQueryFilters] = useState<CommonFilters & SortParams>({});
  const [searchQuery, setSearchQuery] = useState<{ q: string } | undefined>();

  const {
    data: receivers,
    error,
    isLoading,
    isFetching,
  } = useReceivers({
    page: currentPage.toString(),
    page_limit: pageLimit.toString(),
    ...queryFilters,
    ...searchQuery,
  });

  const isFiltersSelected = Object.values(filters).filter((v) => Boolean(v)).length > 0;

  const navigate = useNavigate();

  const maxPages = receivers?.pagination?.pages || 1;
  const isSearchInProgress = Boolean(searchQuery && (isLoading || isFetching));

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

  const handleSort = (sort?: SortByReceivers, direction?: SortDirection) => {
    const isDefaultSort = !sort || !direction || direction === "default";

    setCurrentPage(1);
    setQueryFilters(isDefaultSort ? filters : { ...filters, sort, direction });
  };

  const dispatch: AppDispatch = useDispatch();

  const handleExport = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if (isLoading || isFetching) {
      return;
    }

    dispatch(
      exportDataAction({
        exportType: "receivers",
        searchParams: filters,
      }),
    );
  };

  const handlePageLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    event.preventDefault();

    const pageLimit = Number(event.target.value);
    setCurrentPage(1);
    setPageLimit(pageLimit);
  };

  const handleReceiverClicked = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    receiverId: string,
  ) => {
    event.preventDefault();
    navigate(`${Routes.RECEIVERS}/${receiverId}`);
  };

  return (
    <>
      <SectionHeader>
        <SectionHeader.Row>
          <SectionHeader.Content>
            <Heading as="h2" size="sm">
              {receivers?.pagination?.total && receivers.pagination.total > 0
                ? `${number.format(receivers.pagination.total)} `
                : ""}
              Receivers
            </Heading>
          </SectionHeader.Content>
        </SectionHeader.Row>

        <SectionHeader.Row>
          <SectionHeader.Content>
            <div className="FiltersWithSearch__search">
              <SearchInput
                id="receivers-search"
                placeholder="Search by contact info"
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
                  <option value="REGISTERED">Registered</option>
                  {/* TODO: put back when ready */}
                  {/* <option value="FLAGGED">Flagged</option> */}
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
                id="receivers-page-limit"
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

      <ReceiversTable
        receiversItems={receivers?.data || []}
        onReceiverClicked={handleReceiverClicked}
        searchQuery={searchQuery?.q}
        apiError={error?.message}
        isFiltersSelected={isFiltersSelected}
        isLoading={isLoading || isFetching}
        onSort={handleSort}
      />
    </>
  );
};
