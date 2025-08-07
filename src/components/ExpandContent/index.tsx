import { useState } from "react";
import { Card, Icon } from "@stellar/design-system";
import { Title } from "components/Title";
import "./styles.scss";

interface ExpandContentProps {
  title: React.ReactElement | string;
  children: React.ReactElement | string;
}

export const ExpandContent: React.FC<ExpandContentProps> = ({
  title,
  children,
}: ExpandContentProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card>
      <div className="ExpandContent">
        <div
          className="ExpandContent__heading"
          role="button"
          onClick={(event) => {
            event.preventDefault();
            setIsOpen(!isOpen);
          }}
        >
          <Title size="md">{title}</Title>
          <div className="ExpandContent__icon">{isOpen ? <Icon.Minus /> : <Icon.Plus />}</div>
        </div>
        <div className={`ExpandContent__content ${isOpen ? "ExpandContent__content--open" : ""}`}>
          {/* Extra div is needed to handle the top padding */}
          <div>
            <div>{children}</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
