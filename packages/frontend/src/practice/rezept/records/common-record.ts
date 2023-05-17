export function createレセプト胸痛レコード({
  レセプト番号,
  レセプト種別,
}: {
  レセプト番号: number;
  レセプト種別: number;
}): string {
  return [
    "RE", // 1 レコード識別情報
    レセプト番号, // 2
    レセプト種別, // 3
  ].join(",");
}