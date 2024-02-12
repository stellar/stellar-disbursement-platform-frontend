import { AppError } from "types";

export const ErrorWithExtras = ({ appError }: { appError: AppError }) => {
  return (
    <>
      <div>{appError.message}</div>
      {appError.extras ? (
        <ul className="ErrorExtras">
          {Object.entries(appError.extras).map(([key, value]) => (
            <li key={key}>{`${key}: ${value}`}</li>
          ))}
        </ul>
      ) : null}
    </>
  );
};
