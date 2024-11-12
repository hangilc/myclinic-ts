export interface Kubun {
  kubunName: string,
  name: string,
  tensuu: number,
  count: number,
}

export interface ShinryoumeisaishoData {
  patientId: string,
  patientName: string,
  visitedAt: string, // YYYY-MM-DD
  kubunList: Kubun[],
  clinicAddress: string,
  clinicName: string,
}