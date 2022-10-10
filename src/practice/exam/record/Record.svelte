<script lang="ts">
  import * as m from "../../../lib/model";
  import Title from "./Title.svelte";
  import TwoCols from "./TwoCols.svelte";
  import Text from "./text/Text.svelte";
  import TextForm from "./text/TextForm.svelte";

  export let visit: m.VisitEx;
  let showNewTextEditor = false;

  function createNewText(): m.Text {
    return new m.Text(0, visit.visitId, "");
  }

</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<div class="top">
  <Title {visit} />
  <TwoCols>
    <div slot="left">
      {#each visit.texts as text, i (text.textId)}
        <Text text={text} index={i}/>
      {/each}
      {#if showNewTextEditor}
        <TextForm text={createNewText()} onClose={() => showNewTextEditor = false}/>
      {:else}
        <div>
          <a href="javascript:void(0)" on:click={() => showNewTextEditor = true}>新規文章</a>
        </div>
      {/if}
    </div>
  </TwoCols>
</div>

<style>
  .top {
    margin-bottom: 10px;
  }
</style>
