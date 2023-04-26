export const A4: [number, number] = [210, 297];
export const A5: [number, number] = [148, 210];
export const A6: [number, number] = [105, 148];
export const B4: [number, number] = [257, 364];
export const B5: [number, number] = [182, 257];
export const B6: [number, number] = [128, 182];

export function landscape(upright: [number, number]): [number, number] {
  const [w, h] = upright;
  return [h, w];
}