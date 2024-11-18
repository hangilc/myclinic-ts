<script lang="ts">
  import api from "@/lib/api";
  import { cache } from "@/lib/cache";
  import type { DrugDisease } from "@/lib/drug-disease";
  import EditDrugDiseaseDialog from "./EditDrugDiseaseDialog.svelte";
  import type { Writable } from "svelte/store";
  import type { DiseaseEnv } from "./disease-env";
  import { DateWrapper } from "myclinic-util";

  export let env: Writable<DiseaseEnv | undefined>;
  export let onChanged: () => void;
  let drugDiseases: { id: number; data: DrugDisease }[] = [];
  let index = 1;

  init();

  async function init() {
    drugDiseases = (await cache.getDrugDiseases()).map((dd) => ({
      id: index++,
      data: dd,
    }));
  }

  function fixName(fix: {
    pre: string[];
    name: string;
    post: string[];
  }): string {
    return [...fix.pre, fix.name, ...fix.post].join("");
  }

  async function doDelete(item: { id: number, data: DrugDisease}) {
    if( confirm("この病名データを削除していいですか？") ){
      const dds = drugDiseases.filter(e => e.id !== item.id).map(e => e.data);
      await api.setDrugDiseases(dds);
      cache.clearDrugDiseases();
      drugDiseases = [];
      init();
      onChanged();
    }
  }

  function resolveAt(): string {
    let at = $env?.lastVisit?.visitedAt.substring(0, 10);
    if( at == undefined ){
      at = DateWrapper.from(new Date()).asSqlDate();
    }
    return at;
  }

  async function doEdit(item: { id: number, data: DrugDisease}) {
    const d: EditDrugDiseaseDialog = new EditDrugDiseaseDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        item: item.data,
        at: resolveAt(),
        onEnter: async (modified: DrugDisease) => {
          drugDiseases = drugDiseases.map(dd => {
            return dd.id === item.id ? { id: item.id, data: modified } : dd;
          });
          const dds = drugDiseases.map(e => e.data);
          await api.setDrugDiseases(dds);
          cache.clearDrugDiseases();
          onChanged();
        }
      }
    })
  }
</script>

<div class="wrapper">
  <div class="items-wrapper">
    {#each drugDiseases as dd (dd.id)}
      <div class="item">
        <div>
          {dd.data.drugName} | {dd.data.diseaseName} |
          {#if dd.data.fix}
            {fixName(dd.data.fix)}
          {:else}
            （なし）
          {/if}
        </div>
        <div>
          <button on:click={() => doEdit(dd)}>編集</button>
          <button on:click={() => doDelete(dd)}>削除</button>
        </div>
      </div>
      <hr />
    {/each}
  </div>
</div>

<style>
  .wrapper {
    height: 300px;
    overflow-y: auto;
    resize: vertical;
  }

  .items-wrapper > hr:last-of-type {
    display: none;
  }

  .item {
    font-size: 12px;
  }
</style>
