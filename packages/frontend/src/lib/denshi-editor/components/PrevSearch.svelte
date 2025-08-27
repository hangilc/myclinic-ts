<script lang="ts">
  import Title from "./workarea/Title.svelte";
  import Workarea from "./workarea/Workarea.svelte";
  import Commands from "./workarea/Commands.svelte";
  import type { Text, Visit } from "myclinic-model";
  import api from "@/lib/api";
  import { isShohousen } from "@/lib/shohousen/parse-shohousen";
  import PrevSearchList from "./prev-search/PrevSearchList.svelte";
  import NavBar from "./prev-search/nav-bar.svelte";
  import { TextMemoWrapper } from "@/lib/text-memo";
  import type { RP剤情報 } from "@/lib/denshi-shohou/presc-info";
  import NameList from "./prev-search/NameList.svelte";
  import { textToDrugGroups } from "./prev-search/helper";
  import { resolveDrugGroupByMapAt } from "@/lib/drug-name-bind";
  import { type PrevSearchItem, textToPrevSearchItem } from "./prev-search/prev-search-item";

  export let destroy: () => void;
  export let patientId: number;
  export let at: string;
  export let onEnter: (value: RP剤情報[]) => void;
  let currentPage = 0;
  let allItems: [Text, Visit][] = [];
  let selectedItems: [Text, Visit][] = [];
  let pageItems: [Text, Visit][] = [];
  let itemsPerPage = 10;
  let showNameList = false;
  let drugNames: string[] | undefined = undefined;
  let selectedDrugName: string = "";

  function doClose(): void {
    destroy();
  }

  setupAllItems();

  async function setupAllItems() {
    allItems = await getShohouHistory();
    selectedItems = allItems;
    currentPage = 0;
    pageItems = selectedItems.slice(0, itemsPerPage);
  }

  async function listNames(items: [Text, Visit][]): Promise<string[]> {
    const names: string[] = [];
    const nameMap: Record<string, boolean> = {};
    const handleGroups = (groups: RP剤情報[]) => {
      for (let group of groups) {
        for (let drug of group.薬品情報グループ) {
          let name = drug.薬品レコード.薬品名称;
          if (name !== "" && !(name in nameMap)) {
            names.push(name);
            nameMap[name] = true;
          }
        }
      }
    };
    for (let [text, _] of items) {
      let groups = textToDrugGroups(text);
      handleGroups(groups);
    }
    return names;
  }

  function filterPresc(text: Text): boolean {
    if (isShohousen(text.content)) {
      return true;
    }
    if (TextMemoWrapper.fromText(text).getMemoKind() === "shohou") {
      return true;
    }
    return false;
  }

  async function getShohouHistory(): Promise<[Text, Visit][]> {
    try {
      const candidates = await api.listPrescForPatient(patientId, 1000, 0);
      let prescTexts = candidates.filter(([t, _v]) => filterPresc(t));
      return prescTexts;
    } catch (error) {
      console.error("Failed to load prescription history:", error);
      alert("処方履歴の読み込みに失敗しました。");
      return [];
    }
  }

  function doPageChange(page: number) {
    currentPage = page;
    pageItems = selectedItems.slice(
      currentPage * itemsPerPage,
      (currentPage + 1) * itemsPerPage,
    );
  }

  async function doSelect(groups: RP剤情報[]) {
    await Promise.all(groups.map(group  => resolveDrugGroupByMapAt(group, at)));
    onEnter(groups);
  }

  async function doNameList() {
    if (showNameList) {
      showNameList = false;
    } else {
      if (drugNames === undefined) {
        drugNames = await listNames(allItems);
      }
      showNameList = true;
    }
  }

  function selectDrug(name: string) {
    selectedItems = allItems.filter(([t, _v]) => {
      let groups = textToDrugGroups(t);
      for (let group of groups) {
        for (let drug of group.薬品情報グループ) {
          if (drug.薬品レコード.薬品名称 === name) {
            return true;
          }
        }
      }
      return false;
    });
  }

  function doNameClick(name: string) {
    currentPage = 0;
    selectedDrugName = name;
    selectDrug(name);
    doPageChange(0);
    showNameList = false;
  }

  function convToItems(list: [Text, Visit][]): PrevSearchItem[] {
    return list.map(([t, v]) => textToPrevSearchItem(t, v));
  }
</script>

<Workarea>
  <Title>過去の処方</Title>
  <div>
    <div class="top-nav-bar">
      <div class="nav-bar-wrapper">
        <NavBar
          totalItems={selectedItems.length}
          bind:currentPage
          {itemsPerPage}
          onChange={doPageChange}
        />
      </div>
      <button on:click={doNameList}>薬剤リスト</button>
    </div>
    {#if showNameList}
      <NameList nameList={drugNames} onClick={doNameClick} />
    {/if}
    <PrevSearchList
      items={convToItems(pageItems)}
      onSelect={doSelect}
      selectedName={selectedDrugName}
    />
    <NavBar
      totalItems={selectedItems.length}
      bind:currentPage
      {itemsPerPage}
      onChange={doPageChange}
    />
  </div>
  <Commands>
    <button on:click={doClose}>閉じる</button>
  </Commands>
</Workarea>

<style>
  .nav-bar-wrapper {
    display: inline-block;
  }
  .top-nav-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
