<script lang="ts">
  import Dialog2 from "@/lib/Dialog2.svelte";
  import type { Text } from "myclinic-model";
  import type { RP剤情報 } from "../denshi-shohou/presc-info";

  export let destroy: () => void;
  export let text: Text
  let group: RP剤情報[] = [];

</script>

<Dialog2 title="薬剤選択" {destroy}>
  {#each group as g}
  GROUP
  {/each}
</Dialog2>