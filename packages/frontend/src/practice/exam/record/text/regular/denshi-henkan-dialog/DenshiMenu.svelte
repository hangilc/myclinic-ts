<script lang="ts">
  import ChevronDown from "@/icons/ChevronDown.svelte";
  import Plus from "@/icons/Plus.svelte";

  export let onPlus: () => void;
  export let on有効期限: () => void;
  export let on備考: () => void;
  export let on提供情報: () => void;
  let showAux = false;

  function toggleAux() {
    showAux = !showAux;
  }

  function invokeAux(f: () => void) {
    showAux = false;
    f();
  }
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<div>
  <div class="menu">
    <a href="javascript:void(0)" on:click={onPlus}>
      <Plus color="blue" />
    </a>
    <a href="javascript:void(0)" on:click={toggleAux}>
      <ChevronDown />
    </a>
  </div>
  {#if showAux}
    <div class="menu" style="margin-top:10px;">
      <a href="javascript:void(0)" on:click={() => invokeAux(on有効期限)}
        >有効期限</a
      >
      <a href="javascript:void(0)" on:click={() => invokeAux(on備考)}>備考</a>
      <a href="javascript:void(0)" on:click={() => invokeAux(on提供情報)}
        >提供情報</a
      >
    </div>
  {/if}
</div>
