export interface FontSizeManager {
  currentSize: number | undefined;
  sizeMap: Record<string, number>;
}

export function mkFontManager(): FontSizeManager {
  return {
    currentSize: undefined,
    sizeMap: {}
  }
}

export function registerFontSize(fsm: FontSizeManager, name: string, fontSize: number) {
  fsm.sizeMap[name] = fontSize;
}

export function setFont(fsm: FontSizeManager, name: string) {
  const size = fsm.sizeMap[name];
  if( size == null ){
    throw new Error(`Unknown font: ${name}`);
  }
  fsm.currentSize = size;
}
