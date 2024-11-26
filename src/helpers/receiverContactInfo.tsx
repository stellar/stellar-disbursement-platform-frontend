export const getReceiverContactInfoTitle = (
  phoneNumber?: string,
  email?: string,
) => {
  const array = [phoneNumber, email].filter((i) => Boolean(i));
  return array.join(" | ");
};

export const renderReceiverContactInfoItems = (
  phoneNumber?: string,
  email?: string,
) => {
  return (
    <>
      {phoneNumber ? (
        <span className="ReceiverContactInfo__item">{phoneNumber}</span>
      ) : null}
      {email ? (
        <span className="ReceiverContactInfo__item">{email}</span>
      ) : null}
    </>
  );
};
