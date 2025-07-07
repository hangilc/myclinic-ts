<script lang="ts">
  import type { TopTmpl } from "../denshi-tmpl";

  export let onCancel: () => void;
</script>

<div>
  <button on:click={onCancel}>キャンセル</button>
</div>