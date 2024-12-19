import { API_URL } from "constants/envVariables";
import { getSdpTenantName } from "helpers/getSdpTenantName";
import { DisbursementsSearchParams } from "types";
import { handleSearchParams } from "api/handleSearchParams";

export const getDisbursementsExport = async (
  token: string,
  searchParams?: DisbursementsSearchParams,
): Promise<void> => {
  const params = handleSearchParams(searchParams);

  const response = await fetch(`${API_URL}/exports/disbursements${params}`, {
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
    : `disbursements_${new Date().toISOString().split("T")[0]}.csv`;

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
