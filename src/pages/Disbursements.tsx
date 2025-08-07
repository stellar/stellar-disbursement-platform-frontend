import { useEffect, useState } from "react";
import { Button, Heading, Icon, Input, Select } from "@stellar/design-system";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { FilterMenu } from "components/FilterMenu";
import { DisbursementsTable } from "components/DisbursementsTable";
import { NewDisbursementButton } from "components/NewDisbursementButton";
import { Pagination } from "components/Pagination";
import { SearchInput } from "components/SearchInput";
import { SectionHeader } from "components/SectionHeader";
import { ShowForRoles } from "components/ShowForRoles";

import { PAGE_LIMIT_OPTIONS, Routes, UI_STATUS_DISBURSEMENT } from "constants/settings";
import { number } from "helpers/formatIntlNumber";
import { useRedux } from "hooks/useRedux";
import { AppDispatch } from "store";
import {
  getDisbursementsAction,
  getDisbursementsWithParamsAction,
} from "store/ducks/disbursements";
import { exportDataAction } from "store/ducks/dataExport";
import { resetDisbursementDetailsAction } from "store/ducks/disbursementDetails";
import { setDraftIdAction } from "store/ducks/disbursementDrafts";
import { CommonFilters, SortByDisbursements, SortDirection } from "types";

export const Disbursements = () => {
  const { disbursements } = useRedux("disbursements");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);

  const INIT_STATUS = UI_STATUS_DISBURSEMENT;

  const initFilters: CommonFilters = {
    // We don't want to show DRAFTS here
    status: INIT_STATUS,
    created_at_after: "",
    created_at_before: "",
  };

  const [filters, setFilters] = useState<CommonFilters>(initFilters);

  const isFiltersSelected =
    Object.values(filters)
      // Filter out init status, so that UI doesn't treat it as selected value
      .filter((v) => v !== INIT_STATUS)
      .filter((v) => Boolean(v)).length > 0;

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getDisbursementsAction());
    dispatch(resetDisbursementDetailsAction());
    dispatch(setDraftIdAction(undefined));
  }, [dispatch]);

  const apiError =
    disbursements.status === "ERROR" && disbursements.errorString
      ? disbursements.errorString
      : undefined;
  const maxPages = disbursements.pagination?.pages || 1;
  const isSearchInProgress = Boolean(
    disbursements.searchParams?.q && disbursements.status === "PENDING",
  );

  const goToDrafts = () => {
    navigate(Routes.DISBURSEMENT_DRAFTS);
  };

  const handleSearchChange = (searchText?: string) => {
    dispatch(
      getDisbursementsWithParamsAction({
        page: "1",
        ...filters,
        q: searchText,
      }),
    );

    setCurrentPage(1);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFilters({
      ...filters,
      [event.target.id]: event.target.value,
    });
  };

  const handleFilterSubmit = () => {
    dispatch(
      getDisbursementsWithParamsAction({
        page: "1",
        ...filters,
      }),
    );

    setCurrentPage(1);
  };

  const handleFilterReset = () => {
    dispatch(
      getDisbursementsWithParamsAction({
        page: "1",
        ...initFilters,
      }),
    );

    setFilters(initFilters);
    setCurrentPage(1);
  };

  const handleSort = (sort?: SortByDisbursements, direction?: SortDirection) => {
    if (!sort || !direction || direction === "default") {
      dispatch(
        getDisbursementsWithParamsAction({
          page: "1",
          sort: undefined,
          direction: undefined,
        }),
      );
    } else {
      dispatch(
        getDisbursementsWithParamsAction({
          page: "1",
          sort,
          direction,
        }),
      );
    }

    setCurrentPage(1);
  };

  const handleExport = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();

    if (disbursements.status === "PENDING") {
      return;
    }

    dispatch(
      exportDataAction({
        exportType: "disbursements",
        searchParams: disbursements.searchParams,
      }),
    );
  };

  const handlePageLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    event.preventDefault();

    const pageLimit = Number(event.target.value);
    setPageLimit(pageLimit);
    setCurrentPage(1);

    // Need to make sure we'll be loading page 1
    dispatch(
      getDisbursementsWithParamsAction({
        page_limit: pageLimit.toString(),
        page: "1",
      }),
    );
  };

  return (
    <>
      <SectionHeader>
        <SectionHeader.Row>
          <SectionHeader.Content>
            <Heading as="h2" size="sm">
              {disbursements.pagination?.total && disbursements.pagination.total > 0
                ? `${number.format(disbursements.pagination.total)} `
                : ""}
              Disbursements
            </Heading>
          </SectionHeader.Content>
          <SectionHeader.Content align="right">
            <ShowForRoles acceptedRoles={["owner", "financial_controller"]}>
              <Button
                variant="tertiary"
                size="sm"
                icon={<Icon.Edit05 />}
                iconPosition="right"
                onClick={goToDrafts}
              >
                Drafts
              </Button>
            </ShowForRoles>
            <NewDisbursementButton />
          </SectionHeader.Content>
        </SectionHeader.Row>

        <SectionHeader.Row>
          <SectionHeader.Content>
            <div className="FiltersWithSearch__search">
              <SearchInput
                id="disbursements-search"
                placeholder="Search by disbursement name"
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
                  <option value="STARTED">Started</option>
                  <option value="PAUSED">Paused</option>
                  <option value="COMPLETED">Completed</option>
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
              isLoading={disbursements.status === "PENDING"}
            >
              Export
            </Button>
          </SectionHeader.Content>

          <SectionHeader.Content align="right">
            <div className="FiltersWithSearch__pageLimit">
              <Select
                id="disbursements-page-limit"
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
                dispatch(getDisbursementsWithParamsAction({ page: page.toString() }));
              }}
              isLoading={disbursements.status === "PENDING"}
            />
          </SectionHeader.Content>
        </SectionHeader.Row>
      </SectionHeader>

      <DisbursementsTable
        disbursementItems={disbursements.items}
        searchParams={disbursements.searchParams}
        apiError={apiError}
        isFiltersSelected={isFiltersSelected}
        status={disbursements.status}
        onSort={handleSort}
      />
    </>
  );
};
