import { API_URL } from "@/constants/envVariables";
import { getSdpTenantName } from "@/helpers/getSdpTenantName";
import { handleSearchParams } from "@/api/handleSearchParams";
import { Export } from "@/types";

export const getExport = async <T>(
  token: string,
  type: Export,
  searchParams?: T,
): Promise<void> => {
  const params = handleSearchParams(searchParams);

  const response = await fetch(`${API_URL}/exports/${type}${params}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "SDP-Tenant-Name": getSdpTenantName(),
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const contentDisposition = response.headers.get("content-disposition");
  const filename = contentDisposition
    ? contentDisposition.split("filename=")[1]
    : `${type}_${new Date().toISOString().split("T")[0]}.csv`;

  // Create a download from the response
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
