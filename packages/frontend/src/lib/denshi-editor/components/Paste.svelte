<script lang="ts">
  import Title from "./workarea/Title.svelte";
  import Workarea from "./workarea/Workarea.svelte";
  import Commands from "./workarea/Commands.svelte";
  import { parseShohou } from "@/lib/parse-shohou3";
  import { getRP剤情報FromGroup } from "../denshi-tmpl";
  import { resolveDrugGroupByMap, resolveUsageRecordByMap } from "@/practice/exam/record/text/regular/helper";
  import { RP剤情報Edit } from "../denshi-edit";

  export let edit: { inputValue: string };
  export let destroy: () => void;
  export let onEnter: (value: RP剤情報Edit[]) => void;

  function doCancel(): void {
    destroy();
  }

  async function doEnter() {
    let shohou = parseShohou(edit.inputValue);
    if (typeof shohou === "string") {
      alert(shohou);
      return;
    }
    let groups = shohou.groups.map((g) => getRP剤情報FromGroup(g));
    for(let g of groups){
      await resolveDrugGroupByMap(g);
      await resolveUsageRecordByMap(g.用法レコード);
    }
    let data: RP剤情報Edit[] = groups.map(g => RP剤情報Edit.fromObject(g));
    destroy();
    onEnter(data);
  }
</script>

<Workarea>
  <Title>貼付</Title>
  <div>
    <textarea class="textarea" bind:value={edit.inputValue} />
  </div>
  <Commands>
    <button on:click={doEnter}>入力</button>
    <button on:click={doCancel}>キャンセル</button>
  </Commands>
</Workarea>

<style>
  .textarea {
    width: 100%;
    height: 200px;
    box-sizing: border-box;
    resize: vertical;
  }
</style>
