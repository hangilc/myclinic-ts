<script lang="ts">
  import Title from "./workarea/Title.svelte";
  import Workarea from "./workarea/Workarea.svelte";
  import Commands from "./workarea/Commands.svelte";
  import type { KouhiSet } from "../kouhi-set";
  import type { RP剤情報Edit, 薬品情報Edit } from "../denshi-edit";
  import { toZenkaku } from "@/lib/zenkaku";
  import { drugRep } from "../helper";
  import ChooseKouhiItem from "./ChooseKouhiItem.svelte";
  import Link from "./workarea/Link.svelte";

  export let kouhiSet: KouhiSet;
  export let groups: RP剤情報Edit[];
  export let onCancel: () => void;
  export let onEnter: () => void;

  function doEnter() {
    onEnter();
  }

  function doCancel() {
    onCancel();
  }

  function doAllDefault() {
    groups.forEach((group) => {
      group.薬品情報グループ.forEach(
        (drug) => (drug.負担区分レコード = undefined),
      );
    });
    groups = groups;
  }
</script>

<Workarea>
  <Title>公費選択</Title>
  <div class="groups">
    {#each groups as group, index (group.id)}
      <div>{toZenkaku(`${index + 1})`)}</div>
      <div>
        {#each group.薬品情報グループ as drug (drug.id)}
          <div class="drug-name">{drugRep(drug)}</div>
          <div>
            <ChooseKouhiItem {kouhiSet} {drug} />
          </div>
        {/each}
      </div>
    {/each}
  </div>
  <Commands>
    <Link onClick={doAllDefault}>全規定</Link>
    <button on:click={doEnter}>入力</button>
    <button on:click={doCancel}>キャンセル</button>
  </Commands>
</Workarea>

<style>
  .groups {
    display: grid;
    grid-template-columns: auto 1fr;
  }

  .drug-name {
    color: green;
  }
</style>
