<script lang="ts">
  import Link from "../ui/Link.svelte";
  import { cache } from "@/lib/cache";
  import {
    createPrescExampleData,
    type PrescExampleData,
  } from "./presc-example-data";
  import DrugGroupRep from "./components/DrugGroupRep.svelte";
  import type { RP剤情報, 薬品情報 } from "@/lib/denshi-shohou/presc-info";

  export let onSelect: (group: RP剤情報, drug: 薬品情報) => void;
  let list: PrescExampleData[] = [];
  let selected: PrescExampleData[] = [];


  load();

  async function load() {
    list = (await cache.getPrescExample()).map(createPrescExampleData);
  }

  function doShowAll() {
    selected = list;
  }

</script>

<Link onClick={doShowAll}>全例</Link>
<div class="list">
  {#each list as data (data.id)}
    <div class="group">
      <div><DrugGroupRep group={data.data} onSelect={onSelect} /></div>
      <div>{data.data.comment ?? ""}</div>
    </div>
  {/each}
</div>

<style>
  .list {
    max-height: 500px;
    overflow-y: auto;
  }

  .group {
    margin: 10px 10px 10px 0;
    border: 1px solid gray;
    padding: 6px;
  }
</style>
