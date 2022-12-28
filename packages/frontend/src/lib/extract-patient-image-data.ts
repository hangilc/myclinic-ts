const pat1 = /(19[89]\d|20\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])/;
const pat2 = /(19[89]\d|20\d{2})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])/;

export function extractPatientImageDate(fileName: string): string | undefined {
  let m = pat1.exec(fileName);
  if( m != undefined ){
    return m[0];
  } 
  m = pat2.exec(fileName);
  if( m != undefined ){
    return m[0].replaceAll("-", "");
  }
  return undefined;
}