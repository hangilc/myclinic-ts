<script lang="ts">
  import Dialog2 from "../Dialog2.svelte";

  export let destroy: () => void;
  export let message: string;
  export let title = "確認";
  export let text1 = "";
  export let text2 = "";
  export let text3 = "";
  export let text4 = "";
</script>

<Dialog2 {title} {destroy}>
  <div>{message}</div>
  <div class="commands">
    {#if text1 !== ""}
      <button>{text1}</button>
    {/if}
    {#if text2 !== ""}
      <button>{text2}</button>
    {/if}
    {#if text3 !== ""}
      <button>{text3}</button>
    {/if}
    {#if text4 !== ""}
      <button>{text4}</button>
    {/if}
  </div>
</Dialog2>

<style>
  .commands {
    text-align: right;
  }
</style>
