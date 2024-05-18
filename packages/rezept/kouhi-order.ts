import { type RezeptKouhi } from "./rezept-types";

const KouhiOrder: number[] = [
  13, 14, 18, 29, 30, 10, 11, 20, 21, 15,
  16, 24, 22, 28, 17, 79, 19, 23, 52, 54,
  51, 38, 53, 66, 62, 25, 12
];

const KouhiOrderWeights: Record<number, number> = {};

KouhiOrder.forEach((houbetsu, i) => {
  KouhiOrderWeights[houbetsu] = i + 1;
})

export function getKouhiOrderWeight(houbetsuBangou: number): number {
  let w = KouhiOrderWeights[houbetsuBangou];
  if (w === undefined) {
    return 200;
  } else {
    return w + 10;
  }
}

export function houbetsuOfFutansha(futansha: number): number {
  return Math.floor(futansha / 1000000);
}

export function sortKouhiList(src: RezeptKouhi[]) {
  function w(k: RezeptKouhi): number {
    return houbetsuOfFutansha(k.futansha);
  }
  src.sort((a, b) => getKouhiOrderWeight(w(a)) - getKouhiOrderWeight(w(b)));
}
