import { Icon, Loader } from "@stellar/design-system";
import { SortDirection } from "types";
import "./styles.scss";

interface HeaderProps {
  children: JSX.Element | JSX.Element[];
}

const Header: React.FC<HeaderProps> = ({ children }: HeaderProps) => {
  return (
    <thead>
      <tr>{children}</tr>
    </thead>
  );
};

interface HeaderCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  textAlign?: "left" | "right" | "center";
  elementLeft?: React.ReactNode;
  sortDirection?: SortDirection;
  onSort?: () => void;
  width?: string;
}

const HeaderCell: React.FC<HeaderCellProps> = ({
  children,
  textAlign = "left",
  elementLeft,
  sortDirection,
  onSort,
  width,
  ...props
}: HeaderCellProps) => {
  if (sortDirection && onSort === undefined) {
    throw Error("onSort method is required for sorting");
  }

  const SortIconEl = () =>
    sortDirection ? (
      <span className="Table-v2__header__cell__sortIcon">
        <Icon.ChevronUp />
        <Icon.ChevronDown />
      </span>
    ) : null;

  const sortButtonProps = sortDirection
    ? {
        onClick: onSort,
        role: "button",
      }
    : {};

  return (
    <th
      {...(textAlign !== "left" ? { "data-text-align": textAlign } : {})}
      {...(sortDirection && sortDirection !== "default"
        ? { "aria-sort": sortDirection === "asc" ? "ascending" : "descending" }
        : {})}
      style={{ width }}
      {...props}
    >
      {elementLeft || sortDirection ? (
        <span className="Table-v2__header__cell" {...sortButtonProps}>
          {elementLeft ?? null} {children} <SortIconEl />
        </span>
      ) : (
        children
      )}
    </th>
  );
};

interface BodyProps {
  children: JSX.Element | JSX.Element[];
}

const Body: React.FC<BodyProps> = ({ children }: BodyProps) => {
  return <tbody>{children}</tbody>;
};

interface BodyRowProps {
  children: JSX.Element | JSX.Element[];
  isHighlighted?: boolean;
}

const BodyRow: React.FC<BodyRowProps> = ({
  children,
  isHighlighted,
}: BodyRowProps) => {
  return (
    <tr {...(isHighlighted ? { className: "Table-v2__row--highlighted" } : {})}>
      {children}
    </tr>
  );
};

interface BodyCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  width?: string;
  textAlign?: "left" | "right" | "center";
  allowOverflow?: boolean;
  wrap?: boolean;
}

const BodyCell: React.FC<BodyCellProps> = ({
  children,
  width,
  textAlign = "left",
  allowOverflow,
  wrap,
  ...props
}: BodyCellProps) => {
  return (
    <td
      {...(textAlign !== "left" ? { "data-text-align": textAlign } : {})}
      data-wrap={wrap}
      {...props}
    >
      {width ? (
        <span
          className={`Table-v2__cell--fixedWidth ${
            allowOverflow ? "Table-v2__cell--fixedWidth--allowOverflow" : ""
          }`}
          style={{ width }}
        >
          {children}
        </span>
      ) : (
        children
      )}
    </td>
  );
};

interface TableComponent {
  Header: React.FC<HeaderProps>;
  HeaderCell: React.FC<HeaderCellProps>;
  Body: React.FC<BodyProps>;
  BodyRow: React.FC<BodyRowProps>;
  BodyCell: React.FC<BodyCellProps>;
}

interface TableProps extends React.HtmlHTMLAttributes<HTMLTableElement> {
  children: JSX.Element[];
  isLoading?: boolean;
  isScrollable?: boolean;
}

export const Table: React.FC<TableProps> & TableComponent = ({
  children,
  isLoading,
  isScrollable,
}: TableProps) => {
  return (
    <div
      className={[
        "Table-v2__container",
        isLoading ? "Table-v2__container--loading" : "",
      ].join(" ")}
    >
      <div className="Table-v2__wrapper" data-scrollable={isScrollable}>
        <table className="Table-v2">{children}</table>
      </div>
      {isLoading ? <Loader /> : null}
    </div>
  );
};

Table.displayName = "Table";
Table.Header = Header;
Table.Header.displayName = "Table.Header";
Table.HeaderCell = HeaderCell;
Table.HeaderCell.displayName = "Table.HeaderCell";
Table.Body = Body;
Table.Body.displayName = "Table.Body";
Table.BodyRow = BodyRow;
Table.BodyRow.displayName = "Table.BodyRow";
Table.BodyCell = BodyCell;
Table.BodyCell.displayName = "Table.BodyCell";
