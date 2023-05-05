<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import type { Koukikourei, Shahokokuho } from "myclinic-model";

  export let destroy: () => void;
  export let shahokokuhoOpt: Shahokokuho | undefined;
  export let koukikoureiOpt: Koukikourei | undefined;
</script>

<Dialog {destroy} title="保険選択">
  <form on:submit|preventDefault>

  </form>
</Dialog>

<style>
</style>
