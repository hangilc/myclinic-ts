import { handleIyakuhinTekiyouOfVisits } from "iyakuhin-item-util";
import { RezeptVisit } from "rezept-types";
import { handleShinryouTekiyouOfVisits } from "shinryoukoui-item-util";
import { Combiner } from "tekiyou-item";
import { TensuuCollector } from "tensuu-collector";
import { handleKizaiTekiyouOfVisits } from "tokuteikizai-item-util";

export function calcVisits(visits: RezeptVisit[], collector: TensuuCollector, comb: Combiner): void {
  handleShinryouTekiyouOfVisits(visits, comb);
  handleIyakuhinTekiyouOfVisits(visits, comb);
  handleKizaiTekiyouOfVisits(visits, comb);
  comb.iter((shikibetsu, futanKubun, ten, count) => {
    collector.add(futanKubun, ten * count);
  });
}
