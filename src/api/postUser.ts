import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/settings";
import { ApiNewUser, NewUser } from "types";

export const postUser = async (
  token: string,
  newUser: NewUser,
): Promise<ApiNewUser> => {
  const response = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      roles: [newUser.role],
      email: newUser.email,
    }),
  });

  return handleApiResponse(response);
};
