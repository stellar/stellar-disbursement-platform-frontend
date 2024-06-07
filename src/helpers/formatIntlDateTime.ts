// TODO: customize locale
export const formatDateTimeWithGmt = (dateTime?: string) => {
  const date = dateTime ? new Date(dateTime) : new Date();
  const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "shortOffset",
  });

  return dateTimeFormatter.format(date);
};

export const formatDateTime = (dateTime?: string) => {
  const date = dateTime ? new Date(dateTime) : new Date();
  const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return dateTimeFormatter.format(date);
};

export const formatDateTimeWithSeconds = (dateTime?: string) => {
  const date = dateTime ? new Date(dateTime) : new Date();
  const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });

  return dateTimeFormatter.format(date);
};
