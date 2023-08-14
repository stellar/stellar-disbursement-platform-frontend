import { Button, Icon, Input } from "@stellar/design-system";
import "./styles.scss";

interface PaginationProps {
  currentPage: number;
  maxPages: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (currentPage: number) => void;
  onPrevious: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onNext: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  isLoading: boolean;
}

export const Pagination = ({
  currentPage,
  maxPages,
  onChange,
  onBlur,
  onPrevious,
  onNext,
  isLoading,
}: PaginationProps) => {
  const isError = currentPage > maxPages;

  const handleBlur = (
    event:
      | React.FormEvent<HTMLFormElement>
      | React.FocusEvent<HTMLInputElement>,
  ) => {
    event.preventDefault();

    if (!isError) {
      onBlur(currentPage);
    }
  };

  return (
    <div className="Pagination-v2">
      <span>Page</span>
      <form className="Pagination-v2__input" onSubmit={handleBlur}>
        <Input
          id="current-page"
          fieldSize="sm"
          value={currentPage}
          onChange={onChange}
          onBlur={handleBlur}
          disabled={maxPages === 1 || isLoading}
          isError={isError}
        />
      </form>
      <span>of {maxPages}</span>
      <div className="Pagination-v2__buttons">
        <Button
          size="sm"
          variant="secondary"
          icon={<Icon.ChevronLeft />}
          onClick={onPrevious}
          disabled={isError || isLoading || currentPage === 1}
        />
        <Button
          size="sm"
          variant="secondary"
          icon={<Icon.ChevronRight />}
          onClick={onNext}
          disabled={isError || isLoading || currentPage === maxPages}
        />
      </div>
    </div>
  );
};
