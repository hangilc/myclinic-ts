<script lang="ts">
  import { Hoken, type HokenType } from "./hoken";
  import type { PatientData } from "./patient-data";
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import ShahokokuhoForm from "./edit/ShahokokuhoForm.svelte";
  import { Kouhi, Koukikourei, Shahokokuho } from "myclinic-model";
  import api from "@/lib/api";
  import KoukikoureiForm from "./edit/KoukikoureiForm.svelte";
  import KouhiForm from "./edit/KouhiForm.svelte";
  import { strToHokenTypeRep } from "./str-to-hoken-type-rep";
  import type { SvelteComponent } from "svelte";

  export let data: PatientData;
  export let hoken: Hoken | string;
  export let destroy: () => void;
  let hokenTmpl: Hoken | undefined = hoken instanceof Hoken ? hoken : undefined;
  let errors: string[] = [];
  let hokenTypeRep: string =
    typeof hoken === "string" ? strToHokenTypeRep(hoken) : hoken.name;

  function isCreation(): boolean {
    return typeof hoken === "string" || hoken.hokenId === 0;
  }

  let title: string = isCreation()
    ? `新規${hokenTypeRep}`
    : `${hokenTypeRep}編集`;

  let hokenTypeSlug: string = hoken instanceof Hoken ? hoken.slug : hoken;

  function getComp(slug: string): typeof SvelteComponent | undefined {
    switch (slug) {
      case "shahokokuho":
        return ShahokokuhoForm;
      case "koukikourei":
        return KoukikoureiForm;
      case "kouhi":
        return KouhiForm;
      default:
        return undefined;
    }
  }

  let comp = getComp(hokenTypeSlug);

  function exit(): void {
    destroy();
    data.exit();
  }

  function close(): void {
    console.log("closing edit hoken", data.stack);
    destroy();
    console.log("closing edit hoken (before goback)", data.stack);
    data.goback();
  }

  let validate: () => HokenType | string[];

  async function enterHoken(ht: HokenType) {
    if (ht instanceof Shahokokuho) {
      await api.enterShahokokuho(ht);
    } else if (ht instanceof Koukikourei) {
      await api.enterKoukikourei(ht);
    } else if (ht instanceof Kouhi) {
      await api.enterKouhi(ht);
    } else {
      throw new Error("Cannot enter hoken: " + ht);
    }
  }

  async function updateHoken(ht: HokenType) {
    if (ht instanceof Shahokokuho) {
      await api.updateShahokokuho(ht);
    } else if (ht instanceof Koukikourei) {
      await api.updateKoukikourei(ht);
    } else if (ht instanceof Kouhi) {
      await api.updateKouhi(ht);
    } else {
      throw new Error("Cannot update hoken: " + ht);
    }
  }

  async function doEnter() {
    const result: HokenType | string[] = validate();
    if (Array.isArray(result)) {
      errors = result;
    } else {
      if (isCreation()) {
        await enterHoken(result);
        data.hokenCache.enterHokenType(result);
      } else {
        await updateHoken(result);
        data.hokenCache.updateWithHokenType(result);
      }
      close();
    }
  }
</script>

<SurfaceModal destroy={exit} {title}>
  {#if errors.length > 0}
    <div class="error">
      {#each errors as e}
        <div>{e}</div>
      {/each}
    </div>
  {/if}
  <svelte:component
    this={comp}
    hoken={hokenTmpl?.value}
    bind:validate
    patient={data.patient}
  />
  <div class="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={close}>キャンセル</button>
  </div>
</SurfaceModal>

<style>
  .error {
    color: red;
  }

  .commands {
    display: flex;
    justify-content: right;
    align-items: center;
    margin-top: 10px;
  }

  .commands > * + * {
    margin-left: 4px;
  }
</style>
