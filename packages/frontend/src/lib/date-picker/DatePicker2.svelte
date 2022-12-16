<script lang="ts">
  import SurfacePulldown from "../SurfacePulldown.svelte";
  import type { Invalid } from "../validator";
  import * as kanjidate from "kanjidate";
  import GengouPart from "./GengouPart.svelte";
  import NenPart from "./NenPart.svelte";

  export let date: Date;
  export let destroy: () => void;
  export let anchor: HTMLElement | SVGSVGElement;
  export let gengouList: string[] = ["昭和", "平成", "令和"];
  let gengou: string;
  let nen: number;
  let month: number;
  let day: number;
  let errors: Invalid[];
  init(date);

  function init(d: Date): void {
    errors = [];
    const wareki = kanjidate.toGengou(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );
    gengou = wareki.gengou;
    nen = wareki.nen;
    month = date.getMonth() + 1;
    day = date.getDate();
  }

  function onGengouChange(g: string): void {
    console.log("g change", g);
  }

  function onNenChange(n: number): void {
    
  }

</script>

<SurfacePulldown {destroy} {anchor}>
  <div class="top-row">
    <GengouPart {gengou} {gengouList} onChange={onGengouChange}/>
    <NenPart {nen} {gengou} onChange={onNenChange} />
  </div>
</SurfacePulldown>

<style>
.top-row {
  display: flex;
  align-items: center;
}
</style>
