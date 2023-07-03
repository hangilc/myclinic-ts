import type { Kouhi } from "myclinic-model";
import type { Cover, KouhiData, KouhiProcessorArg } from "myclinic-rezept";
import { KouhiFutanNashi, KuniNanbyou, MaruToHibakushaNoKo } from "myclinic-rezept";

export function resolveKouhiData(kouhi: Kouhi): KouhiData {
  switch(Math.floor(kouhi.futansha / 1000000)) {
    case 54: { // 難病
      return KuniNanbyou;
    }
  }
  switch(Math.floor(kouhi.futansha / 1000)) {
    case 80137: { // 心身障害者医療費助成制度(負担なし)
      return KouhiFutanNashi(80);
    }
  }
  switch(kouhi.futansha) {
    case 82134008: {
      return MaruToHibakushaNoKo;
    }
  }
  return {
    houbetsu: 0,
    processor: ({ kakari }: KouhiProcessorArg): Cover => {
      return { kakari, remaining: kakari };
    }
  }
}