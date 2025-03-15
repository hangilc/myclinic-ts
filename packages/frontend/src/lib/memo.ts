export function memoToJson(memo: string | undefined ): any {
  if( memo === undefined ){
    return ({});
  } else {
    return JSON.parse(memo);
  }
}

export function jsonToMemo(json: any): string | undefined {
  if( typeof(json) === "object" && Object.keys(json).length === 0 ){
    return undefined;
  } else {
    return JSON.stringify(json);
  }
}
