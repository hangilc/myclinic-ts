<script lang="ts">
  import type * as m from "../../../../lib/model"

  export let text: m.Text;

  function conv(s: string): string {
    return s.replaceAll("\n", "<br />\n");
  }
</script>

<div class="top">
  <div>{@html conv(text.content)}</div>
</div>

<style>
  .top {
    margin-bottom: 10px;
  }
</style>