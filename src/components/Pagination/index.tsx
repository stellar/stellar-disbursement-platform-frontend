import { useState } from "react";
import { Button, Icon, Input } from "@stellar/design-system";
import "./styles.scss";

interface PaginationProps {
  currentPage: number;
  maxPages: number;
  onSetPage: (page: number) => void;
  isLoading: boolean;
}

export const Pagination = ({ currentPage, maxPages, onSetPage, isLoading }: PaginationProps) => {
  const [page, setPage] = useState<number | undefined>();
  const isError = (page || 0) > maxPages;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setPage(Number(event.target.value));
  };

  const handleBlur = (
    event: React.FormEvent<HTMLFormElement> | React.FocusEvent<HTMLInputElement>,
  ) => {
    event.preventDefault();

    if (!isError && page) {
      onSetPage(page);
      setPage(undefined);
    }
  };

  const handlePageChange = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    direction: "prev" | "next",
  ) => {
    event.preventDefault();
    const newPage = direction === "prev" ? currentPage - 1 : currentPage + 1;
    onSetPage(newPage);
  };

  return (
    <div className="Pagination-v2">
      <span>Page</span>
      <form className="Pagination-v2__input" onSubmit={handleBlur}>
        <Input
          id="current-page"
          fieldSize="sm"
          value={page || currentPage}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={maxPages === 1 || isLoading}
          isError={isError}
        />
      </form>
      <span>of {maxPages}</span>
      <div className="Pagination-v2__buttons">
        <Button
          size="md"
          variant="tertiary"
          icon={<Icon.ChevronLeft />}
          onClick={(event) => handlePageChange(event, "prev")}
          disabled={isError || isLoading || currentPage === 1}
        />
        <Button
          size="md"
          variant="tertiary"
          icon={<Icon.ChevronRight />}
          onClick={(event) => handlePageChange(event, "next")}
          disabled={isError || isLoading || currentPage === maxPages}
        />
      </div>
    </div>
  );
};
