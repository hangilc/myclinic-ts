<script lang="ts">
  import api from "@/lib/api";
  import { cache } from "@/lib/cache";
  import type { DrugDisease } from "@/lib/drug-disease";
  import EditDrugDiseaseDialog from "./drug-disease/EditDrugDiseaseDialog.svelte";
  import { DateWrapper } from "myclinic-util";

  export let onChanged: () => void;
  let drugDiseases: { id: number; data: DrugDisease }[] = [];
  let index = 1;
  let filterTextInput = "";
  let filterText = "";

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

  async function doDelete(item: { id: number; data: DrugDisease }) {
    if (confirm("この病名データを削除していいですか？")) {
      const dds = drugDiseases
        .filter((e) => e.id !== item.id)
        .map((e) => e.data);
      await api.setDrugDiseases(dds);
      cache.clearDrugDiseases();
      drugDiseases = [];
      init();
      onChanged();
    }
  }

  function resolveAt(): string {
    return DateWrapper.today().asSqlDate();
  }

  async function doEdit(item: { id: number; data: DrugDisease }) {
    const d: EditDrugDiseaseDialog = new EditDrugDiseaseDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        item: item.data,
        at: resolveAt(),
        onEnter: async (modified: DrugDisease) => {
          drugDiseases = drugDiseases.map((dd) => {
            return dd.id === item.id ? { id: item.id, data: modified } : dd;
          });
          const dds = drugDiseases.map((e) => e.data);
          await api.setDrugDiseases(dds);
          cache.clearDrugDiseases();
          onChanged();
        },
      },
    });
  }

  async function doNew() {
    const d: EditDrugDiseaseDialog = new EditDrugDiseaseDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        item: {
          drugName: "",
          diseaseName: "",
          fix: undefined,
        },
        at: resolveAt(),
        title: "薬剤病名の追加",
        onEnter: async (created: DrugDisease) => {
          drugDiseases = [...drugDiseases, { id: index++, data: created }];
          const dds = drugDiseases.map((e) => e.data);
          await api.setDrugDiseases(dds);
          cache.clearDrugDiseases();
          onChanged();
        },
      },
    });
  }

  function doFilter() {
    filterText = filterTextInput.trim();
    drugDiseases = drugDiseases;
  }
</script>

<div class="top-commands">
  <button on:click={doNew}>薬剤病名新規登録</button>
</div>
<div>
  <input style="width:8em" type="text" bind:value={filterTextInput}/><button
    style="margin-left:4px;"
    on:click={doFilter}>フィルター</button
  >
</div>
<div class="wrapper">
  <div class="items-wrapper">
    {#each drugDiseases as dd (dd.id)}
      {#if filterText === "" || dd.data.drugName.indexOf(filterText) >= 0}
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
      {/if}
    {/each}
  </div>
</div>

<style>
  .wrapper {
    height: 300px;
    overflow-y: auto;
    resize: vertical;
    margin-top: 10px;
  }

  .top-commands {
    margin-bottom: 10px;
  }

  .items-wrapper > hr:last-of-type {
    display: none;
  }

  .item {
    font-size: 12px;
  }
</style>
