<script lang="ts">
  import { DateWrapper } from "myclinic-util";
  import Label from "./leftarea/Label.svelte";
import LeftArea from "./leftarea/LeftArea.svelte";

  export let validUpto: string | undefined
  export let onClick: () => void;

  function rep(value: string | undefined): string {
    if( value === undefined ){
      return "（設定なし）";
    } else {
      return DateWrapper.fromOnshiDate(value).render(d => 
      `${d.gengou}${d.nen}年${d.month}月${d.day}日`);
    }
  }
</script>

{#if validUpto}
  <LeftArea>
    <Label>有効期限</Label>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="rep" on:click={onClick}>{rep(validUpto)}</div>
  </LeftArea>
{/if}

<style>
  .rep {
    cursor: pointer;
  }
</style>