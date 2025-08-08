import { FormEvent, useState } from "react";
import { Icon, Input, Loader } from "@stellar/design-system";
import "./styles.scss";

interface SearchInputProps {
  id: string;
  placeholder: string;
  onSubmit: (text: string) => void;
  onClear: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const SearchInput = ({
  id,
  placeholder,
  onSubmit,
  onClear,
  isLoading,
  disabled,
}: SearchInputProps) => {
  const [searchText, setSearchText] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(searchText);
  };

  const handleChange = (event: FormEvent<HTMLInputElement>) => {
    const val = event.currentTarget.value;

    if (val) {
      setSearchText(val);
    } else {
      setSearchText("");
      onClear();
    }
  };

  return (
    <form className="SearchInput" onSubmit={handleSubmit}>
      <Input
        fieldSize="sm"
        id={id}
        placeholder={placeholder}
        onChange={handleChange}
        value={searchText}
        type="search"
        disabled={Boolean(disabled)}
      />

      <button className="SearchInput__button" disabled={isLoading || !searchText} type="submit">
        {isLoading ? <Loader /> : <Icon.SearchSm />}
      </button>
    </form>
  );
};
