<script lang="ts">
  import type { Text, Visit } from "myclinic-model";

  export let text: Text;
  export let visit: Visit;

  function toHTML(c: string): string {
    return c.replaceAll(/\r?\n/g, "<br />\n");
  }
</script>

<div class="top">
  {@html toHTML(text.content)}
</div>

<style>
  .top {
    font-size: 14px;
  }
</style>