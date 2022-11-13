<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import CheckLabel from "@/lib/CheckLabel.svelte";
  import {
    ConductKind,
    type VisitEx,
  } from "myclinic-model";
  import { partitionConv } from "@/lib/partition";
  import { type ConductSpec, enter } from "./helper";

  export let visit: VisitEx;
  let dialog: Dialog;

  interface Item {
    label: string;
    checked: boolean;
  }

  let leftItems: Item[] = [];
  let rightItems: Item[] = [];
  let bottomItems: Item[] = [];

  function setupItems(names: Record<string, string[]>): void {
    leftItems = names.left.map((name) => ({ label: name, checked: false }));
    rightItems = names.right.map((name) => ({ label: name, checked: false }));
    bottomItems = names.bottom.map((name) => ({ label: name, checked: false }));
  }

  export function open(names: Record<string, string[]>): void {
    setupItems(names);
    dialog.open();
  }

  type ConductReqKey = "骨塩定量";

  const conductReqMap: Record<ConductReqKey, ConductSpec> = {
    骨塩定量: {
      kind: ConductKind.Gazou,
      labelOption: "骨塩定量に使用",
      shinryou: ["骨塩定量ＭＤ法"],
      drug: [],
      kizai: [{ code: "四ツ切", amount: 1 }],
    },
  };

  async function doEnter(close: () => void) {
    const selectedNames: string[] = [
      ...leftItems,
      ...rightItems,
      ...bottomItems,
    ]
      .filter((item) => item.checked)
      .map((item) => item.label);
    const [regularNames, conductSpecs] = partitionConv<string, string, ConductSpec>(
      selectedNames,
      (name) => !(name in conductReqMap),
      name => name,
      name => conductReqMap[name]
    );
    try {
      await enter(visit, regularNames, conductSpecs);
      close();
    } catch(ex) {
      alert(ex.toString());
    }
  }
</script>

<Dialog bind:this={dialog} let:close width={null}>
  <span slot="title">診療行為入力</span>
  <div class="two-cols">
    <div class="left">
      {#each leftItems as item}
        {#if item.label.startsWith("---")}
          <div class="leading" />
        {:else}
          <div><CheckLabel bind:checked={item.checked} label={item.label} /></div>
        {/if}
      {/each}
    </div>
    <div class="right">
      {#each rightItems as item}
        {#if item.label.startsWith("---")}
          <div class="leading" />
        {:else}
          <div><CheckLabel bind:checked={item.checked} label={item.label}/></div>
        {/if}
      {/each}
    </div>
    <div class="bottom-wrapper">
      <div class="bottom">
        {#each bottomItems as item}
          <div><CheckLabel bind:checked={item.checked} label={item.label}/></div>
        {/each}
      </div>
    </div>
  </div>
  <svelte:fragment slot="commands">
    <button on:click={() => doEnter(close)}>入力</button>
    <button on:click={close}>キャンセル</button>
  </svelte:fragment>
</Dialog>

<style>
  .two-cols {
    display: grid;
    grid-template-columns: 10em 20em;
  }

  .left {
    padding-right: 5px;
  }

  .leading {
    height: 1em;
  }

  .right {
    padding-left: 5px;
  }

  .bottom-wrapper {
    grid-column-start: 1;
    grid-column-end: 3;
    display: flex;
    justify-content: center;
  }
</style>
