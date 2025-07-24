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

  export let destroy: () => void;
  export let patientId: number;
  export let at: string;
  export let onEnter: (value: RP剤情報Edit[]) => void;
  let currentPage = 0;
  let allItems: [Text, Visit][] = [];
  let selectedItems: [Text, Visit][] = [];
  let pageItems: [Text, Visit][] = [];
  let itemsPerPage = 10;

  function doCancel(): void {
    destroy();
  }

  async function doEnter() {}

  setupAllItems();

  async function setupAllItems() {
    allItems = await getShohouHistory();
    selectedItems = allItems;
    currentPage = 0;
    pageItems = selectedItems.slice(0, itemsPerPage);
  }

  function filterPresc(text: Text): boolean {
    if( isShohousen(text.content)) {
      return true;
    }
    if( TextMemoWrapper.fromText(text).getMemoKind() === "shohou" ){
      return true;
    }
    return false;
  }

  async function getShohouHistory(): Promise<[Text, Visit][]> {
    try {
      const candidates = await api.listPrescForPatient(patientId, 1000, 0);
      console.log("candidates", candidates.slice(0, 10));
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
    console.log("doSelect", groups);
    const d: DrugSelectDialog = new DrugSelectDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        src: groups,
      }
    })
  }
</script>

<Workarea>
  <Title>過去の処方</Title>
  <div>
    <NavBar
      totalItems={allItems.length}
      bind:currentPage
      {itemsPerPage}
      onChange={doPageChange}
    />
    <PrescSearchList list={pageItems} {at} onSelect={doSelect}/>
    <NavBar
      totalItems={allItems.length}
      bind:currentPage
      {itemsPerPage}
      onChange={doPageChange}
    />
  </div>
  <Commands>
    <button on:click={doEnter}>入力</button>
    <button on:click={doCancel}>キャンセル</button>
  </Commands>
</Workarea>

<style>
</style>
