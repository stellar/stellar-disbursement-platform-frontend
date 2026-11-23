import Papa from "papaparse";

const KNOWN_COLUMNS = [
  "phone",
  "email",
  "id",
  "amount",
  "verification",
  "paymentID",
  "walletAddress",
  "walletAddressMemo",
];

const UTF16_32_BOMS = [
  [0xff, 0xfe],
  [0xfe, 0xff],
  [0x00, 0x00, 0xfe, 0xff],
];

export type DisbursementCsv = {
  header: string[];
  rows: string[][];
  columns: Record<string, number>;
};

const startsWith = (bytes: Uint8Array, prefix: number[]) =>
  prefix.every((byte, index) => bytes[index] === byte);

// Reads the file the way the backend does: UTF-8, comma-separated, LF or CRLF line breaks.
export const readDisbursementCsv = async (file: File): Promise<DisbursementCsv> => {
  let bytes = new Uint8Array(await file.arrayBuffer());
  if (UTF16_32_BOMS.some((bom) => startsWith(bytes, bom))) {
    throw new Error("The file must be UTF-8 encoded; UTF-16 and UTF-32 files are not supported");
  }
  if (bytes.includes(0)) {
    throw new Error("The file contains NUL bytes and is not a text CSV");
  }
  while (startsWith(bytes, [0xef, 0xbb, 0xbf])) {
    bytes = bytes.subarray(3);
  }

  // Decoded here, not with FileReader, which switches to UTF-16 on a byte order mark.
  const text = new TextDecoder("utf-8", { ignoreBOM: true }).decode(bytes).replaceAll("\r\n", "\n");
  const { data, errors } = Papa.parse<string[]>(text, {
    delimiter: ",",
    newline: "\n",
    quoteChar: '"',
    skipEmptyLines: true,
  });
  if (errors.length > 0) {
    throw new Error(`CSV parsing error: ${errors[0].message}`);
  }

  const [header = [], ...rows] = data;
  const columns: Record<string, number> = {};
  header.forEach((cell, index) => {
    const name = cell.replace(/^[ \t]+|[ \t]+$/g, "");
    if (!KNOWN_COLUMNS.includes(name)) return;
    if (name in columns) {
      throw new Error(`The ${name} column appears more than once`);
    }
    columns[name] = index;
  });

  const badRow = rows.findIndex((row) => row.length !== header.length);
  if (badRow >= 0) {
    throw new Error(
      `Line ${badRow + 2} has ${rows[badRow].length} fields but the header has ${header.length}`,
    );
  }

  return { header, rows, columns };
};
