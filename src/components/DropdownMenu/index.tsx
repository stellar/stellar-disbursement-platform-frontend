import { Floater } from "@stellar/design-system";
import { NavLink } from "react-router-dom";
import "./styles.scss";

interface DropdownMenuProps {
  triggerEl: JSX.Element;
  children: JSX.Element | JSX.Element[];
}

interface DropdownMenuComponent {
  Item: React.FC<DropdownMenuItemProps>;
}

export const DropdownMenu: React.FC<DropdownMenuProps> & DropdownMenuComponent = ({
  triggerEl,
  children,
}: DropdownMenuProps) => {
  return (
    <Floater triggerEl={triggerEl} placement="bottom" hasActiveInsideClick isContrast={false}>
      <div className="DropdownMenu">{children}</div>
    </Floater>
  );
};

interface DropdownMenuItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  to?: string;
  isHighlight?: boolean;
}

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  children,
  to,
  isHighlight,
  ...props
}: DropdownMenuItemProps) => {
  const handleNavLinkStyle = ({ isActive }: { isActive: boolean }) => {
    return ["DropdownMenu__item", isActive ? "DropdownMenu__item--current" : null]
      .filter(Boolean)
      .join(" ");
  };

  // Route/nav links must have "to" prop
  if (to) {
    return (
      <NavLink className={handleNavLinkStyle} to={to} {...props}>
        {children}
      </NavLink>
    );
  }

  const styleClasses = [
    "DropdownMenu__item",
    ...(isHighlight ? ["DropdownMenu__item--highlight"] : []),
  ].join(" ");

  return (
    <a role="button" className={styleClasses} {...props}>
      {children}
    </a>
  );
};

DropdownMenu.displayName = "DropdownMenu";
DropdownMenu.Item = DropdownMenuItem;
