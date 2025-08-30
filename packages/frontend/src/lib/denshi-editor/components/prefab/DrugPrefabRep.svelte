<script lang="ts">
  import { drugRep } from "@/lib/denshi-editor/helper";
  import { daysTimesDisp } from "@/lib/denshi-shohou/disp/disp-util";
  import type { DrugPrefab } from "@/lib/drug-prefab";

  export let drugPrefab: DrugPrefab;
  export let onSelect: (value: DrugPrefab) => void;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="group" on:click={() => onSelect(drugPrefab)}>
  <div>
    <div class="drug-rep">
      <span>{drugRep(drugPrefab.presc.薬品情報グループ[0])}</span>
    </div>
    <div class="usage-rep">
      {drugPrefab.presc.用法レコード.用法名称}
      {daysTimesDisp(drugPrefab.presc)}
      {#if drugPrefab.alias.length > 0}
        【別名】{drugPrefab.alias.join(" ")}
      {/if}
      {#if drugPrefab.tag.length > 0}
        【タグ】{drugPrefab.tag.join(" ")}
      {/if}
      {#if drugPrefab.comment !== ""}
        【コメント】{drugPrefab.comment}
      {/if}
    </div>
  </div>
</div>

<style>
  .drug-rep {
    cursor: pointer;
  }
</style>
