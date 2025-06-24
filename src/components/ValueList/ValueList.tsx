import "./styles.scss";

interface ValuesListProps {
  values: string[];
  emptyMessage?: string;
  isMonospace?: boolean;
}

export const ValuesList = ({
  values,
  emptyMessage = "No values",
  isMonospace = false,
}: ValuesListProps) => {
  if (!values || values.length === 0) {
    return <div className="ValuesList__empty">{emptyMessage}</div>;
  }

  return (
    <ul className={`ValuesList ${isMonospace ? "ValuesList--monospace" : ""}`}>
      {values.map((value, index) => (
        <li key={index} className="ValuesList__item">
          {value}
        </li>
      ))}
    </ul>
  );
};
