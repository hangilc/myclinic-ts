<script lang="ts">
  import type { Readable } from "svelte/store";

  export let pct: number;
</script>

<span>
  スキャン中... {pct}%
</span>