import { useQuery } from "@tanstack/react-query";

import { getAppConfig } from "@/api/getAppConfig";

export const useAppConfig = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["appConfig"],
    queryFn: getAppConfig,
  });

  return {
    isReportingEnabled: data?.reporting_enabled ?? false,
    isLoading,
  };
};
