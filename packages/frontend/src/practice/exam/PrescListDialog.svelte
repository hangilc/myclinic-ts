<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import PrescListItem from "./PrescListItem.svelte";

  export let destroy: () => void;
  export let list: {
    PrescriptionId: string;
    AccessCode: string;
    CreateDateTime: string;
  }[];
</script>

<Dialog title="処方履歴" {destroy}>
  <div style="max-height:300px;overflow-y:auto;">
    {#each list as item (item.PrescriptionId)}
      <PrescListItem {item} />
    {/each}
  </div>
</Dialog>
