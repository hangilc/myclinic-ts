<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";

  export let destroy: () => void;
  export let drugName: string;

</script>

<Dialog title="薬剤の病名追加" {destroy}>
  <div>{drugName}</div>
</Dialog>