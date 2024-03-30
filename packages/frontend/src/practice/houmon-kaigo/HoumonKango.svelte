<script lang="ts">
  import SearchPatientDialog from "@/lib/SearchPatientDialog.svelte";
  import DrawerDialog from "@/lib/drawer/DrawerDialog.svelte";
  import DrawerSvg from "@/lib/drawer/DrawerSvg.svelte";
  import type { Op } from "@/lib/drawer/compiler/op";
  import { drawHoumonKango } from "@/lib/drawer/forms/houmon-kango/houmon-kango-drawer";
  import EditableDate from "@/lib/editable-date/EditableDate.svelte";
  import type { Patient } from "myclinic-model";

  export let isVisible: boolean;
  let patient: Patient | undefined = undefined;
  let startDate: Date | null = null;
  let uptoDate: Date | null = null;
  let issueDate: Date = new Date();

  function doSelectPatient() {
    const d: SearchPatientDialog = new SearchPatientDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        title: "患者選択",
        onEnter: (selected: Patient) => {
          patient = selected;
        }
      },
    });
  }

  function doCreate() {
    const ops = drawHoumonKango({});
    const d: DrawerDialog = new DrawerDialog({
      target: document.body,
      props: {
        ops,
        destroy: () => d.$destroy(),
        width: 210 * 1.5,
        height: 297*1.5,
        viewBox: "0 0 210 297",
        scale: 1.5,
      }
    })
  }
</script>

{#if isVisible}
  <div class="title">訪問看護</div>
  <div>
    {#if patient === undefined}
      <button on:click={doSelectPatient}>患者選択</button>
    {:else}
      <button>患者終了</button>
    {/if}
  </div>
  {#if patient}
    <div>
      患者：{patient.lastName} {patient.firstName}
    </div>
    <div>
      開始日：<EditableDate bind:date={startDate}/>
      終了日：<EditableDate bind:date={uptoDate}/>
    </div>
    <div>
      発行日：<EditableDate bind:date={issueDate} />
    </div>
      <button on:click={doCreate}>作成</button>
  {/if}
{/if}

<style>
  .title {
    font-size: 1.5rem;
    margin-bottom: 10px;
  }
</style>
