import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Heading, Icon, Input, Select } from "@stellar/design-system";

import { FilterMenu } from "components/FilterMenu";
import { SearchInput } from "components/SearchInput";
import { SectionHeader } from "components/SectionHeader";
import { Pagination } from "components/Pagination";
import { ReceiversTable } from "components/ReceiversTable";

import { PAGE_LIMIT_OPTIONS, Routes } from "constants/settings";
import { number } from "helpers/formatIntlNumber";
import { useRedux } from "hooks/useRedux";
import { AppDispatch } from "store";
import {
  getReceiversAction,
  getReceiversWithParamsAction,
} from "store/ducks/receivers";
import { CommonFilters, SortByReceivers, SortDirection } from "types";

export const Receivers = () => {
  const { receivers } = useRedux("receivers");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);

  const initFilters: CommonFilters = {
    status: "",
    created_at_after: "",
    created_at_before: "",
  };

  const [filters, setFilters] = useState<CommonFilters>(initFilters);

  const isFiltersSelected =
    Object.values(filters).filter((v) => Boolean(v)).length > 0;

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getReceiversAction());
  }, [dispatch]);

  const apiError = receivers.status === "ERROR" && receivers.errorString;
  const maxPages = receivers.pagination?.pages || 1;
  const isSearchInProgress = Boolean(
    receivers.searchParams?.q && receivers.status === "PENDING",
  );

  const handleSearchChange = (searchText?: string) => {
    dispatch(
      getReceiversWithParamsAction({
        page: "1",
        ...filters,
        q: searchText,
      }),
    );

    setCurrentPage(1);
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
    dispatch(
      getReceiversWithParamsAction({
        page: "1",
        ...filters,
      }),
    );

    setCurrentPage(1);
  };

  const handleFilterReset = () => {
    dispatch(
      getReceiversWithParamsAction({
        page: "1",
        ...initFilters,
      }),
    );

    setFilters(initFilters);
    setCurrentPage(1);
  };

  const handleSort = (sort?: SortByReceivers, direction?: SortDirection) => {
    if (!sort || !direction || direction === "default") {
      dispatch(
        getReceiversWithParamsAction({
          page: "1",
          sort: undefined,
          direction: undefined,
        }),
      );
    } else {
      dispatch(
        getReceiversWithParamsAction({
          page: "1",
          sort,
          direction,
        }),
      );
    }

    setCurrentPage(1);
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

    const pageLimit = Number(event.target.value);
    setPageLimit(pageLimit);
    setCurrentPage(1);

    // Need to make sure we'll be loading page 1
    dispatch(
      getReceiversWithParamsAction({
        page_limit: pageLimit.toString(),
        page: "1",
      }),
    );
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
              {receivers.pagination?.total && receivers.pagination.total > 0
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
                placeholder="Search by phone number"
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
                dispatch(
                  getReceiversWithParamsAction({ page: page.toString() }),
                );
              }}
              isLoading={receivers.status === "PENDING"}
            />
          </SectionHeader.Content>
        </SectionHeader.Row>
      </SectionHeader>

      <ReceiversTable
        receiversItems={receivers.items}
        onReceiverClicked={handleReceiverClicked}
        searchParams={receivers.searchParams}
        apiError={apiError}
        isFiltersSelected={isFiltersSelected}
        status={receivers.status}
        onSort={handleSort}
      />
    </>
  );
};
