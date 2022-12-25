<script lang="ts">
  import type { Readable } from "svelte/store";

  export let pct: Readable<number>;
</script>

<span>
  スキャン中... {$pct}%
</span>