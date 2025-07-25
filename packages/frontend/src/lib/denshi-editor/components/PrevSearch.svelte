<script lang="ts">
  import Title from "./workarea/Title.svelte";
  import Workarea from "./workarea/Workarea.svelte";
  import Commands from "./workarea/Commands.svelte";
  import { RP剤情報Edit } from "../denshi-edit";
  import type { Text, Visit } from "myclinic-model";
  import api from "@/lib/api";
  import { isShohousen } from "@/lib/shohousen/parse-shohousen";
  import PrescSearchList from "./presc-search/PrescSearchList.svelte";
  import NavBar from "./presc-search/nav-bar.svelte";
  import { TextMemoWrapper } from "@/lib/text-memo";
  import type { RP剤情報 } from "@/lib/denshi-shohou/presc-info";
  import DrugSelectDialog from "../DrugSelectDialog.svelte";
  import { parseShohou as parseShohou3 } from "@/lib/parse-shohou3";
  import { getRP剤情報FromGroup } from "../denshi-tmpl";
  import NameList from "./presc-search/NameList.svelte";

  export let destroy: () => void;
  export let patientId: number;
  export let at: string;
  export let onEnter: (value: RP剤情報Edit[]) => void;
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
      let memo = TextMemoWrapper.fromText(text).probeShohouMemo();
      if (memo) {
        handleGroups(memo.shohou.RP剤情報グループ);
      } else {
        const shohou = parseShohou3(text.content);
        if (typeof shohou !== "string") {
          let groups: RP剤情報[] = shohou.groups.map((g) =>
            getRP剤情報FromGroup(g),
          );
          handleGroups(groups);
        }
      }
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

  function doSelect(groups: RP剤情報[]) {
    const d: DrugSelectDialog = new DrugSelectDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        src: groups,
        onEnter: (groups: RP剤情報[]) => {
          let edit: RP剤情報Edit[] = groups.map((g) =>
            RP剤情報Edit.fromObject(g),
          );
          onEnter(edit);
        },
      },
    });
  }

  async function doNameList() {
    if( showNameList ){
      showNameList = false;
    } else {
      if( drugNames === undefined ){
        drugNames = await listNames(allItems);
      }
      showNameList = true;
    }
  }

  function doNameClick(name: string) {
    selectedDrugName = name;
    
  }
</script>

<Workarea>
  <Title>過去の処方</Title>
  <div>
    <div class="top-nav-bar">
      <div class="nav-bar-wrapper">
        <NavBar
          totalItems={allItems.length}
          bind:currentPage
          {itemsPerPage}
          onChange={doPageChange}
        />
      </div>
      <button on:click={doNameList}>薬剤リスト</button>
    </div>
    {#if showNameList}
      <NameList nameList={drugNames} onClick={doNameClick}/>
    {/if}
    <PrescSearchList list={pageItems} {at} onSelect={doSelect} />
    <NavBar
      totalItems={allItems.length}
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
