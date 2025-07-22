<script lang="ts">
  import type { Text, Visit } from "myclinic-model";
  import api from "@/lib/api";
  import PaperShohouItem from "./PaperShohouItem.svelte";

  export let list: [Text, Visit][] = [];

</script>

<div>
  {#each list as [text, visit] (text.textId)}
    <PaperShohouItem {text} {visit} />
  {/each}
</div>
