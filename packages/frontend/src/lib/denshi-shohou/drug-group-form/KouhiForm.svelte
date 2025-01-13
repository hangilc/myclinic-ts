<script lang="ts">
  import type { 負担区分レコード } from "../presc-info";

  export let kouhiCount: number;
  export let 負担区分レコード: 負担区分レコード | undefined;
  export let onDone: (value: 負担区分レコード | undefined) => void;
</script>

