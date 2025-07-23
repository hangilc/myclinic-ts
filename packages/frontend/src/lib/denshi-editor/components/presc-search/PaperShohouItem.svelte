<script lang="ts">
  import type { RP剤情報 } from "@/lib/denshi-shohou/presc-info";
  import type { Text, Visit } from "myclinic-model";
  import { parseShohou as parseShohou3 } from "@/lib/parse-shohou3";
  import { getRP剤情報FromGroup, shohouToPrescInfo } from "../../denshi-tmpl";
  import { resolveDrugGroupByMap } from "@/practice/exam/record/text/regular/helper";

  export let text: Text;
  export let at: string;
  export let onSelect: (group: RP剤情報[]) => void;

  function toHTML(c: string): string {
    return c.replaceAll(/\r?\n/g, "<br />\n");
  }

  async function doSelect() {
        const shohou = parseShohou3(text.content);
    if (typeof shohou === "string") {
      alert(shohou);
      return;
    }
    let groups: RP剤情報[] = shohou.groups.map(g => getRP剤情報FromGroup(g));
    for(let group of groups){
      await resolveDrugGroupByMap(group, at);
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="top" on:click={doSelect}>
  {@html toHTML(text.content)}
</div>

<style>
  .top {
    font-size: 14px;
    cursor: pointer;
  }
</style>
