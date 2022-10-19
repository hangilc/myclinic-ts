<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import CheckLabel from "@/lib/CheckLabel.svelte";
  import api from "@/lib/api";
  import {
    ConductKind,
    type CreateConductRequest,
    type VisitEx,
  } from "@/lib/model";
  import { partition, partitionConv } from "@/lib/partition";

  export let names: Record<string, string[]>;
  export let visit: VisitEx;
  let dialog: Dialog;

  interface Item {
    name: string;
    checked: boolean;
  }

  let leftItems: Item[] = [];
  let rightItems: Item[] = [];
  let bottomItems: Item[] = [];

  $: {
    leftItems = names.left.map((name) => ({ name, checked: false }));
    rightItems = names.right.map((name) => ({ name: name, checked: false }));
    bottomItems = names.bottom.map((name) => ({ name: name, checked: false }));
  }

  export function open(): void {
    leftItems.forEach((item) => (item.checked = false));
    rightItems.forEach((item) => (item.checked = false));
    bottomItems.forEach((item) => (item.checked = false));
    dialog.open();
  }

  async function kotsuenReq(
    at: string
  ): Promise<CreateConductRequest | string[]> {
    const notFound: string[] = [];
    const shinryoucode = await api.resolveShinryoucodeByName(
      "骨塩定量ＭＤ法",
      at
    );
    if (shinryoucode == null) {
      notFound.push("骨塩定量ＭＤ法");
    }
    const kizaicode = await api.resolveKizaicodeByName("四ツ切", at);
    if (kizaicode == null) {
      notFound.push("四ツ切");
    }
    if (notFound.length !== 0) {
      return notFound;
    }
    return {
      visitId: visit.visitId,
      kind: ConductKind.Gazou.code,
      labelOption: "骨塩定量に使用",
      shinryouList: [
        {
          conductShinryouId: 0,
          conductId: 0,
          shinryoucode: shinryoucode,
        },
      ],
      drugs: [],
      kizaiList: [
        {
          conductKizaiId: 0,
          conductId: 0,
          kizaicode: kizaicode,
          amount: 1,
        },
      ],
    };
  }

  async function doEnter(close: () => void) {
    const at: string = visit.visitedAt.substring(0, 10);
    const selectedNames: string[] = [
      ...leftItems,
      ...rightItems,
      ...bottomItems,
    ]
      .filter((item) => item.checked)
      .map((item) => item.name);
    const [regularNames, conductNames] = partition(
      selectedNames,
      (name) => name !== "骨塩定量"
    );
    const codeOpts: (number | null)[] = await Promise.all(
      regularNames.map(async (name) => api.resolveShinryoucodeByName(name, at))
    );
    const codes: number[] = [];
    const notFounds: string[] = [];
    for (let i = 0; i < regularNames.length; i++) {
      const c = codeOpts[i];
      if (c == null) {
        notFounds.push(regularNames[i]);
      } else {
        codes.push(c);
      }
    }
    const conducts: CreateConductRequest[] = [];
    await Promise.all(
      conductNames.map(async (conductName) => {
        if (conductName === "骨塩定量") {
          const req = await kotsuenReq(at);
          if (Array.isArray(req)) {
            notFounds.push(...req);
          } else {
            conducts.push(req);
          }
        } else {
          notFounds.push(conductName);
        }
      })
    );
    if (notFounds.length !== 0) {
      alert("Not found: " + notFounds.join(" "));
      return;
    }
    const req = {
      shinryouList: codes.map((c) => ({
        shinryouId: 0,
        visitId: visit.visitId,
        shinryoucode: c,
      })),
      conducts: conducts,
    };
    await api.batchEnterShinryouConduct(req);
  }
</script>

<Dialog bind:this={dialog} let:close width={null}>
  <span slot="title">診療行為入力</span>
  <div class="two-cols">
    <div class="left">
      {#each leftItems as item}
        {#if item.name.startsWith("---")}
          <div class="leading" />
        {:else}
          <div>
            <CheckLabel
              label={item.name}
              checked={(checked) => (item.checked = checked)}
            />
          </div>
        {/if}
      {/each}
    </div>
    <div class="right">
      {#each rightItems as item}
        {#if item.name.startsWith("---")}
          <div class="leading" />
        {:else}
          <div>
            <CheckLabel
              label={item.name}
              checked={(checked) => (item.checked = checked)}
            />
          </div>
        {/if}
      {/each}
    </div>
    <div class="bottom-wrapper">
      <div class="bottom">
        {#each bottomItems as item}
          <div>
            <CheckLabel
              label={item.name}
              checked={(checked) => (item.checked = checked)}
            />
          </div>
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
