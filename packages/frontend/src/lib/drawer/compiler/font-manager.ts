export interface FontManager {
  currentFont: string;
  currentSize: number;
  sizeMap: Record<string, number>;
}

export function mkFontManager(initFont: string, initSize: number): FontManager {
  const sizeMap: Record<string, number> = {};
  sizeMap[initFont] = initSize;
  return {
    currentFont: initFont,
    currentSize: initSize,
    sizeMap,
  }
}