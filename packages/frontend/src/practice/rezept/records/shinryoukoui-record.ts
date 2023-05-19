function mk診療行為レコード({

}: {

}): string {
  return [
    "SI", // 1 レコード識別情報
  ].join(",");
}

export function create診療行為レコード({

}: {

}): string {
  return mk診療行為レコード({

  });
}
