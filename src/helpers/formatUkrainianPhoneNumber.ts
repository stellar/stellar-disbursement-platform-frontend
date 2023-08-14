export const formatUkrainianPhoneNumber = (phoneNumber: string) => {
  const sanitizedNumber = phoneNumber?.trim();
  // +380 44 xxx-xx-xx
  if (sanitizedNumber.startsWith("+380") && sanitizedNumber.length === 13) {
    const match = sanitizedNumber.match(
      /^(\+380)(\d{2})(\d{3})(\d{2})(\d{2})$/s,
    );
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]}-${match[4]}-${match[5]}`;
    }
  }

  return sanitizedNumber;
};
