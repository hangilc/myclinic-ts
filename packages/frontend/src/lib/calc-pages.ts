export function calcPages(total: number, itemsPerPage: number): number {
  return Math.floor((total + itemsPerPage - 1) / itemsPerPage);
}