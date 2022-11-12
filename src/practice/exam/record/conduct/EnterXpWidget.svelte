<script lang="ts">
  import { ConductKind, type VisitEx } from "@/lib/model";
  import Widget from "@/lib/Widget.svelte"
  import { enter } from "../shinryou//helper"

  export let visit: VisitEx;
  let widget: Widget;
  let label: string;
  let film: string;

  export function open(): void {
    widget.open();
  }

  async function doEnter(close: () => void) {
    const c = {
      kind: ConductKind.Gazou,
      labelOption: label,
      shinryou: ["単純撮影", "単純撮影診断"],
      drug: [],
      kizai: [{
        code: film,
        amount: 1
      }]
    };
    await enter(visit, [], [c]);
    close();
  }

</script>

<Widget title="Ｘ線検査入力" let:close={close} bind:this={widget}>
  <select bind:value={label}>
    <option selected>胸部単純Ｘ線</option>
    <option>腹部単純Ｘ線</option>
  </select>
  <select bind:value={film}>
    <option selected>大角</option>
    <option>四ツ切</option>
  </select>
  <svelte:fragment slot="commands">
    <button on:click={() => doEnter(close)}>入力</button>
    <button on:click={close}>キャンセル</button>
  </svelte:fragment>
</Widget>