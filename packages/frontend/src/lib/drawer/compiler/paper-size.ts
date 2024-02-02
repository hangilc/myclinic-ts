export interface PaperSize {
  width: number;
  height: number;
}

export function landscape(ps: PaperSize): PaperSize {
  return {
    width: ps.height,
    height: ps.width,
  }
}

export const A4 = {
  width: 210, 
  height: 297,
}

export const A5 = {
  width: 148, 
  height: 210,
}

export const A6 = {
  width: 105, 
  height: 148,
}

export const B4 = {
  width: 257, 
  height: 364,
}

export const B5 = {
  width: 182, 
  height: 257,
}

export const B6 = {
  width: 128, 
  height: 182,
}
