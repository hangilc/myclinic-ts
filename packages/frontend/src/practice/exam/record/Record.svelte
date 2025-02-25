<script lang="ts">
  import * as m from "myclinic-model";
  import Title from "./Title.svelte";
  import TwoCols from "./TwoCols.svelte";
  import Text from "./text/Text.svelte";
  import NewTextForm from "./text/NewTextForm.svelte";
  import Hoken from "./hoken/Hoken.svelte";
  import ShinryouMenu from "./shinryou/ShinryouMenu.svelte";
  import ShinryouWrapper from "./shinryou/ShinryouWrapper.svelte";
  import ConductMenu from "./conduct/ConductMenu.svelte";
  import ConductWrapper from "./conduct/ConductWrapper.svelte";
  import Payment from "./payment/Payment.svelte";
  import { afterUpdate } from "svelte";
  import { currentVisitId } from "../exam-vars";
  import DrugWrapper from "./drug/DrugWrapper.svelte";
  import api from "@/lib/api";
  import { cache } from "@/lib/cache";
  import { initPrescInfoData, initPrescInfoDataFromVisitId } from "@/lib/denshi-shohou/visit-shohou";
  import UnregisteredShohouDialog from "@/lib/denshi-shohou/UnregisteredShohouDialog.svelte";
  import { type PrescInfoData } from "@/lib/denshi-shohou/presc-info";
  import { TextMemoWrapper } from "./text/text-memo";
  import DenshiHenkanDialog from "./text/regular/DenshiHenkanDialog.svelte";

  export let visit: m.VisitEx;
  export let isLast: boolean;
  export let onLast: () => void;
  let showNewTextEditor = false;
  let onshiConfirmed: boolean | undefined = undefined;

  probeOnshi();

  // $: console.log("visit.texts", visit.texts);

  async function probeOnshi() {
    const onshi: m.Onshi | undefined = await api.findOnshi(visit.visitId);
    onshiConfirmed = !!onshi;
  }

  function createNewText(): m.Text {
    return new m.Text(0, visit.visitId, "");
  }

  afterUpdate(() => {
    if (isLast) {
      onLast();
    }
  });

  async function doNewShohouPrevVersion() {
    const clinicInfo = await cache.getClinicInfo();
    const shohou = initPrescInfoData(visit.asVisit, visit.patient, visit.hoken, clinicInfo);
    const d: UnregisteredShohouDialog = new UnregisteredShohouDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        title: "新規処方",
        shohou,
        onDelete: undefined,
        at: visit.visitedAt.substring(0, 10),
        onSave: async (shohou: PrescInfoData) => {
          const text = new m.Text(0, visit.visitId, "");
          TextMemoWrapper.setTextMemo(text, {
            kind: "shohou", shohou, prescriptionId: undefined
          });
          await api.enterText(text);
        },
        onRegistered: async (shohou: PrescInfoData, prescriptionId: string) => {
          const text = new m.Text(0, visit.visitId, "");
          TextMemoWrapper.setTextMemo(text, {
            kind: "shohou", shohou, prescriptionId: prescriptionId
          });
          await api.enterText(text);
        }
      }
    })
  }

  async function doNewShohou() {
    const data: PrescInfoData = await initPrescInfoDataFromVisitId(visit.visitId);
    const d: DenshiHenkanDialog = new DenshiHenkanDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        init: {
          kind: "denshi",
          data,
        },
        at: visit.visitedAt.substring(0, 10),
        kouhiList: visit.hoken.kouhiList,
        onEnter: function (data: PrescInfoData): void {
          throw new Error("Function not implemented.");
        },
        onCancel: function (): void {
          d.$destroy();
        }
      }
    })
  }
</script>

<div class="top" data-type="record" data-visit-id={visit.visitId}>
  <Title bind:visit />
  <TwoCols isCurrent={$currentVisitId === visit.visitId}>
    <div slot="left">
      {#each visit.texts as text, i (text.textId)}
        <Text {text} index={i} at={visit.visitedAt.substring(0, 10)} kouhiList={visit.hoken.kouhiList} />
      {/each}
      {#if showNewTextEditor}
        <NewTextForm
          visitId={visit.visitId}
          onClose={() => (showNewTextEditor = false)}
        />
      {:else}
        <div>
          <a
            href="javascript:void(0)"
            on:click={() => (showNewTextEditor = true)}>新規文章</a
          >
          <a href="javascript:void(0)" on:click={doNewShohouPrevVersion}>新規処方（旧）</a>
          <a href="javascript:void(0)" on:click={doNewShohou}>新規処方</a>
        </div>
      {/if}
    </div>
    <div slot="right">
      <Hoken bind:visit {onshiConfirmed} />
      <ShinryouMenu {visit} />
      <ShinryouWrapper {visit} />
      <DrugWrapper {visit} />
      <ConductMenu {visit} />
      <ConductWrapper conducts={visit.conducts} {visit} />
      <Payment {visit} />
    </div>
  </TwoCols>
</div>

<style>
  .top {
    margin-bottom: 10px;
  }
</style>
