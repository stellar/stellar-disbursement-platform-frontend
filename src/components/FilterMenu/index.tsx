import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Button, Icon, Floater } from "@stellar/design-system";
import "./styles.scss";

interface FilterMenuProps {
  children: JSX.Element | JSX.Element[];
  onSubmit: () => void;
  onReset: () => void;
  isSubmitDisabled: boolean;
  isResetDisabled: boolean;
}

export const FilterMenu: React.FC<FilterMenuProps> = ({
  children,
  onSubmit,
  onReset,
  isSubmitDisabled,
  isResetDisabled,
}: FilterMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLFormElement | null>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as Node;

    if (contentRef?.current?.contains(target) || buttonRef?.current?.contains(target)) {
      return;
    }

    setIsOpen(false);
  }, []);

  useLayoutEffect(() => {
    if (isOpen) {
      document.addEventListener("pointerup", handleClickOutside);
    } else {
      document.removeEventListener("pointerup", handleClickOutside);
    }

    return () => {
      document.removeEventListener("pointerup", handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  const toggleOpen = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    setIsOpen(!isOpen);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsOpen(false);
    onSubmit();
  };

  const handleReset = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsOpen(false);
    onReset();
  };

  return (
    <Floater
      triggerEl={
        <div ref={buttonRef}>
          <Button variant="tertiary" size="sm" icon={<Icon.FilterLines />} onClick={toggleOpen}>
            Filter
          </Button>
        </div>
      }
      placement="bottom"
      isVisible={isOpen}
      isContrast={false}
    >
      <form ref={contentRef} className="FilterMenu" onSubmit={handleSubmit} onReset={handleReset}>
        <div className="FilterMenu__inputs">{children}</div>

        <div className="FilterMenu__buttons">
          <Button size="sm" variant="tertiary" type="reset" disabled={isResetDisabled}>
            Reset
          </Button>
          <Button size="sm" variant="primary" type="submit" disabled={isSubmitDisabled}>
            Apply
          </Button>
        </div>
      </form>
    </Floater>
  );
};
