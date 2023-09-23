<script lang="ts">
  import { ConductKind, type VisitEx } from "myclinic-model";
  import Widget from "@/lib/Widget.svelte"
  import { enter } from "../shinryou//helper"

  export let visit: VisitEx;
  let widget: Widget;
  const initLabel = "胸部単純Ｘ線"
  let label: string = initLabel;
  const initFilm = "大角";
  let film: string = initFilm;

  function onClose(): void {
    label = initLabel;
    film = initFilm;
  }

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

<Widget title="Ｘ線検査入力" bind:this={widget} {onClose}>
  <select bind:value={label}>
    <option>胸部単純Ｘ線</option>
    <option>腹部単純Ｘ線</option>
  </select>
  <select bind:value={film}>
    <option>大角</option>
    <option>四ツ切</option>
  </select>
  <svelte:fragment slot="commands" let:close>
    <button on:click={() => doEnter(close)}>入力</button>
    <button on:click={close}>キャンセル</button>
  </svelte:fragment>
</Widget>