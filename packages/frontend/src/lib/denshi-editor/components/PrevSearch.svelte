<script lang="ts">
  import Title from "./workarea/Title.svelte";
  import Workarea from "./workarea/Workarea.svelte";
  import Commands from "./workarea/Commands.svelte";
  import { RP剤情報Edit } from "../denshi-edit";
  import type { Text, Visit } from "myclinic-model";
  import api from "@/lib/api";
  import { isShohousen } from "@/lib/shohousen/parse-shohousen";
  import PrescSearchList from "./presc-search/PrescSearchList.svelte";

  export let destroy: () => void;
  export let patientId: number;
  export let onEnter: (value: RP剤情報Edit[]) => void;
  let list: [Text, Visit][] = [];

  function doCancel(): void {
    destroy();
  }

  async function doEnter() {}

  setupList();

  async function setupList() {
    list = await getShohouHistory();
  }

  async function getShohouHistory(): Promise<[Text, Visit][]> {
    try {
      const candidates = await api.listPrescForPatient(
        patientId,
        1000,
        0,
      );
      let prescTexts = candidates.filter(([t, _v]) => isShohousen(t.content));
      console.log("texts", prescTexts.slice(0, 3))
      return prescTexts;
    } catch (error) {
      console.error("Failed to load prescription history:", error);
      alert("処方履歴の読み込みに失敗しました。");
      return [];
    }
  }
</script>

<Workarea>
  <Title>過去の処方</Title>
  <div>
    <PrescSearchList {patientId} />
  </div>
  <Commands>
    <button on:click={doEnter}>入力</button>
    <button on:click={doCancel}>キャンセル</button>
  </Commands>
</Workarea>

<style>
</style>
