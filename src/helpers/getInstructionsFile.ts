import { getDisbursementInstructions } from "@/api/getDisbursementInstructions";

export const getInstructionsFile = async ({
  token,
  disbursementId,
  fileName,
}: {
  token: string;
  disbursementId: string;
  fileName: string;
}): Promise<File> => {
  const file = await getDisbursementInstructions(token, disbursementId);

  return new File([file], fileName, {
    type: file.type,
  });
};
