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

const enUsDateOptions: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
};

const enUsTimeOptions: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "2-digit",
};

export const formatDate = (dateTime?: string) => {
  const date = dateTime ? new Date(dateTime) : new Date();
  return new Intl.DateTimeFormat("en-US", enUsDateOptions).format(date);
};

export const formatTime = (dateTime?: string) => {
  const date = dateTime ? new Date(dateTime) : new Date();
  return new Intl.DateTimeFormat("en-US", enUsTimeOptions).format(date);
};

export const formatDateTime = (dateTime?: string) => {
  const date = dateTime ? new Date(dateTime) : new Date();
  const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
    ...enUsDateOptions,
    ...enUsTimeOptions,
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
