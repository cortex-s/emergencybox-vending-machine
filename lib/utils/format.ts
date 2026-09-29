export function formatBaht(amount: number): string {
  return `฿${amount.toLocaleString("en-US")}`;
}

export const CATEGORY_LABELS: Record<string, string> = {
  FIRST_AID: "ปฐมพยาบาล",
  RAIN: "ของกันฝน",
  HYGIENE: "สุขอนามัย",
  ELECTRONICS: "อุปกรณ์อิเล็กทรอนิกส์",
};
