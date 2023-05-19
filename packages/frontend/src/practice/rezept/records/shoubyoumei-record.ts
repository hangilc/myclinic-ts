function mk症病名レコード({
  傷病名コード
}: {
  傷病名コード: number;
}): string {
  return [
    "SY", // 1 レコード識別情報
    傷病名コード.toString(), // 2
  ].join(",");
}

export function create症病名レコード({

}: {

}): string {
  return mk症病名レコード({

  });
}