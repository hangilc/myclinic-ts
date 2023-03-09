export function castStringProp(obj: any, name: string): string {
  if( typeof obj === "object" ){
    const value = obj[name];
    if( typeof value === "string" ){
      return value;
    } else {
      throw new Error("Cannot find string property: " + name);
    }
  } else {
    throw new Error("Object expected: " + obj);
  }
}

export function castOptStringProp(obj: any, name: string): string | undefined {
  if( typeof obj === "object" ){
    const value = obj[name];
    if( typeof value === "string" ){
      return value;
    } else if( value == undefined ){
      return undefined;
    } else {
      throw new Error("Cannot find string property: " + name);
    }
  } else {
    throw new Error("Object expected: " + obj);
  }
}

