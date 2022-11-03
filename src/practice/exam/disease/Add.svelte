<script lang="ts">
  import EditableDate from "@/lib/editable-date/EditableDate.svelte";
  import api from "@/lib/api";
  import {
    isDiseaseExample,
    type ByoumeiMaster,
    type DiseaseEnterData,
    type DiseaseExample,
    type ShuushokugoMaster,
  } from "@/lib/model";
  import {
    isByoumeiMaster,
    isShuushokugoMaster,
    DiseaseExampleObject,
  } from "@/lib/model";
  import { type Writable, writable } from "svelte/store";
  import SelectItem from "@/lib/SelectItem.svelte";
  import { genid } from "@/lib/genid";
  import { dateParam } from "@/lib/date-param";

  export let patientId: number;
  export let examples: DiseaseExample[];
  type SearchKind = "byoumei" | "shuushokugo";
  interface SearchResult {
    label: string;
    data: ByoumeiMaster | ShuushokugoMaster | DiseaseExample;
  }
  let startDate: Date = new Date();
  let byoumeiMaster: ByoumeiMaster | null = null;
  let adjList: ShuushokugoMaster[] = [];
  let searchText: string = "";
  let searchResult: SearchResult[] = [];
  let searchSelect: Writable<
    ByoumeiMaster | ShuushokugoMaster | DiseaseExample | null
  > = writable(null);
  searchSelect.subscribe(async (r) => {
    if (isByoumeiMaster(r)) {
      byoumeiMaster = r;
    } else if (isShuushokugoMaster(r)) {
      const cur = adjList;
      cur.push(r);
      adjList = cur;
    } else if (isDiseaseExample(r)) {
      if (r.byoumei != null) {
        const m = await api.resolveByoumeiMasterByName(r.byoumei, startDate);
        if (m != null) {
          byoumeiMaster = m;
        }
      }
      [...r.preAdjList, ...r.postAdjList].forEach(async (name) => {
        const m = await api.resolveShuushokugoMasterByName(name, startDate);
        const cur = adjList;
        cur.push(m);
        adjList = cur;
      });
    }
  });
  let searchKind: SearchKind = "byoumei";
  let byoumeiId: string = genid();
  let shuushokugoId: string = genid();

  async function doSearch() {
    const t = searchText.trim();
    if (t !== "" && startDate != null) {
      if (searchKind === "byoumei") {
        searchResult = (await api.searchByoumeiMaster(t, startDate)).map(
          (m) => ({
            label: m.name,
            data: m,
          })
        );
      } else if (searchKind === "shuushokugo") {
        searchResult = (await api.searchShuushokugoMaster(t, startDate)).map(
          (m) => ({
            label: m.name,
            data: m,
          })
        );
      }
    }
  }

  async function doEnter() {
    if (byoumeiMaster != null && patientId != null) {
      const data: DiseaseEnterData = {
        patientId: patientId,
        byoumeicode: byoumeiMaster.shoubyoumeicode,
        startDate: dateParam(startDate),
        adjCodes: adjList.map((m) => m.shuushokugocode),
      };
      await api.enterDiseaseEx(data);
    }
  }

  async function doSusp() {
    const m = await api.resolveShuushokugoMasterByName("の疑い", startDate);
    if (m != null) {
      const cur = adjList;
      cur.push(m);
      adjList = cur;
    }
  }

  function doDelSusp(): void {
    adjList = [];
  }

  function doExample(): void {
    searchResult = examples.map((e) => {
      return {
        label: DiseaseExampleObject.repr(e),
        data: e,
      };
    });
  }
</script>

<div>
  <div>
    名称：{byoumeiMaster?.name || ""}{adjList.map((m) => m.name).join("")}
  </div>
  <div>
    <EditableDate bind:date={startDate}>
      <svelte:fragment slot="icons">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="choice-icon"
          width="1.2em"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
      </svelte:fragment>
    </EditableDate>
  </div>
  <div>
    <button on:click={doEnter}>入力</button>
    <a href="javascript:void(0)" on:click={doSusp}>の疑い</a>
    <a href="javascript:void(0)" on:click={doDelSusp}>修飾語削除</a>
  </div>
  <div>
    <form class="search-form" on:submit|preventDefault={doSearch}>
      <input type="text" class="search-text-input" bind:value={searchText} />
      <button type="submit">検索</button>
    </form>
    <a href="javascript:void(0)" on:click={doExample}>例</a>
  </div>
  <div>
    <input
      type="radio"
      bind:group={searchKind}
      value="byoumei"
      id={byoumeiId}
    />
    <label for={byoumeiId}>病名</label>
    <input
      type="radio"
      bind:group={searchKind}
      value="shuushokugo"
      id={shuushokugoId}
    />
    <label for={shuushokugoId}>修飾語</label>
  </div>
  <div>
    <div class="search-result select">
      {#each searchResult as r}
        <SelectItem selected={searchSelect} data={r.data}>
          <div>{r.label}</div>
        </SelectItem>
      {/each}
    </div>
  </div>
</div>

<style>
  .choice-icon {
    color: gray;
    cursor: pointer;
  }

  .search-form {
    display: inline-block;
  }

  .search-text-input {
    width: 8em;
  }

  .search-result {
    height: 8em;
    overflow-y: auto;
  }
</style>
