<script lang="ts">
  import { MeisaiObject, type Meisai, type VisitEx, 
    type Payment as ModelPayment } from "@/lib/model";
  import RightBox from "../../RightBox.svelte";
  import { setFocus } from "@/lib/set-focus"
  import { dateTimeToSql } from "@/lib/util"
    import api from "@/lib/api";

  export let visit: VisitEx;
  export let meisai: Meisai | null = null;
  export let onClose: () => void;
  let show = false;
  let chargeInput: HTMLInputElement;

  export function open(m: Meisai): void {
    meisai = m;
    show = true;
  }

  function close(){
    show = false;
    onClose();
  }

  async function doNoPayment() {
    const pay: ModelPayment = {
      visitId: visit.visitId,
      amount: 0,
      paytime: dateTimeToSql(new Date())
    };
    await api.finishCashier(pay);
    close();
  }
</script>

{#if show}
  <!-- svelte-ignore a11y-invalid-attribute -->
  <RightBox title="請求額の変更">
    {#if meisai != null}
      <div>
        <div>診療報酬総点 {MeisaiObject.totalTenOf(meisai)}点</div>
        <div>負担割 {meisai.futanWari}割</div>
        <div>現在の請求額 {visit.chargeOption?.charge || 0}円</div>
        <div>
          変更後請求額 <input
            type="text"
            bind:this={chargeInput}
            class="charge-input"
            use:setFocus
          />円
        </div>
      </div>
    {/if}
    <div class="commands">
      <a href="javascript:void(0)" on:click={doNoPayment}>未収に</a>
      <a href="javascript:void(0)">領収書PDF</a>
      <button>入力</button>
      <button on:click={close}>キャンセル</button>
    </div>
  </RightBox>
{/if}

<style>
  .commands {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .commands :global(a),
  .commands :global(button) {
    margin-left: 4px;
  }

  .charge-input {
    width: 5em;
  }
</style>
