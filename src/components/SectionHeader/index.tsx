import "./styles.scss";

const SectionHeaderRow = ({ children }: { children: React.ReactNode }) => {
  return <div className="SectionHeader__row">{children}</div>;
};

const SectionHeaderContent = ({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) => {
  const additionalClasses = [
    ...(align !== "left" ? [`SectionHeader__container--${align}`] : []),
  ].join(" ");

  return (
    <div className={`SectionHeader__container ${additionalClasses}`}>
      {children}
    </div>
  );
};

export const SectionHeader = ({ children }: { children: React.ReactNode }) => {
  return <div className="SectionHeader">{children}</div>;
};

SectionHeader.Row = SectionHeaderRow;
SectionHeader.Content = SectionHeaderContent;
