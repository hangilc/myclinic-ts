export function formatVisitText(s: string): string {
  if( s === "" ){
    return "（空白）";
  } else {
    return s.replaceAll("\n", "<br />\n");
  }
}
