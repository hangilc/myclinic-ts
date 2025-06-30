export function isKensa(patientId: number, content: string): boolean {
  const re = new RegExp(`^0*${patientId}\\s+\\d+/\\d+/\\d+.+\n検査結果：`)
  return re.test(content);
}
