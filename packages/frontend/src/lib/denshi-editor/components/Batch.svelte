<script lang="ts">
  import Title from "./workarea/Title.svelte";
  import Workarea from "./workarea/Workarea.svelte";
  import Commands from "./workarea/Commands.svelte";
  import type { RP剤情報Edit } from "../denshi-edit";
  import { toZenkaku } from "@/lib/zenkaku";
  import { drugRep } from "../helper";

  export let groups: RP剤情報Edit[];
  export let onClose: () => void;
  export let onModified: () => void;
  
  function doClose() {
    onClose();
  }
</script>

<Workarea>
  <Title>選択操作</Title>
  <div class="groups">
    {#each groups as group, index (group.id)}
      <div>{toZenkaku(`${index + 1})`)}</div>
      <div>
        {#each group.薬品情報グループ as drug (drug.id)}
          <div class="drug-name">{drugRep(drug)}</div>
        {/each}
      </div>
    {/each}
  </div>
  <Commands>
    <button on:click={doClose}>閉じる</button>
  </Commands>
</Workarea>
