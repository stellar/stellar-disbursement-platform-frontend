import { API_URL } from "constants/envVariables";

export async function getOrgLogo(): Promise<string> {
  const response = await fetch(`${API_URL}/organization/logo`);

  const responseBlob = await response.blob();
  return URL.createObjectURL(responseBlob);
}
