<script lang="ts">
  import type { RP剤情報 } from "@/lib/denshi-shohou/presc-info";
  import type { Text, Visit } from "myclinic-model";
  import { parseShohou as parseShohou3 } from "@/lib/parse-shohou3";
  import { getRP剤情報FromGroup, shohouToPrescInfo } from "../../denshi-tmpl";
  import { resolveDrugGroupByMap } from "@/practice/exam/record/text/regular/helper";

  export let text: Text;
  export let onSelect: (group: RP剤情報[]) => void;
  export let selectedName: string | undefined = undefined;

  function toHTML(c: string): string {
    if( selectedName ){
      c = c.replaceAll(selectedName, `<span style="color: red">${selectedName}</span>`)
    }
    return c.replaceAll(/\r?\n/g, "<br />\n");
  }

  async function doSelect() {
    const shohou = parseShohou3(text.content);
    if (typeof shohou === "string") {
      alert(shohou);
      return;
    }
    let groups: RP剤情報[] = shohou.groups.map((g) => getRP剤情報FromGroup(g));
    for (let group of groups) {
      await resolveDrugGroupByMap(group);
    }
    onSelect(groups);
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
