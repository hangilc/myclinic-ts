<script lang="ts">
  import Floating from "@/lib/Floating.svelte";
  import type { OnshiResult } from "onshi-result";

  export let destroy: () => void;
  export let result: OnshiResult;
</script>

<Floating title="顔認証完了" {destroy}>
  Floating
</Floating>

<style>
</style>
