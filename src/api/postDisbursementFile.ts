import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/envVariables";

export const postDisbursementFile = async (
  token: string,
  disbursementId: string,
  file: File,
) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_URL}/disbursements/${disbursementId}/instructions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );

  return handleApiResponse(response);
};
