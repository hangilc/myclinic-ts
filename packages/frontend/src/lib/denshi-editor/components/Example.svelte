<script lang="ts">
  import { RP剤情報Edit } from "../denshi-edit";

  export let destroy: () => void;
  export let onEnter: (value: RP剤情報Edit[]) => void;

  console.log("destroy", destroy, onEnter);
</script>

<!-- <script lang="ts">
  import type { PrescExample } from "@/lib/presc-example";
  import Commands from "./workarea/Commands.svelte";
  import Title from "./workarea/Title.svelte";
  import Workarea from "./workarea/Workarea.svelte";
  import { cache } from "@/lib/cache";
  import DrugGroupRep from "@/practice/presc-example/components/DrugPrefabRep.svelte";
  import type { RP剤情報 } from "@/lib/denshi-shohou/presc-info";
  import { resolveDrugGroupByMap, resolveUsageRecordByMap } from "@/practice/exam/record/text/regular/helper";
  import { RP剤情報Edit } from "../denshi-edit";

  export let destroy: () => void;
  export let onEnter: (value: RP剤情報Edit[]) => void;
  let list: PrescExample[] = [];
  let selected: PrescExample[] = [];
  let searchText = "";

  load();

  async function load() {
    list = await cache.getPrescExample();
  }

  function doSearch() {
    let t = searchText.trim();
    if (t === "") {
      selected = list;
    } else {
      selected = list.filter((e) =>
        e.薬品情報グループ.some((d) =>
          d.薬品レコード.薬品名称.includes(searchText),
        ),
      );
    }
  }

  async function doSelect(group: RP剤情報, drugIndex: number) {
    group = Object.assign({}, group, {
      薬品情報グループ: [group.薬品情報グループ[drugIndex]],
    });
    resolveDrugGroupByMap(group);
    await resolveUsageRecordByMap(group.用法レコード);
    let data: RP剤情報Edit[] = [RP剤情報Edit.fromObject(group)];
    onEnter(data);
    searchText = "";
    selected = [];
  }
</script>

<Workarea>
  <Title>処方例</Title>
  <form on:submit|preventDefault={doSearch}>
    <input type="text" bind:value={searchText} />
    <button type="submit">検索</button>
  </form>
  <div>
    {#each selected as ex}
      <div class="group">
        <div>
          <DrugGroupRep group={ex} onSelect={doSelect} />
        </div>
        <div class="comment">
          {ex.comment ?? ""}
        </div>
      </div>
    {/each}
  </div>
  <Commands>
    <button on:click={destroy}>閉じる</button>
  </Commands>
</Workarea>

<style>
  form {
    margin: 10px 0;
  }

  .group {
    cursor: pointer;
    background-color: #eee;
    margin-bottom: 10px;
    border: 1px solid gray;
    padding: 6px;
  }
</style> -->
