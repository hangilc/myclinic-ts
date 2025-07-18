<script lang="ts">
  import Title from "./components/workarea/Title.svelte";
  import Workarea from "./components/workarea/Workarea.svelte";
import type { 備考レコードEdit } from "./denshi-edit";

  export let bikou: 備考レコードEdit[] | undefined;
</script>

<Workarea>
  <Title>備考</Title>
  {#each (bikou ?? []) as record (record.id) }
  {/each}
</Workarea>