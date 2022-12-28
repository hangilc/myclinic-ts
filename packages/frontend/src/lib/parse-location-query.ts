export function parseLocationQuery(): Record<string, string> {
  if( window ){
    const result: Record<string, string> = {};
    window.location.search.substring(1).split("&").forEach(item => {
      const i = item.indexOf("=");
      if( i >= 0 ){
        const k = item.substring(0, i);
        const v = item.substring(i+1);
        result[k] = v;
      } else {
        result[item] = "";
      }
    });
    return result;
  } else {
    return {};
  }
}