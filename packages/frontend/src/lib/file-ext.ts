export function getFileExtension(f: string): string | undefined {
  return f.split(".").pop();
}
