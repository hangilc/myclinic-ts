<script lang="ts">
  import type { Text, Visit } from "myclinic-model";
  import api from "@/lib/api";
  import PaperShohouItem from "./PaperShohouItem.svelte";

  export let patientId: number;
  let list: [Text, Visit][] = [];

  setShohouHistory();

  async function setShohouHistory() {
    try {
      list = await api.listPrescForPatient(patientId, 1000, 0);
    } catch (error) {
      console.error("Failed to load prescription history:", error);
      alert("処方履歴の読み込みに失敗しました。");
    }
  }
</script>

<div>
  {#each list as [text, visit] (text.textId)}
    <PaperShohouItem {text} {visit} />
  {/each}
</div>
