export function isKensa(patientId: number, content: string): boolean {
  const re = new RegExp(`^${patientId}\\s+\\d+/\\d+/\\d+.+\n検査結果：`)
  return re.test(content);
}
